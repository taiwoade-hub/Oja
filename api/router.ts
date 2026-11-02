import { authRouter } from "./auth-router";
import { catalogRouter } from "./catalog-router";
import { shopRouter } from "./shop-router";
import { adminRouter } from "./admin-router";
import { storageRouter } from "./storage-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  catalog: catalogRouter,
  shop: shopRouter,
  admin: adminRouter,
  storage: storageRouter,
});

export type AppRouter = typeof appRouter;
