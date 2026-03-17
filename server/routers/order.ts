/**
 * Order Router
 * Handles order creation and management
 */

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationToAdmin,
} from "../../lib/email";

export const orderRouter = router({
  // Create order from localStorage cart (frontend cart)
  createFromCart: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            price: z.number(),
            variant: z.record(z.string()).optional(),
          })
        ),
        totalAmount: z.number(),
        shippingAddress: z.string().min(10),
        shippingPhone: z.string().min(10),
        notes: z.string().optional(),
        bankName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Verify all products exist and have sufficient stock
      for (const item of input.items) {
        const product = await ctx.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product not found`,
          });
        }

        if (product.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for ${product.name}`,
          });
        }
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order with transaction
      const order = await ctx.prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: (ctx.session.user as any).id,
            totalAmount: input.totalAmount,
            shippingAddress: input.shippingAddress,
            shippingPhone: input.shippingPhone,
            notes: input.notes,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                variant: item.variant || undefined,
              })),
            },
          },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        });

        // Create payment record with default Toko Yasin account info
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            bankName: input.bankName,
            accountNumber: "1234567890", // Default account
            accountName: "Toko Yasin", // Default account name
            amount: input.totalAmount,
          },
        });

        // Reduce stock
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newOrder;
      });

      // Get order details with items for email
      const orderDetails = await ctx.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Send confirmation email to customer (async, non-blocking)
      if (orderDetails) {
        sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: orderDetails.user.name || "Customer",
          customerEmail: orderDetails.user.email,
          totalAmount: Number(order.totalAmount),
          items: orderDetails.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          shippingAddress: input.shippingAddress,
          shippingPhone: input.shippingPhone,
        }).catch((err) => console.error("Email send failed:", err));

        // Get admin email from database (first admin user)
        const adminUser = await ctx.prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { email: true },
        });

        // Send notification to admin (async, non-blocking)
        sendNewOrderNotificationToAdmin(
          {
            orderNumber: order.orderNumber,
            customerName: orderDetails.user.name || "Customer",
            customerEmail: orderDetails.user.email,
            totalAmount: Number(order.totalAmount),
            items: orderDetails.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            shippingAddress: input.shippingAddress,
            shippingPhone: input.shippingPhone,
          },
          adminUser?.email // Pass admin email from database
        ).catch((err) => console.error("Admin email failed:", err));
      }

      return order;
    }),

  // Create order from cart (legacy - database cart)
  create: protectedProcedure
    .input(
      z.object({
        shippingAddress: z.string().min(10),
        shippingPhone: z.string().min(10),
        notes: z.string().optional(),
        bankName: z.string(),
        accountNumber: z.string(),
        accountName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get cart with items
      const cart = await ctx.prisma.cart.findUnique({
        where: { userId: (ctx.session.user as any).id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Check stock availability
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for ${item.product.name}`,
          });
        }
      }

      // Calculate total
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order with transaction
      const order = await ctx.prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: (ctx.session.user as any).id,
            totalAmount,
            shippingAddress: input.shippingAddress,
            shippingPhone: input.shippingPhone,
            notes: input.notes,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price, // Snapshot current price
              })),
            },
          },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        });

        // Create payment record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            bankName: input.bankName,
            accountNumber: input.accountNumber,
            accountName: input.accountName,
            amount: totalAmount,
          },
        });

        // Reduce stock
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Clear cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      });

      return order;
    }),

  // Get user's orders
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10;
      const cursor = input?.cursor;
      const orders = await ctx.prisma.order.findMany({
        where: { userId: (ctx.session.user as any).id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders: orders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images || [],
            },
          })),
        })),
        nextCursor,
      };
    }),

  // Get order detail
  getById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check authorization
      if (order.userId !== (ctx.session.user as any).id) {
        // Allow admin to view any order
        const user = await ctx.prisma.user.findUnique({
          where: { id: (ctx.session.user as any).id },
        });

        if (user?.role !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to view this order",
          });
        }
      }

      return {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || [],
          },
        })),
      };
    }),

  // Update order status (admin only)
  updateStatus: adminProcedure
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
      await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
      });

      return { success: true };
    }),

  // Upload payment proof
  uploadPaymentProof: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        proofImageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get order to verify ownership
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
      if (order.userId !== (ctx.session.user as any).id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to upload proof for this order",
        });
      }

      if (!order.payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment record not found",
        });
      }

      // Update payment with proof image
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

  // Verify payment (admin only)
  verifyPayment: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        approve: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payment: true },
      });

      if (!order || !order.payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order or payment not found",
        });
      }

      if (input.approve) {
        // Approve payment
        await ctx.prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "VERIFIED",
            verifiedBy: (ctx.session.user as any).id,
            verifiedAt: new Date(),
            notes: input.notes,
          },
        });

        await ctx.prisma.order.update({
          where: { id: input.orderId },
          data: { status: "CONFIRMED" },
        });
      } else {
        // Reject payment
        await ctx.prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "REJECTED",
            verifiedBy: (ctx.session.user as any).id,
            verifiedAt: new Date(),
            notes: input.notes,
          },
        });

        await ctx.prisma.order.update({
          where: { id: input.orderId },
          data: { status: "CANCELLED" },
        });
      }

      return { success: true };
    }),

  // Confirm delivery (customer)
  confirmDelivery: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        deliveryProofImage: z.string().url().optional(),
        deliveryNotes: z.string().optional(),
        deliveryRating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get order to verify ownership
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check authorization
      if (order.userId !== (ctx.session.user as any).id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to confirm delivery for this order",
        });
      }

      // Check if order is in SHIPPED status
      if (order.status !== "SHIPPED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order must be in SHIPPED status to confirm delivery",
        });
      }

      // Update order with delivery confirmation
      const updatedOrder = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          deliveryProofImage: input.deliveryProofImage,
          deliveryNotes: input.deliveryNotes,
          deliveryRating: input.deliveryRating,
        },
      });

      // TODO: Send notification to admin about delivery confirmation
      console.log(`✅ Order ${order.orderNumber} confirmed delivered by ${order.user.name}`);

      return {
        success: true,
        order: updatedOrder,
      };
    }),

  // Get all orders (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        status: z
          .enum([
            "PENDING",
            "PAYMENT_UPLOADED",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const cursor = input.cursor;
      const status = input.status;

      const orders = await ctx.prisma.order.findMany({
        where: status ? { status: status } : undefined,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payment: true,
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
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        orders: orders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images || [],
            },
          })),
        })),
        nextCursor,
      };
    }),
});
