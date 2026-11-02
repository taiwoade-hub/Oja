import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { addresses, cartItems, coupons, inventoryMovements, notifications, orderEvents, orderItems, orders, products, storeSettings, wishlistItems } from "@db/schema";
import { parseProduct, resolveProductImage } from "./catalog-router";

const variantSchema = z.string().max(160).default("");

async function cartForUser(userId: number) {
  const db = getDb();
  const rows = await db.select({ item: cartItems, product: products }).from(cartItems).innerJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.userId, userId)).orderBy(asc(cartItems.createdAt));
  return Promise.all(rows.map(async ({ item, product }) => ({ ...item, product: parseProduct(await resolveProductImage(product)) })));
}

async function deliveryFees() {
  const rows = await getDb().select().from(storeSettings);
  const value = (key: string, fallback: number) => Number(rows.find((row) => row.key === key)?.value ?? fallback);
  return { standard: value("standardDeliveryKobo", 350000), express: value("expressDeliveryKobo", 750000), freeThreshold: value("freeDeliveryThresholdKobo", 15000000) };
}

async function calculateQuote(userId: number, method: "standard" | "express", code?: string) {
  const items = (await cartForUser(userId)).filter((item) => !item.savedForLater);
  const subtotalKobo = items.reduce((sum, item) => sum + item.product.priceKobo * item.quantity, 0);
  let discountKobo = 0;
  let couponMessage = "";
  if (code) {
    const [coupon] = await getDb().select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date())) couponMessage = "This code is invalid or has expired.";
    else if (subtotalKobo < coupon.minPurchaseKobo) couponMessage = `Spend at least ₦${(coupon.minPurchaseKobo / 100).toLocaleString()} to use this code.`;
    else discountKobo = coupon.type === "percent" ? Math.round(subtotalKobo * coupon.value / 100) : Math.min(coupon.value, subtotalKobo);
  }
  const fees = await deliveryFees();
  const deliveryFeeKobo = subtotalKobo >= fees.freeThreshold && method === "standard" ? 0 : fees[method];
  return { items, subtotalKobo, discountKobo, deliveryFeeKobo, totalKobo: Math.max(0, subtotalKobo - discountKobo + deliveryFeeKobo), couponMessage, standardFeeKobo: fees.standard, expressFeeKobo: fees.express, freeThresholdKobo: fees.freeThreshold };
}

