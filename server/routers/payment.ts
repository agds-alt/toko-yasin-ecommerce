/**
 * Payment Router
 * Handles payment proof upload and verification
 */

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const paymentRouter = router({
  // Upload payment proof
  uploadProof: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        proofImageUrl: z.string().url(), // Cloudinary URL from client upload
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get order and verify ownership
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payment: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (order.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      if (!order.payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment record not found",
        });
      }

      // Update payment with proof
      await ctx.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          proofImage: input.proofImageUrl,
          status: "UPLOADED",
        },
      });

      // Update order status
      await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: { status: "PAYMENT_UPLOADED" },
      });

      return { success: true };
    }),

  // Get payment by order ID
  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payment: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check authorization
      if (order.userId !== ctx.session.user.id) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (user?.role !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }
      }

      return order.payment;
    }),

  // Verify payment (admin only)
  verify: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      // Update payment status
      await ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "VERIFIED",
          verifiedBy: ctx.session.user.id,
          verifiedAt: new Date(),
          notes: input.notes,
        },
      });

      // Update order status
      await ctx.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });

      return { success: true };
    }),

  // Reject payment (admin only)
  reject: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        notes: z.string().min(1), // Reason for rejection
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      // Update payment status
      await ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "REJECTED",
          verifiedBy: ctx.session.user.id,
          verifiedAt: new Date(),
          notes: input.notes,
        },
      });

      // Update order status back to pending
      await ctx.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PENDING" },
      });

      return { success: true };
    }),

  // Get pending payments (admin only)
  getPending: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const payments = await ctx.prisma.payment.findMany({
        where: { status: "UPLOADED" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          order: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      let nextCursor: string | undefined = undefined;
      if (payments.length > input.limit) {
        const nextItem = payments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        payments,
        nextCursor,
      };
    }),
});
