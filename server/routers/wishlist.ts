/**
 * Wishlist tRPC Router
 * Handles wishlist CRUD operations
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const wishlistRouter = router({
  // Get all wishlist items for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const wishlistItems = await ctx.prisma.wishlistItem.findMany({
      where: {
        userId: (ctx.session.user as any).id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return wishlistItems;
  }),

  // Add product to wishlist
  add: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Check if already in wishlist
      const existing = await ctx.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: (ctx.session.user as any).id,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        throw new Error("Product already in wishlist");
      }

      // Add to wishlist
      const wishlistItem = await ctx.prisma.wishlistItem.create({
        data: {
          userId: (ctx.session.user as any).id,
          productId: input.productId,
        },
        include: {
          product: true,
        },
      });

      return wishlistItem;
    }),

  // Remove product from wishlist
  remove: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: (ctx.session.user as any).id,
            productId: input.productId,
          },
        },
      });

      return { success: true };
    }),

  // Toggle wishlist (add if not exist, remove if exist)
  toggle: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: (ctx.session.user as any).id,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        // Remove from wishlist
        await ctx.prisma.wishlistItem.delete({
          where: {
            userId_productId: {
              userId: (ctx.session.user as any).id,
              productId: input.productId,
            },
          },
        });

        return { action: "removed", inWishlist: false };
      } else {
        // Add to wishlist
        await ctx.prisma.wishlistItem.create({
          data: {
            userId: (ctx.session.user as any).id,
            productId: input.productId,
          },
        });

        return { action: "added", inWishlist: true };
      }
    }),

  // Check if product is in wishlist
  isInWishlist: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const wishlistItem = await ctx.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: (ctx.session.user as any).id,
            productId: input.productId,
          },
        },
      });

      return { inWishlist: !!wishlistItem };
    }),
});