export const shopRouter = createRouter({
  cart: authedQuery.query(({ ctx }) => cartForUser(ctx.user.id)),
  addToCart: authedQuery.input(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20).default(1), variant: variantSchema })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [product] = await db.select().from(products).where(and(eq(products.id, input.productId), eq(products.published, true))).limit(1);
    if (!product || product.stock < input.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: "This quantity is not available." });
    const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.userId, ctx.user.id), eq(cartItems.productId, input.productId), eq(cartItems.variant, input.variant))).limit(1);
    const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
    if (nextQuantity > product.stock) throw new TRPCError({ code: "BAD_REQUEST", message: `Only ${product.stock} left in stock.` });
    if (existing) await db.update(cartItems).set({ quantity: nextQuantity, savedForLater: false }).where(eq(cartItems.id, existing.id));
    else await db.insert(cartItems).values({ userId: ctx.user.id, productId: input.productId, quantity: input.quantity, variant: input.variant });
    return cartForUser(ctx.user.id);
  }),
  updateCart: authedQuery.input(z.object({ id: z.number().int().positive(), quantity: z.number().int().min(1).max(20), savedForLater: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [row] = await db.select({ item: cartItems, stock: products.stock }).from(cartItems).innerJoin(products, eq(cartItems.productId, products.id)).where(and(eq(cartItems.id, input.id), eq(cartItems.userId, ctx.user.id))).limit(1);
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    if (input.quantity > row.stock) throw new TRPCError({ code: "BAD_REQUEST", message: `Only ${row.stock} left in stock.` });
    await db.update(cartItems).set({ quantity: input.quantity, savedForLater: input.savedForLater }).where(eq(cartItems.id, input.id));
    return { ok: true };
  }),
  removeCart: authedQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await getDb().delete(cartItems).where(and(eq(cartItems.id, input.id), eq(cartItems.userId, ctx.user.id)));
    return { ok: true };
  }),

  wishlist: authedQuery.query(async ({ ctx }) => {
    const rows = await getDb().select({ saved: wishlistItems, product: products }).from(wishlistItems).innerJoin(products, eq(wishlistItems.productId, products.id)).where(eq(wishlistItems.userId, ctx.user.id)).orderBy(desc(wishlistItems.createdAt));
    return Promise.all(rows.map(async ({ saved, product }) => ({ ...saved, product: parseProduct(await resolveProductImage(product)) })));
  }),
  toggleWishlist: authedQuery.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [existing] = await db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, ctx.user.id), eq(wishlistItems.productId, input.productId))).limit(1);
    if (existing) { await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id)); return { saved: false }; }
    await db.insert(wishlistItems).values({ userId: ctx.user.id, productId: input.productId });
    return { saved: true };
  }),

  addresses: authedQuery.query(({ ctx }) => getDb().select().from(addresses).where(eq(addresses.userId, ctx.user.id)).orderBy(desc(addresses.isDefault))),
  addAddress: authedQuery.input(z.object({ label: z.string().min(2).max(60), fullName: z.string().min(2).max(160), phone: z.string().min(7).max(40), line1: z.string().min(5).max(240), city: z.string().min(2).max(100), state: z.string().min(2).max(100), isDefault: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    if (input.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, ctx.user.id));
    await db.insert(addresses).values({ ...input, userId: ctx.user.id });
    return db.select().from(addresses).where(eq(addresses.userId, ctx.user.id));
  }),
  quote: authedQuery.input(z.object({ deliveryMethod: z.enum(["standard", "express"]).default("standard"), coupon: z.string().optional() })).query(({ ctx, input }) => calculateQuote(ctx.user.id, input.deliveryMethod, input.coupon)),
  placeOrder: authedQuery.input(z.object({ addressId: z.number().int().positive(), deliveryMethod: z.enum(["standard", "express"]), coupon: z.string().optional(), paymentMethod: z.enum(["bank_transfer", "paystack"]), idempotencyKey: z.string().min(8).max(64) })).mutation(async ({ ctx, input }) => {
    if (input.paymentMethod === "paystack") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Paystack is not configured. Choose bank transfer to place a pending-payment order." });
    const db = getDb();
    const orderNumber = `OJ-${input.idempotencyKey.replace(/[^a-z0-9]/gi, "").slice(-16).toUpperCase()}`;
    const [existingOrder] = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, ctx.user.id))).limit(1);
    if (existingOrder) return { id: existingOrder.id, orderNumber: existingOrder.orderNumber };
    const [address] = await db.select().from(addresses).where(and(eq(addresses.id, input.addressId), eq(addresses.userId, ctx.user.id))).limit(1);
    if (!address) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a valid delivery address." });
    const quote = await calculateQuote(ctx.user.id, input.deliveryMethod, input.coupon);
    if (!quote.items.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Your cart is empty." });
    const orderId = await db.transaction(async (tx) => {
      for (const item of quote.items) {
        const result = await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(and(eq(products.id, item.productId), eq(products.published, true), gte(products.stock, item.quantity)));
        const affected = (result as any)?.changes ?? (result as any)?.[0]?.affectedRows ?? 1;
        if (affected < 1) throw new TRPCError({ code: "CONFLICT", message: `${item.product.name} no longer has enough stock.` });
        await tx.insert(inventoryMovements).values({ productId: item.productId, delta: -item.quantity, reason: `Order ${orderNumber}`, actorId: ctx.user.id });
      }
      const [{ id }] = await tx.insert(orders).values({
        orderNumber, userId: ctx.user.id, addressSnapshot: `${address.fullName} · ${address.phone} · ${address.line1}, ${address.city}, ${address.state}`,
        deliveryMethod: input.deliveryMethod, paymentMethod: input.paymentMethod, paymentStatus: "pending", status: "pending",
        subtotalKobo: quote.subtotalKobo, discountKobo: quote.discountKobo, deliveryFeeKobo: quote.deliveryFeeKobo, totalKobo: quote.totalKobo,
        trackingCode: `TRK-${orderNumber}`,
      }).returning({ id: orders.id });
      await tx.insert(orderItems).values(quote.items.map((item) => ({ orderId: id, productId: item.productId, nameSnapshot: item.product.name, imageSnapshot: item.product.imageUrl, variant: item.variant, quantity: item.quantity, unitPriceKobo: item.product.priceKobo })));
      await tx.insert(orderEvents).values({ orderId: id, status: "pending", message: "Order placed. Awaiting bank transfer confirmation." });
      await tx.delete(cartItems).where(and(eq(cartItems.userId, ctx.user.id), eq(cartItems.savedForLater, false)));
      await tx.insert(notifications).values({ userId: ctx.user.id, title: "Order received", body: `${orderNumber} is confirmed. We’ll notify you when payment is verified.` });
      return id;
    });
    return { id: orderId, orderNumber };
  }),

  orders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userOrders = await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
    return Promise.all(userOrders.map(async (order) => ({
      ...order,
      items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      events: await db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
    })));
  }),
  cancelOrder: authedQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(and(eq(orders.id, input.id), eq(orders.userId, ctx.user.id))).limit(1);
      if (!order || order.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Only pending orders can be cancelled." });
      const result = await tx.update(orders).set({ status: "cancelled" }).where(and(eq(orders.id, order.id), eq(orders.userId, ctx.user.id), eq(orders.status, "pending")));
      if (result.changes !== 1) throw new TRPCError({ code: "CONFLICT", message: "This order was already updated. Refresh and try again." });
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const item of items) if (item.productId) {
        await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.id, item.productId));
        await tx.insert(inventoryMovements).values({ productId: item.productId, delta: item.quantity, reason: `Cancellation ${order.orderNumber}`, actorId: ctx.user.id });
      }
      await tx.insert(orderEvents).values({ orderId: order.id, status: "cancelled", message: "Cancelled by customer. Stock returned to inventory." });
    });
    return { ok: true };
  }),
  reorder: authedQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(and(eq(orders.id, input.id), eq(orders.userId, ctx.user.id))).limit(1);
    if (!order) throw new TRPCError({ code: "NOT_FOUND" });
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) if (item.productId) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product?.published && product.stock > 0) {
        const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.userId, ctx.user.id), eq(cartItems.productId, product.id), eq(cartItems.variant, item.variant))).limit(1);
        if (existing) await db.update(cartItems).set({ quantity: Math.min(product.stock, existing.quantity + item.quantity), savedForLater: false }).where(eq(cartItems.id, existing.id));
        else await db.insert(cartItems).values({ userId: ctx.user.id, productId: product.id, quantity: Math.min(product.stock, item.quantity), variant: item.variant });
      }
    }
    return { ok: true };
  }),
  notifications: authedQuery.query(({ ctx }) => getDb().select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt)).limit(30)),
  markNotificationsRead: authedQuery.mutation(async ({ ctx }) => {
    await getDb().update(notifications).set({ read: true }).where(eq(notifications.userId, ctx.user.id));
    return { ok: true };
  }),
});
