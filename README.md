# Oja — full-stack commerce workspace

Oja is a responsive customer storefront and operational admin workspace backed by one typed API and a persistent database. It includes catalogue discovery, wishlist and cart flows, server-priced checkout, order tracking, inventory history, promotions, homepage merchandising, customer administration, and in-app notifications.

## Implemented architecture

- **Customer and admin web apps:** React 19, TypeScript, Vite, React Router, TanStack Query, and tRPC.
- **Server:** Hono on Node.js with tRPC 11 and Superjson.
- **Persistence:** SQLite with Drizzle ORM and automatic schema initialization/seeding.
- **Authentication:** Standalone session authentication (JWT session cookies), customer & admin sign-in.
- **File storage:** platform-provided object storage; only object keys are persisted, and short-lived rendering URLs are issued by the server.
- **UI:** responsive editorial storefront, desktop-first operations area, Recharts analytics, and Sonner feedback.

This is the platform-supported web implementation of the commerce brief. It is **not** the separate Expo/React Native + Next.js + NestJS + PostgreSQL/Prisma + Redis architecture described in the original proposal. Those native and infrastructure differences are listed under “Scope boundaries” below.

## Customer routes

| Route | Purpose |
| --- | --- |
| `/` | Database-driven homepage, categories, merchandising sections, search |
| `/explore` | Search, category/brand/price/rating/stock filters, sorting |
| `/product/:id` | Gallery, variants, specifications, stock, related products |
| `/wishlist` | Saved products |
| `/cart` | Cart quantities, saved-for-later items, server quote |
| `/checkout` | Address, delivery, coupon and bank-transfer checkout |
| `/orders` | Order details, delivery timeline, cancellation and reorder |
| `/account` | Profile, addresses, notifications and shortcuts |

Guests can browse the catalogue. Cart, wishlist, checkout, orders, and account operations require sign-in.

## Admin routes

Open `/admin`. The sidebar provides Overview, Products, Categories, Orders & payments, Customers, Inventory, Homepage builder, Promotions, Notifications, and Store settings.

Admin access is enforced by API middleware, not merely by hiding navigation. The user matching `OWNER_UNION_ID` receives the admin role on first login. Product image upload/delete operations also require an admin session and ownership checks.

## Local setup

Requirements: Node.js 20+ and a MySQL connection.

```bash
npm install
cp .env.example .env
# Fill the OAuth, database and owner values in .env.
npm run db:push       # use on a fresh development database
npx tsx db/seed.ts    # idempotent catalogue/sample-order seed
npm run dev           # http://localhost:3000
```

Do not run a blanket baseline migration or `db:push` against a populated database without reviewing the schema diff. In the supplied platform environment, credentials and object-storage settings are already injected; do not replace them.

Production commands:

```bash
npm run check
npm run build
npm start
```

The build writes the browser app to `dist/public` and the server entrypoint to `dist/boot.js`. `PORT` can override the default port `3000`.

## Checkout and payment behavior

- All prices, discounts, delivery fees, and totals are calculated on the server in **integer kobo**. Client-supplied totals are never accepted.
- Coupons are validated for active state, expiry, and minimum spend during quoting and again at order placement.
- Checkout uses a client-generated idempotency key. Repeating the same request returns the original order without duplicating order records or stock decrements.
- Stock is decremented with a conditional atomic update inside the order transaction. Insufficient stock aborts the entire order.
- Customer and admin cancellation atomically claim the order before restoring stock. Restocks create inventory movement records, and repeated cancellation cannot restock twice.
- **Bank transfer** creates a pending-payment order. An administrator verifies payment and updates payment/fulfilment status in the admin workspace.
- **Paystack is not connected.** Its checkout option is disabled, and the server rejects Paystack placement attempts. No client payment success is treated as verified payment.

## Security and data model

- `publicQuery`, `authedQuery`, and `adminQuery` separate public, signed-in, and admin procedures.
- Suspended accounts are rejected on every authenticated procedure.
- Order and address queries are scoped to the current customer; admin procedures require the admin role.
- Order items preserve name, image, variant, quantity, and unit-price snapshots.
- Order events and inventory movements provide an append-only operational history.
- Uploads accept PNG, JPEG, or WebP up to 5 MB after decoding. The browser never receives storage credentials.
- Secrets stay in server environment variables and `.env` is excluded from version control.

## Scope boundaries

The following are intentionally not represented as complete:

- Native Android/iOS Expo application, Expo Router, Reanimated, Zustand, and Expo push notifications.
- Separate Next.js admin and NestJS API applications.
- PostgreSQL/Prisma, Redis queues/cache, and a separate refresh-token service.
- Paystack payment initialization, signature-verified webhooks, and automated refund processing.
- Cloudinary-specific integration; this implementation uses the provided object-storage service.
- Docker/Coolify packaging and public deployment.
- Email/SMS/native push delivery. Broadcasts currently create in-app notifications only.
- Customer-submitted reviews, AI search, recently viewed history, and marketplace/seller functionality.

## Verification performed

- TypeScript project check and production client/server build.
- Guest browsing, instant/catalogue search, product variants, authentication gates, and responsive layouts at phone, tablet, and desktop widths.
- Authenticated cart persistence, address selection, `OJA15` discount, bank-transfer order creation, order details, cancellation, and stock restoration.
- Duplicate checkout retry: same order ID/number, one stock decrement.
- Concurrent customer cancellation and repeated admin cancellation: one cancellation event and one restock movement.
- Suspended account: authenticated API returns HTTP 403 until access is restored.
- Admin analytics, catalogue CRUD/live preview, orders, customers, inventory, homepage, promotions, notifications, and settings.
- Real object-storage upload, metadata/list/presigned-read checks, ownership-checked deletion, and cleanup.
- Customer role blocked from admin APIs/UI; no page-level JavaScript errors in the tested flows.

See [ASSETS.md](./ASSETS.md) for demo image attribution and licensing notes.
