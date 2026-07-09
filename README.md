# GuildWorkman Web

The client-facing web app for **GuildWorkman**, a marketplace that connects
clients with skilled workers (electricians, plumbers, beauticians, carpenters,
fashion designers, photographers, etc.) for bookable appointments. Built with
Next.js (App Router), TypeScript, and Tailwind CSS, deployed on Vercel.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **MUI 5** (`@mui/material`, `@mui/icons-material`), wired up with
  `@mui/material-nextjs` for App Router SSR support
- **Formik** + **Yup** and **react-hook-form** for form handling/validation
- **axios** and the native `fetch` API for HTTP calls to the backend
- **Leaflet** / **react-leaflet** for map rendering
- **react-dropzone**, **autosuggest-highlight**, **react-icons** as supporting UI utilities

## Features

- **Home** (`/`) — public landing page with a Leaflet map and category showcase
- **Login** (`/login?as=client|worker`) — shared login form for clients and skilled workers
- **Client sign up** (`/client`) and **skilled worker sign up** (`/skilWok`)
- **Dashboard** (`/dashboard`) — profile management
- **Appointment hub** (`/appoint`) — links into the booking flow
- **Book appointment** (`/book`) — category + skill selection and scheduling
- **Browse workers by category** (`/book/[category]`) — dynamic route
- **Cancel / update / view appointments** (`/cancel`, `/update`, `/view`)
- **Appointment manager** (`/appMan`) — combined booking + cancellation view

## Project structure

```
src/
  app/            # Next.js App Router routes (one folder per route, page.tsx)
  components/     # Shared UI and page-level client components
  lib/
    api.ts        # Typed API client (all backend calls)
    types.ts      # Shared request/response types
    constants.ts  # Category and skill-detail data
public/
  assets/         # Images used across the app
```

## API integration

All backend calls go through `src/lib/api.ts`, which reads the backend base
URL from `NEXT_PUBLIC_API_BASE_URL` (defaults to the hosted GuildWorkman API
if unset — see `src/lib/config.ts`).

## Prerequisites

- Node.js 18+ and npm
- A running instance of [`guildworkman-api`](https://github.com/workman-labs/guildworkman-api) (local or hosted) if you want authenticated flows to work

## Setup

```sh
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_BASE_URL if pointing at a local backend
```

## Running locally

```sh
npm run dev
```

Runs the app at [http://localhost:3000](http://localhost:3000) with hot reload.

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

There's no dedicated test suite yet — verification today is type-checking,
linting, a production build, and manual/Playwright-driven smoke testing of
each route.

## Contributing

Default branch is `dev`. Open a PR against `dev` for review before merging.
