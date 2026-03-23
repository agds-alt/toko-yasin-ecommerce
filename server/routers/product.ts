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
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc"]).optional().default("newest"),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, search, minPrice, maxPrice, sortBy, limit, cursor } = input;

      // Build orderBy based on sortBy
      let orderBy: any = { createdAt: "desc" }; // default: newest
      if (sortBy === "price_asc") orderBy = { price: "asc" };
      else if (sortBy === "price_desc") orderBy = { price: "desc" };
      else if (sortBy === "name_asc") orderBy = { name: "asc" };
      else if (sortBy === "name_desc") orderBy = { name: "desc" };

      const products = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          isActive: true,
          ...(categoryId && { categoryId }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        },
        include: {
          category: true,
        },
        orderBy,
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
        include: {
          category: true,
          variants: true,
        },
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
        include: {
          category: true,
          variants: true,
        },
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
        hasVariants: z.boolean().default(false),
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
        hasVariants: z.boolean().optional(),
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

  // Get homepage data (optimized - single endpoint for multiple queries)
  getHomepageData: publicProcedure
    .input(
      z.object({
        featuredLimit: z.number().min(1).max(20).default(8),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc"]).optional().default("newest"),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { featuredLimit, categoryId, search, minPrice, maxPrice, sortBy, limit } = input;

      // Build orderBy
      let orderBy: any = { createdAt: "desc" };
      if (sortBy === "price_asc") orderBy = { price: "asc" };
      else if (sortBy === "price_desc") orderBy = { price: "desc" };
      else if (sortBy === "name_asc") orderBy = { name: "asc" };
      else if (sortBy === "name_desc") orderBy = { name: "desc" };

      // Fetch all data in parallel
      const [products, categories, featuredProducts] = await Promise.all([
        // Main products
        ctx.prisma.product.findMany({
          take: limit,
          where: {
            isActive: true,
            ...(categoryId && { categoryId }),
            ...(search && {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
            ...(minPrice !== undefined && { price: { gte: minPrice } }),
            ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
          },
          include: {
            category: true,
          },
          orderBy,
        }),

        // Categories
        ctx.prisma.category.findMany({
          orderBy: { name: "asc" },
        }),

        // Featured/recommended products
        ctx.prisma.product.findMany({
          take: featuredLimit,
          where: { isActive: true },
          include: {
            category: true,
          },
          orderBy: [
            { reviewCount: "desc" },
            { averageRating: "desc" },
            { createdAt: "desc" },
          ],
        }),
      ]);

      return {
        products,
        categories,
        featuredProducts,
      };
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

  // ===== VARIANT MANAGEMENT =====

  // Add/Update variants for a product (admin only)
  updateVariants: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        hasVariants: z.boolean(),
        variants: z.array(
          z.object({
            name: z.string().min(1), // e.g., "Size", "Color"
            values: z.array(z.string().min(1)), // e.g., ["S", "M", "L"]
          })
        ),
      })
    )
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

      // Update product hasVariants flag
      await ctx.prisma.product.update({
        where: { id: input.productId },
        data: { hasVariants: input.hasVariants },
      });

      // Delete existing variants
      await ctx.prisma.productVariant.deleteMany({
        where: { productId: input.productId },
      });

      // Create new variants if hasVariants is true
      if (input.hasVariants && input.variants.length > 0) {
        await ctx.prisma.productVariant.createMany({
          data: input.variants.map((variant) => ({
            productId: input.productId,
            name: variant.name,
            values: variant.values,
          })),
        });
      }

      return { success: true };
    }),

  // Get variants for a product
  getVariants: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.productVariant.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: "asc" },
      });
    }),

  // ===== PRODUCT RECOMMENDATIONS =====

  // Get related products (same category)
  getRelatedProducts: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().min(1).max(20).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      const { productId, limit } = input;

      // Get current product to find its category
      const currentProduct = await ctx.prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true },
      });

      if (!currentProduct || !currentProduct.categoryId) {
        return [];
      }

      // Find products in the same category, excluding the current product
      const relatedProducts = await ctx.prisma.product.findMany({
        where: {
          categoryId: currentProduct.categoryId,
          id: { not: productId },
          isActive: true,
        },
        take: limit,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return relatedProducts;
    }),

  // Get personalized recommendations based on user history
  getRecommendations: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        productId: z.string().optional(), // For product page recommendations
        limit: z.number().min(1).max(20).default(8),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, productId, limit } = input;

      // Strategy 1: If viewing a product, recommend similar products
      if (productId) {
        const currentProduct = await ctx.prisma.product.findUnique({
          where: { id: productId },
          select: { categoryId: true, price: true },
        });

        if (currentProduct && currentProduct.categoryId) {
          // Find products in same category with similar price range (±30%)
          const priceMin = Number(currentProduct.price) * 0.7;
          const priceMax = Number(currentProduct.price) * 1.3;

          const recommendations = await ctx.prisma.product.findMany({
            where: {
              categoryId: currentProduct.categoryId,
              id: { not: productId },
              isActive: true,
              price: {
                gte: priceMin,
                lte: priceMax,
              },
            },
            take: limit,
            include: {
              category: true,
            },
            orderBy: [
              { averageRating: "desc" },  // Sort by rating first
              { reviewCount: "desc" },     // Then by review count
              { createdAt: "desc" },       // Then by newest
            ],
          });

          return recommendations;
        }
      }

      // Strategy 2: If user is logged in, recommend based on purchase/wishlist history
      if (userId) {
        // Get categories from user's order history
        const userOrders = await ctx.prisma.order.findMany({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  select: { categoryId: true },
                },
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        });

        // Get unique category IDs from order history
        const categoryIds = [
          ...new Set(
            userOrders.flatMap((order) =>
              order.items
                .map((item) => item.product.categoryId)
                .filter((id): id is string => id !== null)
            )
          ),
        ];

        if (categoryIds.length > 0) {
          // Get products from user's preferred categories
          const recommendations = await ctx.prisma.product.findMany({
            where: {
              categoryId: { in: categoryIds },
              isActive: true,
            },
            take: limit,
            include: {
              category: true,
            },
            orderBy: [
              { averageRating: "desc" },
              { reviewCount: "desc" },
              { createdAt: "desc" },
            ],
          });

          return recommendations;
        }
      }

      // Strategy 3: Default - return popular products (most reviewed/rated)
      const popularProducts = await ctx.prisma.product.findMany({
        where: { isActive: true },
        take: limit,
        include: {
          category: true,
        },
        orderBy: [
          { reviewCount: "desc" },      // Most reviewed first
          { averageRating: "desc" },    // Then highest rated
          { createdAt: "desc" },        // Then newest
        ],
      });

      return popularProducts;
    }),
});
