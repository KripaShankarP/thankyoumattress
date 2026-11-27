# Thankyou Mattresses — Next.js e-commerce site

A modern, animated e-commerce rebuild of www.thankyoumattresses.com.
Built with Next.js 16 (App Router, Cache Components), Tailwind CSS v4 and Framer Motion.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start   # production
```

Set `ADMIN_KEY` to turn on the admin dashboard at `/admin?key=<ADMIN_KEY>` (orders + enquiries):

```bash
ADMIN_KEY=choose-a-long-secret npm start
```

## Where things live

| What | File |
| --- | --- |
| Products, prices, sizes, images | `src/data/products.ts` |
| Phone, address, socials, videos, testimonials, FAQ, coupon codes | `src/data/site.ts` |
| Warranty chart | `src/data/warranty.ts` |
| Server-side pricing (never trusts browser prices) | `src/lib/pricing.ts` |
| Orders / enquiries storage | `src/lib/store.ts` → `data/*.json` |
| Product images | `public/images/` |

Adding a product = add an entry to `products.ts` + images in `public/images/<folder>/`. The shop, product page,
menus, sitemap and API pick it up automatically.

## Pages
`/` home · `/shop` (search, filters, sort) · `/product/[slug]` (gallery, model/thickness/size selector, price chart, videos)
· `/cart` · `/checkout` (COD / UPI) · `/order-success` · `/videos` · `/about` · `/contact` · `/warranty-terms` (calculator) · `/admin`

## API
- `GET /api/products?category=&q=&sort=` · `GET /api/products/[slug]`
- `POST /api/orders` · `GET /api/orders` (header `x-admin-key`)
- `POST /api/enquiries`

Old site URLs (`/relaxo-series`, `/coir-series`, …) 308-redirect to the new product pages.

## Before going live
- Orders are saved to JSON files in `data/`. That works on a VPS / Node server. On serverless hosting (e.g. Vercel)
  the filesystem is not persistent, so swap `src/lib/store.ts` for a database.
- Online payment (Razorpay etc.) is not wired yet; checkout offers Cash on Delivery and "UPI — we'll call you".
- The struck-through MRP is calculated as ~1.5× the list price, matching how the old site showed it.
