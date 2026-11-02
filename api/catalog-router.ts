import { z } from "zod";
import { and, asc, desc, eq, gte, lte, like, ne, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, homepageSections, products } from "@db/schema";
import { storage } from "./lib/storage";

export async function resolveProductImage<T extends { imageUrl: string; imageKey: string | null }>(product: T) {
  if (!product.imageKey) return product;
  try {
    const { url } = await storage.getPresignedUrl({ key: product.imageKey });
    return { ...product, imageUrl: url };
  } catch {
    return product;
  }
}

export function parseProduct<T extends { galleryJson: string; colorsJson: string; sizesJson: string; specificationsJson: string; imageKey?: string | null; imageUrl?: string }>(product: T) {
  const gallery = JSON.parse(product.galleryJson) as string[];
  return {
    ...product,
    gallery: product.imageKey && product.imageUrl ? [product.imageUrl, ...gallery.slice(1)] : gallery,
    colors: JSON.parse(product.colorsJson) as string[],
    sizes: JSON.parse(product.sizesJson) as string[],
    specifications: JSON.parse(product.specificationsJson) as Record<string, string>,
  };
}

export const catalogRouter = createRouter({
  home: publicQuery.query(async () => {
    const db = getDb();
    const [sections, cats, items] = await Promise.all([
      db.select().from(homepageSections).where(eq(homepageSections.enabled, true)).orderBy(asc(homepageSections.position)),
      db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.position)),
      db.select().from(products).where(eq(products.published, true)),
    ]);
    const resolved = await Promise.all(items.map((item) => resolveProductImage(item)));
    const parsed = resolved.map(parseProduct);
    return {
      categories: cats,
      sections: sections.map((section) => {
        const ids = JSON.parse(section.productIdsJson) as number[];
        return { ...section, productIds: ids, products: ids.map((id) => parsed.find((p) => p.id === id)).filter(Boolean) };
      }),
    };
  }),

  list: publicQuery.input(z.object({
    search: z.string().optional(), category: z.string().optional(), sort: z.enum(["featured", "newest", "price_asc", "price_desc", "rating"]).default("featured"),
    minPrice: z.number().int().nonnegative().optional(), maxPrice: z.number().int().nonnegative().optional(),
    minRating: z.number().int().min(0).max(50).optional(), inStock: z.boolean().optional(),
  })).query(async ({ input }) => {
    const db = getDb();
    const conditions = [eq(products.published, true)];
    if (input.search) conditions.push(or(like(products.name, `%${input.search}%`), like(products.brand, `%${input.search}%`), like(products.description, `%${input.search}%`))!);
    if (input.category) conditions.push(eq(categories.slug, input.category));
    if (input.minPrice !== undefined) conditions.push(gte(products.priceKobo, input.minPrice));
    if (input.maxPrice !== undefined) conditions.push(lte(products.priceKobo, input.maxPrice));
    if (input.minRating !== undefined) conditions.push(gte(products.rating, input.minRating));
    if (input.inStock) conditions.push(gte(products.stock, 1));
    const order = input.sort === "price_asc" ? asc(products.priceKobo) : input.sort === "price_desc" ? desc(products.priceKobo) : input.sort === "rating" ? desc(products.rating) : input.sort === "newest" ? desc(products.createdAt) : desc(products.featured);
    const rows = await db.select({ product: products, categoryName: categories.name }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(and(...conditions)).orderBy(order);
    return Promise.all(rows.map(async ({ product, categoryName }) => ({ ...parseProduct(await resolveProductImage(product)), categoryName })));
  }),

  detail: publicQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = getDb();
    const [product] = await db.select().from(products).where(and(eq(products.id, input.id), eq(products.published, true))).limit(1);
    if (!product) return null;
    const related = await db.select().from(products).where(and(eq(products.published, true), ne(products.id, product.id), product.categoryId ? eq(products.categoryId, product.categoryId) : undefined)).limit(4);
    return { product: parseProduct(await resolveProductImage(product)), related: await Promise.all(related.map(async (item) => parseProduct(await resolveProductImage(item)))) };
  }),
});
