/**
 * Admin Router
 * Handles admin-specific operations and statistics
 */

import { router, adminProcedure } from "../trpc";

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
});
