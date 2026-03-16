/**
 * Cart Router
 * Handles shopping cart operations
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const cartRouter = router({
  // Get user's cart
  get: protectedProcedure.query(async ({ ctx }) => {
    let cart = await ctx.prisma.cart.findUnique({
      where: { userId: (ctx.session.user as any).id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await ctx.prisma.cart.create({
        data: {
          userId: (ctx.session.user as any).id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }),

  // Add item to cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).default(1),
        variant: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if product exists and has stock
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (!product.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product is not available",
        });
      }

      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      // Get or create cart
      let cart = await ctx.prisma.cart.findUnique({
        where: { userId: (ctx.session.user as any).id },
      });

      if (!cart) {
        cart = await ctx.prisma.cart.create({
          data: { userId: (ctx.session.user as any).id },
        });
      }

      // Check if item already in cart (with same variant if applicable)
      const existingItems = await ctx.prisma.cartItem.findMany({
        where: {
          cartId: cart.id,
          productId: input.productId,
        },
      });

      // Find item with matching variant
      const existingItem = existingItems.find((item) => {
        if (!input.variant && !item.variant) return true; // Both no variants
        if (!input.variant || !item.variant) return false; // One has variant, one doesn't

        // Compare variants
        const itemVariant = item.variant as Record<string, string>;
        return JSON.stringify(itemVariant) === JSON.stringify(input.variant);
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + input.quantity;

        if (product.stock < newQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient stock",
          });
        }

        await ctx.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Add new item
        await ctx.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
            variant: input.variant || undefined,
          },
        });
      }

      return { success: true };
    }),

  // Update item quantity
  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cartItem = await ctx.prisma.cartItem.findUnique({
        where: { id: input.itemId },
        include: { product: true, cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== (ctx.session.user as any).id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      if (cartItem.product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      await ctx.prisma.cartItem.update({
        where: { id: input.itemId },
        data: { quantity: input.quantity },
      });

      return { success: true };
    }),

  // Remove item from cart
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cartItem = await ctx.prisma.cartItem.findUnique({
        where: { id: input.itemId },
        include: { cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== (ctx.session.user as any).id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      await ctx.prisma.cartItem.delete({
        where: { id: input.itemId },
      });

      return { success: true };
    }),

  // Clear cart
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: { userId: (ctx.session.user as any).id },
    });

    if (cart) {
      await ctx.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { success: true };
  }),
});
