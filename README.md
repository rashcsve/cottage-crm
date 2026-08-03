# Chata CRM

A bilingual Next.js portfolio application for managing shared cottage operations: visits, shopping items, tasks, and notes.

The app is built to showcase a modern App Router architecture with feature-local server layers, typed domain mapping, shared UI primitives, optimistic interactions, and localized UX in Czech and English.

## Stack

- `Next.js 16` with the App Router
- `React 19`
- `TypeScript`
- `next-intl` for localization
- `Supabase` for auth and data
- `react-hook-form` + `zod` for client and server validation
- `Vitest` + Testing Library for component and domain tests

## Try the Demo

A live sandbox is available at **https://cottage-crm-demo.vercel.app** — isolated Supabase instance, no access to any real data.

Just open the link — the deployment runs in demo mode, so you're signed in automatically as a shared demo account and dropped straight into the dashboard. There's no login or signup screen in this mode. Because the account is shared, other visitors may see or change the same sample data; a banner in the app makes that clear.

### Demo mode setup

Demo mode is opt-in via environment variables and only ever affects the deployment where it's set — normal deployments are unaffected. Set these on the isolated demo Vercel project only, never on production:

```bash
NEXT_PUBLIC_DEMO_MODE=1
DEMO_USER_EMAIL=admin@cottage.demo
DEMO_USER_PASSWORD=...
```

The email/password must belong to a real, pre-seeded Supabase user in that project (created once via normal signup). Demo mode signs visitors in as that user through Supabase's regular auth flow — it does not bypass Row Level Security.

## Production Setup (with Supabase)

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

3. Fill in the Supabase credentials (leave demo flags commented out):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The authenticated overview includes a server-side weather signal. It uses an
approximate town-level default location, and can be overridden with private
server-only coordinates:

```bash
COTTAGE_WEATHER_LATITUDE=...
COTTAGE_WEATHER_LONGITUDE=...
```

These are intentionally not `NEXT_PUBLIC_*` variables, so exact cottage
coordinates can stay server-only and are not displayed in the UI.

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start the local development server
- `npm run lint` - run ESLint
- `npm exec tsc --noEmit` - run the TypeScript typecheck
- `npm run test:run` - run the Vitest suite once
- `npm run build` - create a production build

## Repository Shape

- [`app`](/Users/svetlanarashchupkina/Desktop/cottage-crm/app) - route tree, layouts, localized public shell, and route-level pages
- [`features`](/Users/svetlanarashchupkina/Desktop/cottage-crm/features) - feature slices with server actions, mutations, queries, domain logic, and UI
- [`shared`](/Users/svetlanarashchupkina/Desktop/cottage-crm/shared) - reusable UI primitives, toast system, and client hooks
- [`lib`](/Users/svetlanarashchupkina/Desktop/cottage-crm/lib) - auth, Supabase helpers, cross-cutting utilities, and shared types
- [`i18n`](/Users/svetlanarashchupkina/Desktop/cottage-crm/i18n) - routing, config, and locale dictionaries

## Quality Checks

The repository is expected to stay green on:

- `npm run lint`
- `npm exec tsc --noEmit`
- `npm run test:run`
- `npm run build`
