import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import webpush from "web-push";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const notificationRouter = router({
  // Subscribe to push notifications
  subscribe: publicProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if subscription already exists
        const existing = await ctx.prisma.pushSubscription.findUnique({
          where: { endpoint: input.endpoint },
        });

        if (existing) {
          // Update existing subscription
          return await ctx.prisma.pushSubscription.update({
            where: { endpoint: input.endpoint },
            data: {
              p256dh: input.keys.p256dh,
              auth: input.keys.auth,
              userAgent: input.userAgent,
              userId: ctx.session?.user?.id,
            },
          });
        }

        // Create new subscription
        return await ctx.prisma.pushSubscription.create({
          data: {
            endpoint: input.endpoint,
            p256dh: input.keys.p256dh,
            auth: input.keys.auth,
            userAgent: input.userAgent,
            userId: ctx.session?.user?.id,
          },
        });
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe to push notifications",
        });
      }
    }),

  // Unsubscribe from push notifications
  unsubscribe: publicProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.pushSubscription.delete({
          where: { endpoint: input.endpoint },
        });
        return { success: true };
      } catch (error) {
        console.error("Error unsubscribing from push notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unsubscribe from push notifications",
        });
      }
    }),

  // Send push notification (Admin only)
  send: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        url: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        userId: z.string().optional(), // If specified, send only to this user
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can send push notifications",
        });
      }

      try {
        // Get subscriptions to send to
        const subscriptions = await ctx.prisma.pushSubscription.findMany({
          where: input.userId ? { userId: input.userId } : {},
        });

        if (subscriptions.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No push subscriptions found",
          });
        }

        const payload = JSON.stringify({
          title: input.title,
          body: input.body,
          url: input.url || "/",
          icon: input.icon || "/icons/icon-192x192.png",
          image: input.image,
        });

        // Send notifications
        const results = await Promise.allSettled(
          subscriptions.map((sub) =>
            webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            )
          )
        );

        // Remove failed subscriptions (expired or invalid)
        const failedSubscriptions = subscriptions.filter(
          (_, index) => results[index].status === "rejected"
        );

        if (failedSubscriptions.length > 0) {
          await ctx.prisma.pushSubscription.deleteMany({
            where: {
              endpoint: {
                in: failedSubscriptions.map((s) => s.endpoint),
              },
            },
          });
        }

        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failedCount = results.filter((r) => r.status === "rejected").length;

        return {
          success: true,
          sent: successCount,
          failed: failedCount,
        };
      } catch (error) {
        console.error("Error sending push notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send push notification",
        });
      }
    }),

  // Send notification on order status change
  sendOrderUpdate: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum([
          "PENDING",
          "PAYMENT_UPLOADED",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can send order notifications",
        });
      }

      try {
        // Get order details
        const order = await ctx.prisma.order.findUnique({
          where: { id: input.orderId },
          include: { user: true },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Get user's push subscriptions
        const subscriptions = await ctx.prisma.pushSubscription.findMany({
          where: { userId: order.userId },
        });

        if (subscriptions.length === 0) {
          return { success: false, message: "User has no push subscriptions" };
        }

        // Create notification message based on status
        const messages: Record<string, { title: string; body: string }> = {
          PAYMENT_UPLOADED: {
            title: "Bukti Pembayaran Diterima",
            body: `Bukti pembayaran untuk order #${order.id.slice(-8)} sedang diverifikasi`,
          },
          CONFIRMED: {
            title: "Pembayaran Dikonfirmasi ✓",
            body: `Pembayaran order #${order.id.slice(-8)} telah dikonfirmasi. Pesanan akan segera diproses.`,
          },
          PROCESSING: {
            title: "Pesanan Sedang Diproses",
            body: `Order #${order.id.slice(-8)} sedang dikemas dan akan segera dikirim`,
          },
          SHIPPED: {
            title: "Pesanan Dikirim 📦",
            body: `Order #${order.id.slice(-8)} sudah dikirim. Lacak pengiriman Anda.`,
          },
          DELIVERED: {
            title: "Pesanan Tiba 🎉",
            body: `Order #${order.id.slice(-8)} telah sampai. Terima kasih atas pesanan Anda!`,
          },
          CANCELLED: {
            title: "Pesanan Dibatalkan",
            body: `Order #${order.id.slice(-8)} telah dibatalkan`,
          },
        };

        const message = messages[input.status];
        if (!message) {
          return { success: false, message: "Invalid status for notification" };
        }

        const payload = JSON.stringify({
          title: message.title,
          body: message.body,
          url: `/orders/${order.id}`,
          icon: "/icons/icon-192x192.png",
          tag: `order-${order.id}`,
          data: {
            orderId: order.id,
          },
        });

        // Send notifications
        const results = await Promise.allSettled(
          subscriptions.map((sub) =>
            webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            )
          )
        );

        // Remove failed subscriptions
        const failedSubscriptions = subscriptions.filter(
          (_, index) => results[index].status === "rejected"
        );

        if (failedSubscriptions.length > 0) {
          await ctx.prisma.pushSubscription.deleteMany({
            where: {
              endpoint: {
                in: failedSubscriptions.map((s) => s.endpoint),
              },
            },
          });
        }

        const successCount = results.filter((r) => r.status === "fulfilled").length;

        return {
          success: true,
          sent: successCount,
          failed: failedSubscriptions.length,
        };
      } catch (error) {
        console.error("Error sending order update notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send order update notification",
        });
      }
    }),
});
