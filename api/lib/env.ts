import "dotenv/config";


export const env = {
  appId: process.env.APP_ID ?? "oja-store",
  appSecret: process.env.APP_SECRET ?? "oja-secret-key-default-2026",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "oja.db",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "seed-admin",
};
