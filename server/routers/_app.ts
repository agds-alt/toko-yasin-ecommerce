/**
 * Main tRPC App Router
 * Combines all sub-routers
 */

import { router } from "../trpc";
import { productRouter } from "./product";
import { authRouter } from "./auth";
import { cartRouter } from "./cart";
import { orderRouter } from "./order";
import { paymentRouter } from "./payment";
import { adminRouter } from "./admin";

export const appRouter = router({
  product: productRouter,
  auth: authRouter,
  cart: cartRouter,
  order: orderRouter,
  payment: paymentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
