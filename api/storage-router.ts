import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { storage } from "./lib/storage";
import { getDb } from "./queries/connection";
import { uploads } from "@db/schema";

export const storageRouter = createRouter({
  upload: adminQuery.input(z.object({ name: z.string().min(1).max(240), contentBase64: z.string().max(8_000_000), contentType: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/)})).mutation(async ({ ctx, input }) => {
    const bytes = Uint8Array.from(Buffer.from(input.contentBase64, "base64"));
    if (bytes.byteLength > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Choose an image under 5 MB." });
    const saved = await storage.uploadFile({ fileContent: bytes, fileName: `products/${Date.now()}-${input.name}`, contentType: input.contentType });
    await getDb().insert(uploads).values({ key: saved.key, ownerId: ctx.user.id, name: saved.fileName, size: saved.size });
    const { url } = await storage.getPresignedUrl({ key: saved.key });
    return { key: saved.key, size: saved.size, url };
  }),
  remove: adminQuery.input(z.object({ key: z.string().max(512) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [file] = await db.select().from(uploads).where(and(eq(uploads.key, input.key), eq(uploads.ownerId, ctx.user.id))).limit(1);
    if (!file) throw new TRPCError({ code: "FORBIDDEN" });
    await db.delete(uploads).where(eq(uploads.id, file.id));
    return { ok: await storage.deleteFile({ fileKey: input.key }) };
  }),
});
