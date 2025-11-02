---
description: Repository Information Overview
alwaysApply: true
---

# Service Marketplace Information

## Summary
A Next.js-based service marketplace application that connects service providers with customers. The platform includes features for provider verification, service listings, bookings, payments via Stripe, and reviews.

## Structure
- **app/**: Next.js app router with pages and API routes
  - **admin/**: Admin dashboard and verification management
  - **api/**: Backend API endpoints for services, bookings, payments
  - **auth/**: Authentication flows and user management
  - **provider/**: Service provider dashboard and profile setup
  - **customer/**: Customer booking management and dashboard
  - **services/**: Service listing and details pages
- **components/**: Reusable UI components
  - **shared/**: Common components like Navbar, Footer, Sidebar
  - **ui/**: UI component library based on Radix UI
- **lib/**: Utility functions and service integrations
  - **supabase/**: Supabase client configuration
  - **stripe.ts**: Stripe payment integration
- **scripts/**: SQL scripts for database setup
- **public/**: Static assets and images
- **styles/**: Global CSS styles

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.x
**Framework**: Next.js 16.0.0
**React Version**: 19.2.0
**Build System**: Next.js build system
**Package Manager**: npm/pnpm (both package-lock.json and pnpm-lock.yaml present)

## Dependencies
**Main Dependencies**:
- **Next.js**: Frontend framework (v16.0.0)
- **React**: UI library (v19.2.0)
- **Supabase**: Backend database and authentication
- **Stripe**: Payment processing
- **Radix UI**: Component primitives
- **TailwindCSS**: Utility-first CSS framework
- **React Hook Form**: Form handling with Zod validation
- **date-fns**: Date manipulation
- **Sonner**: Toast notifications

**Development Dependencies**:
- **TypeScript**: Type checking (v5.x)
- **TailwindCSS**: CSS framework (v4.1.9)
- **PostCSS**: CSS processing

## Build & Installation
```bash
# Install dependencies
npm install
# or
pnpm install

# Development server
npm run dev
# or
pnpm dev

# Production build
npm run build
# or
pnpm build

# Start production server
npm start
# or
pnpm start
```

## Database
**Provider**: Supabase
**Schema**: SQL scripts in the scripts/ directory define the database schema:
- Profiles
- Provider verification
- Services
- Bookings
- Payments
- Reviews

## Authentication
**Provider**: Supabase Auth
**Implementation**: Server-side and client-side authentication using @supabase/ssr

## API Structure
**Routes**:
- **/api/services**: Service listing and management
- **/api/bookings**: Booking creation and management
- **/api/payments**: Payment processing with Stripe
- **/api/reviews**: Service review system
- **/api/provider**: Provider-specific operations
- **/api/admin**: Admin operations and verifications

## Environment Configuration
**Required Variables**:
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key
- STRIPE_SECRET_KEY: Stripe API secret key (referenced but not in .env.local)