# GuildWorkman Web

The client-facing web app for **GuildWorkman** (a rebrand of the original
Sabi-Connect project), a marketplace that connects clients with skilled
workers (electricians, plumbers, beauticians, carpenters, fashion designers,
photographers, etc.) for bookable appointments. This is a
[Create React App](https://github.com/facebook/create-react-app) single-page
app that talks to the GuildWorkman Spring Boot API
(see [`guildworkman-api`](https://github.com/workman-labs/guildworkman-api)).

## Tech stack

- **React 18** with `react-router-dom` v6 (`useRoutes`) for routing
- **MUI 5** (`@mui/material`, `@mui/icons-material`), Emotion, FontAwesome and Heroicons for UI
- **Formik** + **Yup** and **react-hook-form** for form handling/validation
- **axios** and the native `fetch` API (used interchangeably across API modules) for HTTP calls
- **Leaflet** / **react-leaflet** for map rendering
- **react-dropzone**, **autosuggest-highlight**, **react-icons** as supporting UI utilities
- Bootstrapped with `react-scripts` (Create React App), unejected

## Features

Based on the routes and pages actually implemented (`src/route/index.jsx`):

- **Home** — public landing page (`src/pages/Home`)
- **Client sign up** (`/client`) and **login** (`/login`) — separate flows for clients and skilled workers (`src/pages/LoginPg`, `src/pages/Dashbord/appoint/bookApp/clientrequests/clientregister`)
- **Skilled worker sign up** (`/skilWok`) — worker onboarding/profile creation (`src/pages/Dashbord/appoint/bookApp/workerrequests`)
- **Dashboard** (`/dashboard`) — logged-in landing area (`src/pages/Dashbord/dashboard`)
- **Browse workers by category** (`/book/:category`) — e.g. Electrical, Plumbing, Beauty Care, Carpentry, Fashion, Photography (`src/constants/Constants.jsx`, `src/pages/Dashbord/catigory`)
- **Book / cancel / update / view appointments** (`/book`, `/cancel`, `/update`, `/view`, `/appoint`) — the core appointment lifecycle UI (`src/pages/Dashbord/appoint`)
- **Appointment manager** (`/appMan`) — accept/decline incoming appointment requests for workers (`src/pages/Dashbord/appointmanager`, `appoint/acceptApp`, `appoint/declineApp`)

> Note: the router currently has a duplicated `/appMan` route entry and one
> empty route object at the end of `ROUTE` in `src/route/index.jsx` — worth
> cleaning up. A commented-out `/jobs` route (`src/pages/Jobs`) also exists
> in the codebase but isn't currently wired into the router.

## Project structure

```
src/
  App.js              # renders the router (useRoutes)
  route/index.jsx      # all route definitions
  component/           # shared UI (navbar, footer, layout) + API modules
    clientApi.jsx       # client signup/appointment HTTP calls
    loginApi.jsx         # client/worker login
    skilledworkerApi.jsx # skilled worker signup/skill HTTP calls
  pages/
    Home/               # landing page
    LoginPg/             # client + worker login screens
    Jobs/                # (not currently routed)
    Dashbord/            # everything behind login: appointments, dashboard,
                          # worker categories, appointment manager
  constants/            # static category/data lookups + demo images
  assets/               # images used across worker category cards
  TileLayer.ProjWMTS.js # Leaflet WMTS tile layer helper
public/
  wmts*.html            # standalone Leaflet/WMTS demo pages (not part of
                         # the React app's routed UI — reference/example
                         # pages for the map tile integration)
```

## API integration

The API modules under `src/component/` call the production backend
directly over HTTPS, with the local backend URL left commented out for
local development, e.g. (`src/component/clientApi.jsx`):

```js
const URL = 'https://guildworkman-api.onrender.com/api/v1/client/registerClient';
// const URL = 'http://localhost:8080/api/v1/client/registerClient';
```

There's no central `API_BASE_URL` env var yet — each API module
(`clientApi.jsx`, `loginApi.jsx`, `skilledworkerApi.jsx`) hardcodes the
backend host per function. To point the app at a local backend, uncomment
the `localhost:8080` line(s) for the endpoints you're testing.

Endpoints called by the frontend today include (all under `/api/v1`):
`client/registerClient`, `client/updateAppointment`, `auth/login/client`,
`auth/login/worker`, `skilledWorker/addSkill`, `skilledWorker/registerSkilledWorker`.

## Prerequisites

- Node.js 18+ and npm
- A running instance of the GuildWorkman backend (local or the hosted one above) if you want authenticated flows to work

## Setup

```sh
npm install
```

### Environment variables

`src/.env` currently defines:

```
GOOGLE_KEY=<google-api-key>
```

> **Security note:** a real-looking Google API key and, in the git
> history, a Mapbox secret access token were both found committed to this
> repository. Treat both as compromised — rotate/revoke them in their
> respective consoles — and move any future secrets into an untracked
> `.env.local` (Create React App loads `.env`, `.env.local`, etc.
> automatically) rather than committing them.

## Running locally

```sh
npm start
```

Runs the app at [http://localhost:3000](http://localhost:3000) with hot reload.

## Building for production

```sh
npm run build
```

Outputs an optimized, minified build to `build/`.

## Testing

```sh
npm test
```

Runs `react-scripts test` in interactive watch mode (Jest + React Testing
Library). Only a default `App.test.js` smoke test exists today — most
pages and API modules don't yet have test coverage.

## Contributing

Branches observed in this repo: `dev` (default), `frontendtesting`,
`hommy`, `main`. Open a PR against `dev` for review before merging.
