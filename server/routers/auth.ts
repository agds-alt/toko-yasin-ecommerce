/**
 * Auth Router
 * Handles user registration and profile
 */

import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hash(input.password, 10);

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone,
          address: input.address,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        user,
      };
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: (ctx.session.user as any).id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: (ctx.session.user as any).id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
        },
      });

      return user;
    }),
});
