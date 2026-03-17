/**
 * Review Router
 * Handles product reviews and ratings
 */

import { router, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  // Get all reviews for a product
  getByProduct: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const cursor = input.cursor;

      const reviews = await ctx.prisma.review.findMany({
        where: { productId: input.productId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (reviews.length > limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem!.id;
      }

      // Calculate average rating
      const allReviews = await ctx.prisma.review.findMany({
        where: { productId: input.productId },
        select: { rating: true },
      });

      const totalReviews = allReviews.length;
      const averageRating =
        totalReviews > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      return {
        reviews,
        nextCursor,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    }),

  // Get product rating statistics
  getProductStats: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { productId: input.productId },
        select: { rating: true },
      });

      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      // Count by rating
      const ratingCounts = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      };

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingCounts,
      };
    }),

  // Create a review
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        images: z.array(z.string().url()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as any).id;

      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user already reviewed this product
      const existing = await ctx.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      // Check if user has purchased and RECEIVED this product (DELIVERED status only)
      const deliveredOrder = await ctx.prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: {
            userId,
            status: "DELIVERED", // Only DELIVERED orders can review
          },
        },
      });

      if (!deliveredOrder) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must purchase and receive this product before reviewing",
        });
      }

      // Create review
      const review = await ctx.prisma.review.create({
        data: {
          userId,
          productId: input.productId,
          rating: input.rating,
          comment: input.comment,
          images: input.images || [],
          isVerified: true, // All reviews are verified since only delivered orders can review
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return review;
    }),

  // Update a review
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
        images: z.array(z.string().url()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as any).id;

      // Check if review exists and belongs to user
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (review.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this review",
        });
      }

      // Update review
      const updated = await ctx.prisma.review.update({
        where: { id: input.reviewId },
        data: {
          ...(input.rating !== undefined && { rating: input.rating }),
          ...(input.comment !== undefined && { comment: input.comment }),
          ...(input.images !== undefined && { images: input.images }),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return updated;
    }),

  // Delete a review
  delete: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session.user as any).id;

      // Check if review exists and belongs to user
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Allow user to delete their own review or admin to delete any
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (review.userId !== userId && user?.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this review",
        });
      }

      await ctx.prisma.review.delete({
        where: { id: input.reviewId },
      });

      return { success: true };
    }),

  // Check if user can review a product
  canReview: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session.user as any).id;

      // Check if already reviewed
      const existing = await ctx.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
      });

      if (existing) {
        return { canReview: false, reason: "already_reviewed", review: existing };
      }

      // Check if user has purchased and received this product (DELIVERED status only)
      const deliveredOrder = await ctx.prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: {
            userId,
            status: "DELIVERED", // Only DELIVERED orders can review
          },
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              deliveredAt: true,
            },
          },
        },
      });

      if (!deliveredOrder) {
        return {
          canReview: false,
          reason: "not_purchased",
          message: "Anda harus membeli dan menerima produk ini terlebih dahulu untuk dapat memberikan review"
        };
      }

      return { canReview: true };
    }),

  // Get user's review for a product
  getUserReview: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session.user as any).id;

      const review = await ctx.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: input.productId,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return review;
    }),
});
