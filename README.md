# GuildWorkman Web

**Live:** [guildworkman-web.vercel.app](https://guildworkman-web.vercel.app) &nbsp;·&nbsp; **X:** [@guildworkman](https://x.com/guildworkman)

The client-facing web app for **GuildWorkman** — a marketplace that connects
clients with skilled tradespeople (electricians, plumbers, beauticians,
carpenters, fashion designers, photographers, and more) for bookable,
in-person appointments. This is the Next.js frontend: it renders the public
marketing site, handles client/worker registration and login, and drives the
booking, cancellation, update, and review flows against the backend API in
[`guildworkman-core`](https://github.com/workman-labs/guildworkman-core).

## Table of contents

- [Project ecosystem](#project-ecosystem)
- [Tech stack](#tech-stack)
- [Design system](#design-system)
- [Brand assets](#brand-assets)
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

GuildWorkman lives in two repositories:

| Repo | Role |
|---|---|
| **`guildworkman-web`** (this repo) | Next.js frontend — everything a client or worker sees and clicks. |
| [`guildworkman-core`](https://github.com/workman-labs/guildworkman-core) | The Spring Boot backend (`backend-api/`) — auth, booking, payments (Paystack), email, and the Postgres-backed domain model, which this repo talks to over REST — **and** the Soroban (Stellar) smart contracts (`soroban-contracts/`) for on-chain escrow, reputation, and loyalty rewards. The contracts aren't called from the backend yet — see [Web3 / Stellar touches](#web3--stellar-touches) below for what's live on the frontend today versus what's still ahead. |

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

- `Button` — `variant`: `primary` / `secondary` / `ghost` / `outline-inverse` / `gold`; `size`: `sm` / `md` / `lg`
- `Input`, `Select` — labeled form fields with built-in error display
- `Card` — bordered/shadowed container
- `Badge` — pill badge with `tone`: `brand` / `gold` / `success` / `error` / `neutral` / `chain` / `navy`

Colors and type are defined once as CSS custom properties in
`src/app/globals.css` and mirrored into Tailwind's `@theme inline` block.
This is **Identity System v1** — see [Brand assets](#brand-assets):

- **Palette** — trust navy (`--navy`) as the primary, guild gold (`--gold`) as
  the reputation accent (the North Star, ratings, escrow seals), and terracotta
  (`--terra`) as the expressive voice reserved for the cultural mark and
  worker-facing bands. All of it sits on a warm sand ground (`--sand`) rather
  than stark white, with warm-biased ink (`--ink`) instead of pure gray.
- **Type** — Inter throughout (grotesque, not serif), loaded via
  `next/font/google`.
- **Dark theme** — a token-level flip in `globals.css`. It follows
  `prefers-color-scheme` by default; a stored preference stamps `data-theme` on
  `<html>` and wins in both directions (`ThemeToggle` in the navbar, with a
  no-FOUC script in the layout).

## Brand assets

The logo marks live in `public/brand/`. Each one ships as an SVG master plus a
4× PNG; **the SVG is the source of truth** — reach for it anywhere the mark
scales (favicons, print, large hero use) and keep the PNG for fixed-size or
non-vector surfaces. PNGs are transparent except where a mark carries its own
tile. In-app, the same geometry is also available as React components in
`src/components/brand/` (`Logo`, `NorthStar`, `AdinkraPattern`) — prefer those
over an `<img>` when the mark needs to inherit theme colors.

| Asset | Use |
|---|---|
| `guildworkman-lockup` | Primary horizontal lockup — chevron + wordmark |
| `guildworkman-lockup-stacked` | Vertical lockup, for square-ish spaces |
| `guildworkman-lockup-reversed` | The lockup recolored for dark grounds |
| `guildworkman-star` | North Star reputation mark, full color |
| `guildworkman-star-mono` | One-color North Star, check knocked out |
| `guildworkman-appicon` | App icon — gold star on an indigo tile |
| `guildworkman-adinkra` | Cultural mark on a terracotta tile |
| `guildworkman-adinkra-mono` | One-color Adinkra glyph, for stamps and print |
| `workman-labs-avatar` | 512×512 GitHub org avatar for [workman-labs](https://github.com/workman-labs) — the North Star on a full-bleed navy tile |

The wordmark in the lockups is set in **Inter** (weight 800), matching the
`Logo` component, so exported art and rendered UI agree.

### Favicons and app icons

Derived from the North Star and wired up through Next's App Router file
conventions — no manual `<link>` tags:

| File | Serves |
|---|---|
| `src/app/favicon.ico` | 16 / 32 / 48px. Per the identity system's "drop the check under 20px" rule, **16px is the plain star**; the check appears from 32px up, where it's legible. |
| `src/app/icon.svg` | Vector favicon, for browsers that take one |
| `src/app/apple-icon.png` | 180×180 iOS home-screen icon |
| `src/app/manifest.ts` | The PWA manifest, pointing at `public/icons/icon-{192,512}.png` |

The tile icons are full-bleed (no baked-in rounded corners — iOS and Android
apply their own masks), and the star is held inside the central 60% so it
survives the maskable safe-zone crop.

### `public/brand/study/`

An **archive of the superseded identity exploration** (`workman-forge`,
`workman-chevron`, `workman-seal`). These are "Workman Labs" wordmarks in an
older steel-blue/amber palette — they are **not** the current GuildWorkman
brand and should never be used anywhere. Nothing here is live; they're kept
only for design reference.

Note that the chevron in this folder shares its peak geometry with the current
`guildworkman-lockup` — it is the same mark in the rejected palette, which is
exactly why it isn't fit for reuse.

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

[`guildworkman-core`](https://github.com/workman-labs/guildworkman-core)'s
`soroban-contracts/` defines three Soroban contracts (`escrow`, `reputation`,
`loyalty-token`), but per its own README, **none of them are called from the
backend yet** — that requires a Soroban RPC client and keypair handling in the
Java backend that doesn't exist today.
Rather than pretend that integration is further along than it is, the
frontend currently does two honest things:

1. **A real wallet connection.** The navbar's "Connect Wallet" button
   (`src/components/WalletButton.tsx`, `src/lib/wallet.ts`) uses
   `@stellar/freighter-api` to connect an actual Freighter wallet, showing a
   truncated address, network (Testnet/Mainnet), and a disconnect option. If
   the Freighter extension isn't installed, it shows an "Install Freighter"
   hint instead of failing silently. This makes **no contract calls** —
   booking, payment, and review logic are all unchanged and still go through
   the backend API/Paystack.
2. **An informational trust layer.** The homepage sections (`Hero`,
   `HowItWorks`, `StatsBand`) plus "Escrow protected" badges on worker cards
   and the booking flow explain in plain language what the contracts *will* do
   (escrow-protected payments, immutable on-chain reviews, loyalty-token
   rewards) once the backend integration lands.

## Project structure

```
src/
  app/            # Next.js App Router routes (one folder per route, page.tsx)
    book/[category]/page.tsx   # dynamic route, server component
  components/
    ui/           # design-system primitives (Button, Input, Select, Card, Badge)
    brand/        # the marks as components (Logo, NorthStar, AdinkraPattern)
    *.tsx         # page-level and shared client components
  lib/
    api.ts        # typed API client — every backend call goes through here
    config.ts     # API_BASE_URL resolution
    types.ts      # shared request/response types
    constants.ts  # category list and skill-detail seed data
    wallet.ts     # useWallet() hook wrapping @stellar/freighter-api
public/
  assets/         # images used across the app
  brand/          # exported logo marks (SVG masters + 4x PNGs)
    study/        # superseded identity exploration — reference only
```

## API integration

All backend calls go through `src/lib/api.ts`, which reads the backend base
URL from `NEXT_PUBLIC_API_BASE_URL` (see `src/lib/config.ts`; defaults to the
hosted GuildWorkman API if unset). It wraps `fetch`/`axios` calls to
the backend's `/api/v1/client/*`, `/api/v1/skilledWorker/*`, and
`/api/v1/auth/*` endpoints — see
[`backend-api/README`](https://github.com/workman-labs/guildworkman-core/blob/development/backend-api/README.md)
for the full endpoint reference.

## Prerequisites

- Node.js 18+ and npm
- A running instance of the backend
  ([`guildworkman-core`](https://github.com/workman-labs/guildworkman-core) →
  `backend-api/`), local or hosted, if you want authenticated flows to work
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
npm test
npx tsc --noEmit   # type-check
npx eslint .        # lint
npx next build      # production build, also runs a TypeScript check
```

There's no dedicated unit/integration test suite yet — verification today is
type-checking, linting, a production build, and Playwright-driven smoke
testing of every route (checking for console errors, layout overflow, and
broken images) done ad hoc during review rather than committed as a CI suite.

## Deployment

Live at **[guildworkman-web.vercel.app](https://guildworkman-web.vercel.app)**,
deployed on [Vercel](https://vercel.com) via its zero-config Next.js detection
(no `vercel.json` needed). Production builds from the `dev` branch; other
branches/PRs get preview deployments. There's no GitHub Actions workflow in
this repo — Vercel builds are triggered directly from pushed branches.

> **Known CORS mismatch.** The backend's CORS is scoped to
> `https://guildworkman.vercel.app/` on the endpoints that restrict origins —
> which is **not** the live frontend origin above
> (`https://guildworkman-web.vercel.app`). Browser calls to those endpoints can
> be blocked in production until the backend allows the correct origin.

## Contributing

Default branch is `dev`. Open a PR against `dev` for review before merging.

## Known limitations

- timezone.ts and slotLock.ts now have unit tests.
- **Escrow funding wizard** (`src/components/escrow/`, `src/lib/escrowFunding.ts`,
  route `/escrow/[bookingRef]`): a standalone, state-machine-driven wizard
  (review → connect wallet → confirm → fund → funded/failed) for the "pay
  into escrow" step, with full keyboard navigation, `aria-live`
  announcements + focus management for screen readers, and resumable
  progress via `localStorage` (same save-and-resume pattern as the identity
  verification wizard). `fundEscrow()` simulates the round trip for the same
  reason `submitIdentityVerification()` does — the Soroban `escrow` contract
  isn't called from the backend yet (see
  [Web3 / Stellar touches](#web3--stellar-touches)) — swap its body for a
  real call once that integration lands. `BookingScreen`'s existing one-shot
  "Pay into escrow" button is unchanged; wiring the booking flow to this
  wizard is a follow-up.
- The wallet-connect button is a real Freighter connection but doesn't yet
  do anything with the connected address — no contract calls, no signing.
  That's intentionally scoped to land alongside the backend Soroban
  integration (see [Web3 / Stellar touches](#web3--stellar-touches)).
- Some seed/demo content in `src/lib/constants.ts` (e.g. placeholder worker
  names and descriptions) is illustrative, not real data.
- **Booking calendar timezone + slot locking** (`src/lib/timezone.ts`,
  `src/lib/slotLock.ts`): the backend's `scheduleTime` is a bare
  `LocalDateTime` with no zone, implicitly meaning Lagos local time — there's
  no per-worker or per-visitor zone stored server-side. The booking calendar
  therefore treats `Africa/Lagos` as the one provider zone, converts it to
  the visitor's browser zone for display, and locks the *date chip* to the
  provider's calendar day (only the *time* re-renders in the visitor's zone,
  with a `+1`/`-1` badge when the converted time crosses midnight) rather
  than shifting a visitor's day forward/back — a full multi-day spillover
  view is a reasonable follow-up if this becomes confusing in practice.
  Slot locking is client-side only (`localStorage` + `BroadcastChannel`,
  5-minute TTL): it stops a visitor from double-booking themselves across
  tabs, but can't stop two different visitors from racing for the same slot
  — that needs a backend "is this worker free at X" endpoint, which
  `guildworkman-core` doesn't expose yet (`viewAllAppointment` only returns
  the logged-in client's own bookings). See the module doc comments for the
  full reasoning.
