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
import { wishlistRouter } from "./wishlist";
import { reviewRouter } from "./review";
import { userRouter } from "./user";

export const appRouter = router({
  product: productRouter,
  auth: authRouter,
  cart: cartRouter,
  order: orderRouter,
  payment: paymentRouter,
  admin: adminRouter,
  wishlist: wishlistRouter,
  review: reviewRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
