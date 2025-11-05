# Easy_Service

Easy_Service is a modern service‑marketplace web application built with Next.js and TypeScript. It provides provider onboarding, searchable service listings, booking flows, payments (Stripe), and user authentication backed by Supabase. This repository contains the full frontend (App Router), API routes, and integration code used by the project.

## Key features

- Provider and customer authentication (Supabase)
- Provider onboarding and verification workflows
- Searchable listings and calendar/booking flows
- Integrated Stripe payments and webhook handling
- Admin pages for disputes, verifications, and dashboards
- Component-driven UI with Tailwind CSS and Radix UI primitives

## Tech stack (detected)

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS (v4) + animations
- Supabase (Auth + Postgres + Storage)
- Stripe for payments and webhooks
- Radix UI, lucide-react, sonner, gsap and other UI libs

The stack was inferred from `package.json`, `app/`, and `lib/` files.

## Prerequisites

- Node.js (recommended v18+)
- pnpm (repo includes a `pnpm-lock.yaml`) or npm/yarn
- A Supabase project (for Auth and database)
- A Stripe account (for payments and webhooks)

## Quick start (development) — Windows PowerShell

1. Copy the environment template and set secrets:

```powershell
cp .env.local.example .env.local  # or create .env.local manually
# then edit .env.local and fill in the values below
```

2. Install dependencies and run development server:

```powershell
pnpm install
pnpm dev
# or using npm
npm install
npm run dev
```

By default the app runs on http://localhost:3000

## Important environment variables

The codebase uses the following environment variables (found in `lib/`):

- NEXT_PUBLIC_SUPABASE_URL - your Supabase project URL (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY - your Supabase anon/public key
- STRIPE_SECRET_KEY - your Stripe secret key (server-side)
- STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret (used by /api/payments/webhook)

Create `.env.local` in the repository root containing these (example):

```bash
# .env.local (example - DO NOT COMMIT SECRETS)
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Notes:
- `NEXT_PUBLIC_*` vars are exposed to the browser intentionally (Supabase client). Keep private keys (service role) out of the client.
- The Stripe secret key is only used server-side (`lib/stripe.ts`).

## Database / migrations

This repository includes SQL files under `scripts/` (for creating tables such as profiles, services, bookings, payments, reviews, etc.). For a Postgres-compatible database (Supabase uses Postgres):

1. Create a Supabase project (or a local Postgres instance).
2. Execute the SQL files in `scripts/` against your database (for Supabase you can run these via the SQL editor or psql):

```powershell
# Example using psql against a local or remote Postgres
# psql -h host -U user -d dbname -f .\scripts\001_create_profiles.sql
```

If you use Supabase, run the SQL files in the Supabase SQL editor or via the CLI so the schema matches the expected tables.

## Stripe webhooks

The project includes an API route for Stripe webhooks at `app/api/payments/webhook/route.ts`. To test webhooks locally you can use `stripe listen` and forward events to `http://localhost:3000/api/payments/webhook` and set `STRIPE_WEBHOOK_SECRET` accordingly.

## Common scripts

From `package.json`:
- `pnpm dev` / `npm run dev` — run Next.js in development
- `pnpm build` / `npm run build` — build for production
- `pnpm start` / `npm run start` — start Next.js production server
- `pnpm lint` / `npm run lint` — run ESLint

## Project layout (high level)

- `app/` - Next.js App Router pages and API routes
- `components/` - UI components and theme provider
- `ui/` - shared UI primitives used across pages
- `lib/` - integrations (Supabase, Stripe, utils)
- `scripts/` - DB schema SQL files
- `public/` - static assets

## Notes & recommendations

- `next.config.mjs` currently sets `typescript.ignoreBuildErrors = true` — consider enabling strict build checks for CI.
- The project uses `@supabase/ssr` for server and browser supabase clients. Ensure your Supabase keys are configured correctly for server vs client usage.
- Use the included SQL scripts to set up database schema before testing booking/payment flows.

## Contributing

If you'd like help shaping this README (add env variable descriptions, example .env templates, or deployment steps), tell me what you want included and I can expand it — I can also create a `.env.local.example` file if you'd like one added.

## License

Add your project license here.
