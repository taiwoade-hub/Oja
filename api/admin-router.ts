import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, ne, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, coupons, homepageSections, inventoryMovements, notifications, orderEvents, orderItems, orders, products, storeSettings, users } from "@db/schema";
import { parseProduct, resolveProductImage } from "./catalog-router";

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const productInput = z.object({
  name: z.string().min(2).max(200), brand: z.string().min(2).max(120), description: z.string().min(10),
  categoryId: z.number().int().positive().nullable(), priceKobo: z.number().int().positive(), previousPriceKobo: z.number().int().positive().nullable(),
  stock: z.number().int().nonnegative(), lowStockThreshold: z.number().int().nonnegative(), imageUrl: z.string().min(1), imageKey: z.string().max(512).nullable(),
  colors: z.array(z.string()), sizes: z.array(z.string()), specifications: z.record(z.string(), z.string()),
  featured: z.boolean(), bestSeller: z.boolean(), newArrival: z.boolean(), published: z.boolean(),
});

async function allProducts() {
  const rows = await getDb().select({ product: products, categoryName: categories.name }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt));
  return Promise.all(rows.map(async ({ product, categoryName }) => ({ ...parseProduct(await resolveProductImage(product)), categoryName })));
}

export const adminRouter = createRouter({
  overview: adminQuery.query(async () => {
    const db = getDb();
    const [allOrders, allProductsRows, allUsers, recent] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)), db.select().from(products), db.select().from(users),
      db.select({ order: orders, customer: users.name, email: users.email }).from(orders).innerJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt)).limit(6),
    ]);
    const validOrders = allOrders.filter((order) => order.status !== "cancelled");
    const revenueKobo = validOrders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.totalKobo, 0);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
      const next = new Date(date); next.setDate(next.getDate() + 1);
      return { label: date.toLocaleDateString("en", { weekday: "short" }), revenueKobo: validOrders.filter((o) => o.createdAt >= date && o.createdAt < next && o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalKobo, 0), orders: validOrders.filter((o) => o.createdAt >= date && o.createdAt < next).length };
    });
    const purchased = await db.select({ item: orderItems }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(ne(orders.status, "cancelled"));
    const top = Object.values(purchased.reduce<Record<string, { name: string; quantity: number; revenueKobo: number }>>((acc, { item }) => {
      const key = item.nameSnapshot;
      acc[key] ??= { name: key, quantity: 0, revenueKobo: 0 };
      acc[key].quantity += item.quantity; acc[key].revenueKobo += item.quantity * item.unitPriceKobo;
      return acc;
    }, {})).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    return {
      revenueKobo, orderCount: allOrders.length, customerCount: allUsers.filter((u) => u.role === "user").length, productCount: allProductsRows.length,
      pendingCount: allOrders.filter((o) => o.status === "pending").length, completedCount: allOrders.filter((o) => o.status === "delivered").length,
      lowStock: allProductsRows.filter((p) => p.stock <= p.lowStockThreshold).map(parseProduct), recent, days, top,
    };
  }),

  products: adminQuery.query(() => allProducts()),
  createProduct: adminQuery.input(productInput).mutation(async ({ input }) => {
    const db = getDb();
    const slug = `${slugify(input.name)}-${Date.now().toString().slice(-5)}`;
    await db.insert(products).values({ ...input, slug, galleryJson: JSON.stringify([input.imageUrl]), colorsJson: JSON.stringify(input.colors), sizesJson: JSON.stringify(input.sizes), specificationsJson: JSON.stringify(input.specifications) });
    return allProducts();
  }),
  updateProduct: adminQuery.input(productInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const { id, colors, sizes, specifications, ...values } = input;
    await getDb().update(products).set({ ...values, ...(colors ? { colorsJson: JSON.stringify(colors) } : {}), ...(sizes ? { sizesJson: JSON.stringify(sizes) } : {}), ...(specifications ? { specificationsJson: JSON.stringify(specifications) } : {}), ...(values.imageUrl ? { galleryJson: JSON.stringify([values.imageUrl]) } : {}) }).where(eq(products.id, id));
    return { ok: true };
  }),
  deleteProduct: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(products).where(eq(products.id, input.id));
    return { ok: true };
  }),

  categories: adminQuery.query(() => getDb().select().from(categories).orderBy(asc(categories.position))),
  createCategory: adminQuery.input(z.object({ name: z.string().min(2).max(120), position: z.number().int().default(0) })).mutation(async ({ input }) => {
    await getDb().insert(categories).values({ name: input.name, slug: `${slugify(input.name)}-${Date.now().toString().slice(-4)}`, position: input.position });
    return { ok: true };
  }),
  updateCategory: adminQuery.input(z.object({ id: z.number().int().positive(), name: z.string().min(2).optional(), active: z.boolean().optional(), position: z.number().int().optional() })).mutation(async ({ input }) => {
    const { id, ...values } = input;
    await getDb().update(categories).set(values).where(eq(categories.id, id));
    return { ok: true };
  }),

  orders: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({ order: orders, customer: users.name, email: users.email }).from(orders).innerJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt));
    return Promise.all(rows.map(async ({ order, customer, email }) => ({ ...order, customer, email, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) })));
  }),
  updateOrder: adminQuery.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]), paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
    if (!order) throw new TRPCError({ code: "NOT_FOUND" });
    if (order.status === "cancelled") {
      if (input.status === "cancelled" && (!input.paymentStatus || input.paymentStatus === order.paymentStatus)) return { ok: true };
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cancelled orders cannot be reopened or changed." });
    }
    const messages = { pending: "Order is awaiting confirmation.", processing: "Payment checked and order is being prepared.", shipped: "Order dispatched to the delivery partner.", delivered: "Order delivered successfully.", cancelled: "Order cancelled by store operations." };
    await db.transaction(async (tx) => {
      const result = await tx.update(orders).set({ status: input.status, ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}) }).where(and(eq(orders.id, input.id), ne(orders.status, "cancelled")));
      if (result.changes !== 1) throw new TRPCError({ code: "CONFLICT", message: "This order was already updated. Refresh and try again." });
      if (input.status === "cancelled") {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        for (const item of items) if (item.productId) {
          await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.id, item.productId));
          await tx.insert(inventoryMovements).values({ productId: item.productId, delta: item.quantity, reason: `Admin cancellation ${order.orderNumber}`, actorId: ctx.user.id });
        }
      }
      await tx.insert(orderEvents).values({ orderId: input.id, status: input.status, message: messages[input.status] });
      await tx.insert(notifications).values({ userId: order.userId, title: `Order ${input.status}`, body: `${order.orderNumber}: ${messages[input.status]}` });
    });
    return { ok: true };
  }),

  customers: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    const allOrders = await db.select().from(orders);
    return rows.map((user) => ({ ...user, orders: allOrders.filter((o) => o.userId === user.id).length, spendKobo: allOrders.filter((o) => o.userId === user.id && o.status !== "cancelled" && o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalKobo, 0) }));
  }),
  setCustomerSuspended: adminQuery.input(z.object({ id: z.number().int().positive(), suspended: z.boolean() })).mutation(async ({ input }) => {
    await getDb().update(users).set({ suspended: input.suspended }).where(and(eq(users.id, input.id), eq(users.role, "user")));
    return { ok: true };
  }),

  inventory: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(products).orderBy(asc(products.stock));
    return Promise.all(rows.map(async (product) => ({ ...parseProduct(await resolveProductImage(product)), movements: await db.select().from(inventoryMovements).where(eq(inventoryMovements.productId, product.id)).orderBy(desc(inventoryMovements.createdAt)).limit(5) })));
  }),
  adjustStock: adminQuery.input(z.object({ productId: z.number().int().positive(), delta: z.number().int().min(-10000).max(10000), reason: z.string().min(3).max(200) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.transaction(async (tx) => {
      if (input.delta === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a non-zero stock adjustment." });
      const result = await tx.update(products).set({ stock: sql`${products.stock} + ${input.delta}` }).where(and(eq(products.id, input.productId), ...(input.delta < 0 ? [gte(products.stock, -input.delta)] : [])));
      if (result.changes !== 1) throw new TRPCError({ code: "BAD_REQUEST", message: "Product not found, or stock cannot become negative." });
      await tx.insert(inventoryMovements).values({ productId: input.productId, delta: input.delta, reason: input.reason, actorId: ctx.user.id });
    });
    return { ok: true };
  }),

  homepage: adminQuery.query(() => getDb().select().from(homepageSections).orderBy(asc(homepageSections.position))),
  updateHomepage: adminQuery.input(z.object({ id: z.number().int().positive(), title: z.string().min(2).optional(), subtitle: z.string().optional(), enabled: z.boolean().optional(), position: z.number().int().optional(), productIds: z.array(z.number().int()).optional() })).mutation(async ({ input }) => {
    const { id, productIds, ...values } = input;
    await getDb().update(homepageSections).set({ ...values, ...(productIds ? { productIdsJson: JSON.stringify(productIds) } : {}) }).where(eq(homepageSections.id, id));
    return { ok: true };
  }),
  createHomepageSection: adminQuery.input(z.object({ title: z.string().min(2), subtitle: z.string().default(""), productIds: z.array(z.number().int()).default([]) })).mutation(async ({ input }) => {
    const rows = await getDb().select().from(homepageSections);
    await getDb().insert(homepageSections).values({ type: "products", title: input.title, subtitle: input.subtitle, productIdsJson: JSON.stringify(input.productIds), position: rows.length + 1, enabled: true });
    return { ok: true };
  }),
  deleteHomepageSection: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(homepageSections).where(and(eq(homepageSections.id, input.id), eq(homepageSections.type, "products")));
    return { ok: true };
  }),

  coupons: adminQuery.query(() => getDb().select().from(coupons).orderBy(desc(coupons.createdAt))),
  createCoupon: adminQuery.input(z.object({ code: z.string().min(3).max(50), type: z.enum(["percent", "fixed"]), value: z.number().int().positive(), minPurchaseKobo: z.number().int().nonnegative(), expiresAt: z.date().nullable() })).mutation(async ({ input }) => {
    await getDb().insert(coupons).values({ ...input, code: input.code.toUpperCase() });
    return { ok: true };
  }),
  setCouponActive: adminQuery.input(z.object({ id: z.number().int().positive(), active: z.boolean() })).mutation(async ({ input }) => {
    await getDb().update(coupons).set({ active: input.active }).where(eq(coupons.id, input.id));
    return { ok: true };
  }),

  settings: adminQuery.query(() => getDb().select().from(storeSettings)),
  updateSetting: adminQuery.input(z.object({ key: z.string().min(2).max(80), value: z.string().max(1000) })).mutation(async ({ input }) => {
    const db = getDb();
    const [existing] = await db.select().from(storeSettings).where(eq(storeSettings.key, input.key)).limit(1);
    if (existing) await db.update(storeSettings).set({ value: input.value }).where(eq(storeSettings.id, existing.id));
    else await db.insert(storeSettings).values(input);
    return { ok: true };
  }),
  broadcast: adminQuery.input(z.object({ title: z.string().min(3).max(180), body: z.string().min(3).max(1000) })).mutation(async ({ input }) => {
    const db = getDb();
    const recipients = await db.select({ id: users.id }).from(users).where(eq(users.suspended, false));
    if (recipients.length) await db.insert(notifications).values(recipients.map((user) => ({ userId: user.id, title: input.title, body: input.body })));
    return { count: recipients.length };
  }),
});
