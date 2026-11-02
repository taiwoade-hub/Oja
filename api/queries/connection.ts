import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

function initTables(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unionId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      suspended INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      lastSignInAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      imageUrl TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      priceKobo INTEGER NOT NULL,
      previousPriceKobo INTEGER,
      stock INTEGER NOT NULL DEFAULT 0,
      lowStockThreshold INTEGER NOT NULL DEFAULT 5,
      rating INTEGER NOT NULL DEFAULT 50,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      imageUrl TEXT NOT NULL,
      imageKey TEXT,
      galleryJson TEXT NOT NULL,
      colorsJson TEXT NOT NULL,
      sizesJson TEXT NOT NULL,
      specificationsJson TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      bestSeller INTEGER NOT NULL DEFAULT 0,
      newArrival INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homepage_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      imageUrl TEXT,
      productIdsJson TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      variant TEXT NOT NULL DEFAULT '',
      savedForLater INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      line1 TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      minPurchaseKobo INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      expiresAt INTEGER,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT NOT NULL UNIQUE,
      userId INTEGER NOT NULL REFERENCES users(id),
      addressSnapshot TEXT NOT NULL,
      deliveryMethod TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'pending',
      subtotalKobo INTEGER NOT NULL,
      discountKobo INTEGER NOT NULL DEFAULT 0,
      deliveryFeeKobo INTEGER NOT NULL,
      totalKobo INTEGER NOT NULL,
      trackingCode TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      productId INTEGER REFERENCES products(id) ON DELETE SET NULL,
      nameSnapshot TEXT NOT NULL,
      imageSnapshot TEXT NOT NULL,
      variant TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL,
      unitPriceKobo INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      actorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      ownerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

export function getDb() {
  if (!instance) {
    const rawPath = env.databaseUrl || "oja.db";
    const dbPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(process.cwd(), rawPath);

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    initTables(sqlite);

    instance = drizzle(sqlite, {
      schema: fullSchema,
    });

    // Check if products exist; if not, trigger seed
    const countRow = sqlite.prepare("SELECT count(*) as count FROM products").get() as { count: number };
    if (!countRow || countRow.count === 0) {
      import("../../db/seed").then(({ runSeed }) => {
        runSeed().catch((err) => console.error("Auto-seed error:", err));
      });
    }
  }
  return instance;
}
