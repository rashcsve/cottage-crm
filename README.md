# Chata CRM

A bilingual (Czech / English) Next.js app for running a shared family cottage: who's visiting when, what needs buying, what needs doing, and notes with photos.

It is also a portfolio project showing a modern App Router architecture: feature-local server layers, typed domain mapping, Server Actions with localized validation, Row Level Security, a custom design system, and a tested, accessible UI.

**Live demo:** https://cottage-crm-demo.vercel.app (isolated Supabase project, sample data only)

## Features

- **Home dashboard** (`/overview`) – sections ordered by what needs action, streamed from the server, plus a weather signal for the cottage
- **Visits** – month, week and agenda calendar views for planning stays
- **Supplies** – shared shopping list with status labels and undo
- **To-dos** – tasks with URL-driven filters
- **Notes** – notes with photo uploads and an accessible lightbox
- **Sign-in** – email/password or Google, with `admin` (create/delete) and `viewer` (read) roles
- **Bilingual** – Czech at `/`, English at `/en/`, with a language switcher
- **Installable** – add to your phone's home screen as a PWA
- **Accessible** – built to WCAG 2.1 AA; status is always shown as icon + text, never color alone

## Stack

- `Next.js 16` with the App Router, Server Components and Server Actions
- `React 19` and `TypeScript` (strict)
- `Supabase` for auth, Postgres (with Row Level Security) and photo storage
- `next-intl` for localization
- `react-hook-form` + `zod` for client and server validation
- `Tailwind CSS` with the Fjäll design tokens ([spec](./docs/design/fjall-design-spec.md))
- `Vitest` + Testing Library for unit and component tests
- `Storybook` for shared UI components, with accessibility checks
- `Playwright` for end-to-end tests against a mock data layer

## Try the Demo

Open **https://cottage-crm-demo.vercel.app**. The deployment runs in demo mode, so you're signed in automatically as a shared demo account and dropped straight into the dashboard. There's no login or signup screen in this mode. Because the account is shared, other visitors may see or change the same sample data. A banner in the app makes that clear.

### Demo mode setup

Demo mode is opt-in via environment variables and only affects the deployment where it's set. Set these on the isolated demo Vercel project only, never on production:

```bash
NEXT_PUBLIC_DEMO_MODE=1
DEMO_USER_EMAIL=...
DEMO_USER_PASSWORD=...
```

The email/password must belong to a real, pre-seeded Supabase user in that project (created once via normal signup). Demo mode signs visitors in as that user through Supabase's regular auth flow. It does not bypass Row Level Security. Google sign-in is disabled in demo mode.

## Install on Your Phone

The app can be added to your phone's home screen as a "Chata" icon that opens full-screen, without browser chrome, straight on the overview. It is the same online web app, with the same data, actions and permissions.

- **Android (Chrome):** open the app, then menu (⋮) → **Install app** (or **Add to Home screen**).
- **iPhone/iPad (Safari):** open the app, then **Share** → **Add to Home Screen**.

Install from the language you want: installing from `/` opens the app in Czech, installing from `/en/` opens it in English. The in-app language switcher still works.

Sign in once inside the installed app. After that, opening it takes one tap.

Known platform behaviour:

- The app is online-only, like the browser version. Without a connection the phone shows its standard error screen.
- On iOS the installed app has its own cookie store, separate from Safari, so a Safari sign-in does not carry over.
- Email links (for example signup confirmation) open in the browser, not in the installed app.
- How long you stay signed in is set in the Supabase project settings, not in app code.

## Local Setup (with Supabase)

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

4. Apply the SQL files in [`supabase/migrations`](./supabase/migrations) to your Supabase project, in order.

5. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Roles

New users get the `viewer` role automatically. To let someone create and delete items, change their `role` to `admin` in the `profiles` table in the Supabase dashboard. Promotion is intentionally not possible from the app.

### Google sign-in (optional)

1. In Supabase, go to **Authentication → Providers** and enable **Google** with your Google OAuth client ID and secret.
2. Under **Authentication → URL Configuration**, add both callback URLs for each origin you use, for example:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/en/auth/callback`
3. Optionally set `NEXT_PUBLIC_APP_URL` to the app's public origin. Without it, the request origin is used.

New Google users get their display name from their Google profile.

### Weather (optional)

The overview includes a server-side weather signal. It uses an approximate town-level default location, and can be overridden with private server-only coordinates:

```bash
COTTAGE_WEATHER_LATITUDE=...
COTTAGE_WEATHER_LONGITUDE=...
```

These are intentionally not `NEXT_PUBLIC_*` variables, so exact cottage coordinates stay on the server and are not displayed in the UI.

## Scripts

- `npm run dev` – start the local development server
- `npm run build` / `npm run start` – production build and server
- `npm run lint` – run ESLint
- `npm run typecheck` – run the TypeScript typecheck
- `npm run test:run` – run the Vitest suite once (`-- --project unit` for unit tests only)
- `npm run e2e` – run Playwright end-to-end tests against the built-in mock data layer (no Supabase needed)
- `npm run storybook` – browse shared UI components at `http://localhost:6006`

## Repository Shape

- [`app`](./app) – route tree, layouts, localized public shell, auth callback and route-level pages
- [`features`](./features) – feature slices (`visits`, `shopping`, `tasks`, `notes`, `dashboard`) with server actions, mutations, queries, mappers, schemas and UI
- [`shared`](./shared) – reusable UI primitives, toast system and client hooks
- [`lib`](./lib) – auth, Supabase clients, demo mode, E2E mocks, utilities and shared types
- [`i18n`](./i18n) – routing, config and the `cs` / `en` dictionaries
- [`supabase/migrations`](./supabase/migrations) – database schema and RLS policies
- [`e2e`](./e2e) – Playwright specs
- [`docs`](./docs) – design system spec and feature specs

## Quality Checks

CI runs on pushes and pull requests to `main` and keeps the repository green on:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`
- `npm run e2e` (against a production build)
