import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  suspended: integer("suspended", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("imageUrl"),
  position: integer("position").default(0).notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId").references(() => categories.id, { onDelete: "set null" }),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  priceKobo: integer("priceKobo").notNull(),
  previousPriceKobo: integer("previousPriceKobo"),
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("lowStockThreshold").default(5).notNull(),
  rating: integer("rating").default(50).notNull(),
  reviewCount: integer("reviewCount").default(0).notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey"),
  galleryJson: text("galleryJson").notNull(),
  colorsJson: text("colorsJson").notNull(),
  sizesJson: text("sizesJson").notNull(),
  specificationsJson: text("specificationsJson").notNull(),
  featured: integer("featured", { mode: "boolean" }).default(false).notNull(),
  bestSeller: integer("bestSeller", { mode: "boolean" }).default(false).notNull(),
  newArrival: integer("newArrival", { mode: "boolean" }).default(false).notNull(),
  published: integer("published", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  categoryIdx: index("product_category_idx").on(table.categoryId),
  publishedIdx: index("product_published_idx").on(table.published),
}));

export const homepageSections = sqliteTable("homepage_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["hero", "categories", "products", "promo"] }).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("imageUrl"),
  productIdsJson: text("productIdsJson").notNull(),
  position: integer("position").default(0).notNull(),
  enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  variant: text("variant").default("").notNull(),
  savedForLater: integer("savedForLater", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userProductIdx: uniqueIndex("cart_user_product_variant_idx").on(table.userId, table.productId, table.variant),
  userIdx: index("cart_user_idx").on(table.userId),
  productIdx: index("cart_product_idx").on(table.productId),
}));

export const wishlistItems = sqliteTable("wishlist_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userProductIdx: uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId),
  userIdx: index("wishlist_user_idx").on(table.userId),
  productIdx: index("wishlist_product_idx").on(table.productId),
}));

export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  fullName: text("fullName").notNull(),
  phone: text("phone").notNull(),
  line1: text("line1").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isDefault: integer("isDefault", { mode: "boolean" }).default(false).notNull(),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type", { enum: ["percent", "fixed"] }).notNull(),
  value: integer("value").notNull(),
  minPurchaseKobo: integer("minPurchaseKobo").default(0).notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("orderNumber").notNull().unique(),
  userId: integer("userId").notNull().references(() => users.id),
  addressSnapshot: text("addressSnapshot").notNull(),
  deliveryMethod: text("deliveryMethod", { enum: ["standard", "express"] }).notNull(),
  paymentMethod: text("paymentMethod", { enum: ["bank_transfer", "paystack"] }).notNull(),
  paymentStatus: text("paymentStatus", { enum: ["pending", "paid", "failed", "refunded"] }).default("pending").notNull(),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] }).default("pending").notNull(),
  subtotalKobo: integer("subtotalKobo").notNull(),
  discountKobo: integer("discountKobo").default(0).notNull(),
  deliveryFeeKobo: integer("deliveryFeeKobo").notNull(),
  totalKobo: integer("totalKobo").notNull(),
  trackingCode: text("trackingCode"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdx: index("order_user_idx").on(table.userId),
  statusIdx: index("order_status_idx").on(table.status),
}));

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId").references(() => products.id, { onDelete: "set null" }),
  nameSnapshot: text("nameSnapshot").notNull(),
  imageSnapshot: text("imageSnapshot").notNull(),
  variant: text("variant").default("").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceKobo: integer("unitPriceKobo").notNull(),
});

export const orderEvents = sqliteTable("order_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  message: text("message").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  actorId: integer("actorId").references(() => users.id, { onDelete: "set null" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: integer("read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const storeSettings = sqliteTable("store_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  ownerId: integer("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type HomepageSection = typeof homepageSections.$inferSelect;
export type Order = typeof orders.$inferSelect;
