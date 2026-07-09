# GuildWorkman Web

The client-facing web app for **GuildWorkman** — a marketplace that connects
clients with skilled tradespeople (electricians, plumbers, beauticians,
carpenters, fashion designers, photographers, and more) for bookable,
in-person appointments. This is the Next.js frontend: it renders the public
marketing site, handles client/worker registration and login, and drives the
booking, cancellation, update, and review flows against
[`guildworkman-api`](https://github.com/workman-labs/guildworkman-api).

## Table of contents

- [Project ecosystem](#project-ecosystem)
- [Tech stack](#tech-stack)
- [Design system](#design-system)
- [Features](#features)
- [Web3 / Stellar touches](#web3--stellar-touches)
- [Project structure](#project-structure)
- [API integration](#api-integration)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running locally](#running-locally)
- [Building for production](#building-for-production)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Known limitations](#known-limitations)

## Project ecosystem

GuildWorkman is split across three repositories, each with a different job:

| Repo | Role |
|---|---|
| **`guildworkman-web`** (this repo) | Next.js frontend — everything a client or worker sees and clicks. |
| [`guildworkman-api`](https://github.com/workman-labs/guildworkman-api) | Spring Boot backend — auth, booking, payments (Paystack), email, and the Postgres-backed domain model. This repo talks to it over REST. |
| [`guildworkman-contracts`](https://github.com/workman-labs/guildworkman-contracts) | Soroban (Stellar) smart contracts for on-chain escrow, reputation, and loyalty rewards. Not yet called from the backend — see [Web3 / Stellar touches](#web3--stellar-touches) below for what's live on the frontend today versus what's still ahead. |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — a hand-rolled design system (no component library);
  see [Design system](#design-system)
- **Formik** + **Yup** for the login/signup forms; **react-hook-form** +
  **react-dropzone** for the profile form's file upload
- **axios** and the native `fetch` API for HTTP calls to the backend
- **Leaflet** / **react-leaflet**, loaded dynamically client-side, for the
  homepage location map and search
- **@stellar/freighter-api** for wallet connect (see below)
- **react-icons** (Heroicons v1 set) for all iconography

## Design system

The whole UI is built on a small set of hand-written Tailwind primitives in
`src/components/ui/` rather than a component library:

- `Button` — `variant`: `primary` / `secondary` / `ghost` / `outline-inverse`; `size`: `sm` / `md` / `lg`
- `Input`, `Select` — labeled form fields with built-in error display
- `Card` — bordered/shadowed container
- `Badge` — pill badge with `tone`: `brand` / `gold` / `success` / `error` / `neutral` / `chain`

Colors and type are defined once as CSS custom properties in
`src/app/globals.css` and mirrored into Tailwind's `@theme inline` block:

- **Palette** — warm terracotta (`brand-*`) as the primary color, warm
  charcoal (`ink-*`) instead of pure gray, cream instead of stark white, gold
  as a secondary accent, and a deep indigo (`chain-*`) reserved specifically
  for on-chain/wallet touches so they read as a distinct layer rather than
  blending into the brand palette.
- **Type** — Fraunces (serif) for headings, Inter (sans) for body text, both
  loaded via `next/font/google`.

## Features

- **Home** (`/`) — hero with an image collage, location search, a Leaflet
  map, category showcase, and a "Trust, backed by smart contracts" section
- **Login** (`/login?as=client|worker`) — shared login form for clients and
  skilled workers, split-panel layout
- **Client sign up** (`/client`) and **skilled worker sign up** (`/skilWok`)
- **Dashboard** (`/dashboard`) — profile management with photo upload
- **Appointment hub** (`/appoint`) — entry point into the booking flow
- **Book appointment** (`/book`) — category + skill selection and scheduling
- **Browse workers by category** (`/book/[category]`) — dynamic route,
  server-rendered worker listing
- **Cancel / update / view appointments** (`/cancel`, `/update`, `/view`)
- **Appointment manager** (`/appMan`) — combined booking + cancellation view

## Web3 / Stellar touches

`guildworkman-contracts` defines three Soroban contracts (`escrow`,
`reputation`, `loyalty-token`), but per that repo's own README, **none of
them are called from `guildworkman-api` yet** — that requires a Soroban RPC
client and keypair handling in the Java backend that doesn't exist today.
Rather than pretend that integration is further along than it is, the
frontend currently does two honest things:

1. **A real wallet connection.** The navbar's "Connect Wallet" button
   (`src/components/WalletButton.tsx`, `src/lib/wallet.ts`) uses
   `@stellar/freighter-api` to connect an actual Freighter wallet, showing a
   truncated address, network (Testnet/Mainnet), and a disconnect option. If
   the Freighter extension isn't installed, it shows an "Install Freighter"
   hint instead of failing silently. This makes **no contract calls** —
   booking, payment, and review logic are all unchanged and still go through
   `guildworkman-api`/Paystack.
2. **An informational trust layer.** `src/components/TrustSection.tsx` on
   the homepage, plus "Escrow protected" badges on worker/skill listings,
   explain in plain language what the contracts *will* do (escrow-protected
   payments, immutable on-chain reviews, loyalty-token rewards) once the
   backend integration lands.

## Project structure

```
src/
  app/            # Next.js App Router routes (one folder per route, page.tsx)
    book/[category]/page.tsx   # dynamic route, server component
  components/
    ui/           # design-system primitives (Button, Input, Select, Card, Badge)
    *.tsx         # page-level and shared client components
  lib/
    api.ts        # typed API client — every backend call goes through here
    config.ts     # API_BASE_URL resolution
    types.ts      # shared request/response types
    constants.ts  # category list and skill-detail seed data
    wallet.ts     # useWallet() hook wrapping @stellar/freighter-api
public/
  assets/         # images used across the app
```

## API integration

All backend calls go through `src/lib/api.ts`, which reads the backend base
URL from `NEXT_PUBLIC_API_BASE_URL` (see `src/lib/config.ts`; defaults to the
hosted GuildWorkman API if unset). It wraps `fetch`/`axios` calls to
`guildworkman-api`'s `/api/v1/client/*`, `/api/v1/skilledWorker/*`, and
`/api/v1/auth/*` endpoints — see that repo's README for the full endpoint
reference.

## Prerequisites

- Node.js 18+ and npm
- A running instance of [`guildworkman-api`](https://github.com/workman-labs/guildworkman-api)
  (local or hosted) if you want authenticated flows to work
- The [Freighter](https://www.freighter.app/) browser extension if you want
  to try the wallet-connect button — the rest of the app works fine without it

## Setup

```sh
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_BASE_URL if pointing at a local backend
```

## Running locally

```sh
npm run dev
```

Runs the app at [http://localhost:3000](http://localhost:3000) with hot
reload (Turbopack).

## Building for production

```sh
npm run build
npm start
```

## Testing

```sh
npx tsc --noEmit   # type-check
npx eslint .        # lint
npx next build      # production build, also runs a TypeScript check
```

There's no dedicated unit/integration test suite yet — verification today is
type-checking, linting, a production build, and Playwright-driven smoke
testing of every route (checking for console errors, layout overflow, and
broken images) done ad hoc during review rather than committed as a CI suite.

## Deployment

Deployed on [Vercel](https://vercel.com) via its zero-config Next.js
detection (no `vercel.json` needed) — `guildworkman-api`'s CORS is scoped to
`https://guildworkman.vercel.app/` on the endpoints that restrict origins.
There's no GitHub Actions workflow in this repo yet; Vercel builds and
previews are triggered directly from pushed branches/PRs.

## Contributing

Default branch is `dev`. Open a PR against `dev` for review before merging.

## Known limitations

- No automated test suite (see [Testing](#testing)).
- The wallet-connect button is a real Freighter connection but doesn't yet
  do anything with the connected address — no contract calls, no signing.
  That's intentionally scoped to land alongside the backend Soroban
  integration (see [Web3 / Stellar touches](#web3--stellar-touches)).
- Some seed/demo content in `src/lib/constants.ts` (e.g. placeholder worker
  names and descriptions) is illustrative, not real data.
