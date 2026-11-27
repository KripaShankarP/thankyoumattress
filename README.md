# Thankyou Mattresses

Three apps, one repository:

| Folder | What it is | Runs on |
| --- | --- | --- |
| `frontend/` | The public website (Next.js 16) | http://localhost:3000 |
| `backend/` | The API and database (NestJS 12 + Prisma 7 + PostgreSQL) | http://localhost:4000 |
| `admin/` | The admin dashboard (React + Vite) | http://localhost:5173 |

```
website (3000) ──/api, /uploads──▶ backend (4000) ◀──/api, /uploads── admin (5173)
                                      │
                                 PostgreSQL
```

Products, prices, colours, videos, coupons, GST, the store offer and delivery charges all live in the database and are edited in the admin. Orders and enquiries from the website are saved there too. After every admin change the backend tells the website to refresh its cached catalogue (`POST /api/revalidate`), so changes show at once.

## First-time setup

Needs Node 22+ and PostgreSQL. Use npm 10 or newer (`npm -v`); npm 9 fails on the backend install with `Cannot read properties of null (reading 'edgesOut')`. Upgrade it with `sudo npm i -g npm@11`, or prefix installs with `npx npm@11`.

```bash
# 1. Backend + database
cd backend
cp .env.example .env               # then edit ADMIN_EMAIL / ADMIN_PASSWORD
npm install
bash scripts/setup-local-db.sh     # creates the DB on your PostgreSQL, tables, products and the first admin
npm run start:dev

# 2. Website (new terminal)
cd frontend
cp .env.example .env.local         # set REVALIDATE_SECRET to the same value as in backend/.env
npm install
npm run dev

# 3. Admin (new terminal)
cd admin
npm install
npm run dev
```

Sign in to the admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`. You can then change the password in **Settings** and add staff accounts.

`setup-local-db.sh` uses `sudo -u postgres`, so it asks for your computer's login password, not the PostgreSQL one. To use another database (Neon, Supabase, a server), put its URL in `DATABASE_URL` in `backend/.env` and run `npx prisma migrate deploy && npm run db:seed`.

## Customer sign-in (OTP)

Customers must sign in before they can order. The checkout sends them to `/login`, and the backend refuses `POST /api/orders` without a customer session. On the login page they choose:

- **Mobile number** (exactly 10 digits, starting 6–9): a 6-digit code is sent by SMS.
- **Email**: a 6-digit code is sent to that inbox.

Codes last 5 minutes. A code can be re-sent after 30 seconds, at most 5 times an hour, and allows 5 wrong tries. Customers who sign in with email give a 10-digit delivery number at checkout. The profile page `/account` shows their details and all their orders.

Delivery is configured in `backend/.env`:

| Setting | Development | Live |
| --- | --- | --- |
| `SMS_PROVIDER` | `console`: the code is printed in the backend terminal and shown on the login page | `msg91` (with `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`) or `fast2sms` (with `FAST2SMS_API_KEY`) |
| `MAIL_TRANSPORT` | `log`: same as above | `smtp` with `SMTP_URL`, e.g. `smtps://you%40gmail.com:APP-PASSWORD@smtp.gmail.com:465` (a Gmail App Password) |

With `NODE_ENV=production` the backend refuses to start on `console` or `log`, so codes are never shown on the page in production.

## Everyday commands

| Where | Command | Does |
| --- | --- | --- |
| backend | `npm run start:dev` | API with reload on save |
| backend | `npm run db:studio` | Browse the database in the browser |
| backend | `npm run db:migrate -- --name what-changed` | After editing `prisma/schema.prisma` |
| backend | `npm test` / `npm run test:e2e` | Unit tests / API tests (need the database; the API tests add a test customer and order) |
| frontend | `npm run dev` / `npm run build` | Website (the backend must be running for both) |
| admin | `npm run dev` / `npm run build` | Admin dashboard |

## Where things are

- Database schema: `backend/prisma/schema.prisma`. The starting catalogue the seed loads: `backend/prisma/seed-data.ts`.
- API routes:
  - Public: `GET /api/catalog`, `GET /api/coupons/:code`, `POST /api/enquiries`.
  - Customers: `/api/customer/*` (OTP sign-in, profile, my orders). `POST /api/orders` needs a signed-in customer.
  - Admin sign-in: `/api/auth/*`.
  - Everything under `/api/admin/*` needs an admin session.
- Uploaded photos and videos: `backend/uploads/`, served at `/uploads/…`. Back this folder up together with the database.
- Pricing rules live in two places that must match: `backend/src/common/pricing.ts` (the bill that is saved) and `frontend/src/lib/pricing.ts` (what the customer sees). The rules are: MRP − offer %, then − coupon %, then + delivery outside the free pincodes, then + GST.

## Going live

- Run the backend with `NODE_ENV=production` behind HTTPS. The admin session cookie is `Secure`.
- Set `FRONTEND_URL` and `ADMIN_URL` in `backend/.env` to the real addresses, `API_URL` for the website and the admin, and `VITE_SITE_URL` for the admin build.
- Keep `backend/uploads/` on a persistent disk. On a host whose disk resets on deploy, use object storage instead.
- The admin build (`admin/dist`) is static files. Serve it with `/api` and `/uploads` proxied to the backend on the same domain (for example `admin.example.com`).
