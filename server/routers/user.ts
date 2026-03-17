/**
 * User Router
 * Public endpoints for user-related data
 */

import { router, publicProcedure } from "../trpc";

export const userRouter = router({
  // Get admin contact info (phone for WhatsApp)
  getAdminContact: publicProcedure.query(async ({ ctx }) => {
    const admin = await ctx.prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        phone: true,
        name: true,
      },
    });

    return admin;
  }),
});
