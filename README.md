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

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Start the dev server:

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
