/**
 * Product Router
 * Handles all product-related operations
 */

import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const productRouter = router({
  // Get all products (public)
  getAll: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, search, limit, cursor } = input;

      const products = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          isActive: true,
          ...(categoryId && { categoryId }),
          ...(search && {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: string | undefined = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products,
        nextCursor,
      };
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug },
        include: { category: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: { category: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Create product (admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        stock: z.number().int().min(0),
        images: z.array(z.string()).default([]),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: input,
      });
    }),

  // Update product (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.product.update({
        where: { id },
        data,
      });
    }),

  // Delete product (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.product.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get all categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Create category (admin only)
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: input,
      });
    }),


  // Toggle product active status (admin only)
  toggleActive: adminProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.prisma.product.update({
        where: { id: input.productId },
        data: { isActive: !product.isActive },
      });

      return { success: true };
    }),
});
