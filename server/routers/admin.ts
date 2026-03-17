/**
 * Admin Router
 * Handles admin-specific operations and statistics
 */

import { router, adminProcedure } from "../trpc";
import { z } from "zod";

export const adminRouter = router({
  // Get dashboard statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Get total orders
    const totalOrders = await ctx.prisma.order.count();

    // Get pending payments
    const pendingPayments = await ctx.prisma.payment.count({
      where: { status: "UPLOADED" },
    });

    // Get total products
    const totalProducts = await ctx.prisma.product.count();

    // Get total revenue (only from confirmed orders)
    const confirmedOrders = await ctx.prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = confirmedOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    return {
      totalOrders,
      pendingPayments,
      totalProducts,
      totalRevenue,
    };
  }),

  // Get all customers
  getCustomers: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 50;
      const cursor = input?.cursor;

      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
          orders: {
            where: {
              status: {
                in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
              },
            },
            select: {
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      const customersWithStats = users.map((user) => ({
        ...user,
        totalSpent: user.orders.reduce(
          (sum, order) => sum + Number(order.totalAmount),
          0
        ),
        totalOrders: user._count.orders,
      }));

      return {
        customers: customersWithStats,
        nextCursor,
      };
    }),

  // Get analytics data
  getAnalytics: adminProcedure
    .input(
      z.object({
        period: z.enum(["7days", "30days", "90days", "1year"]).default("30days"),
      })
    )
    .query(async ({ ctx, input }) => {
      const daysMap = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "1year": 365,
      };

      const days = daysMap[input.period];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get orders in period
      const orders = await ctx.prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
      const dailyData: Record<string, { revenue: number; orders: number }> = {};

      orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split("T")[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { revenue: 0, orders: 0 };
        }
        dailyData[dateKey].orders += 1;
        if (
          ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
            order.status
          )
        ) {
          dailyData[dateKey].revenue += Number(order.totalAmount);
        }
      });

      // Convert to array
      const chartData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));

      // Get status distribution
      const statusCounts = await ctx.prisma.order.groupBy({
        by: ["status"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      });

      // Get top selling products
      const topProducts = await ctx.prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: {
              gte: startDate,
            },
            status: {
              in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
            },
          },
        },
        _sum: {
          quantity: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

      // Get product details
      const productDetails = await ctx.prisma.product.findMany({
        where: {
          id: {
            in: topProducts.map((p) => p.productId),
          },
        },
        select: {
          id: true,
          name: true,
          images: true,
        },
      });

      const topProductsWithDetails = topProducts.map((item) => {
        const product = productDetails.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          name: product?.name || "Unknown",
          image: product?.images?.[0] || "/placeholder.png",
          quantitySold: item._sum.quantity || 0,
          orderCount: item._count,
        };
      });

      return {
        chartData,
        statusCounts,
        topProducts: topProductsWithDetails,
        totalRevenue: orders
          .filter((o) =>
            ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
              o.status
            )
          )
          .reduce((sum, order) => sum + Number(order.totalAmount), 0),
        totalOrders: orders.length,
      };
    }),

  // Upload tracking number (resi)
  uploadTracking: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        trackingNumber: z.string().min(1, "Nomor resi harus diisi"),
        courier: z.string().min(1, "Nama kurir harus diisi"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update order with tracking info and change status to SHIPPED
      const order = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          trackingNumber: input.trackingNumber,
          courier: input.courier,
          shippedAt: new Date(),
          status: "SHIPPED",
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // TODO: Send email notification to customer
      // Will be implemented in email service

      return order;
    }),
});
