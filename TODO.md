# Design-System Theme Provider (navy/gold/terracotta) — Implementation Checklist ✓

## Objective
Codify the navy/gold/terracotta identity system into a theme provider with
accessible light and dark modes persisted per user (issue #30).

## Files to Create
- [x] `src/lib/theme.ts` — Theme system single source of truth: `Theme` type,
      `THEME_STORAGE_KEY`, storage get/set, `getSystemTheme`, `applyTheme`,
      `listenForSystemTheme`, `resolveTheme`, and the shared no-FOUC
      `themeScript`.
- [x] `src/components/theme/ThemeProvider.tsx` — React Context provider +
      `useTheme` hook (stored choice wins, OS preference followed live until
      the user picks).
- [x] `src/components/theme/index.ts` — Barrel export (matches
      `notifications/index.ts`).
- [x] `src/lib/test/theme.test.ts` — Unit tests (storage, resolution,
      application, system listening, script).

## Files to Edit
- [x] `src/components/ThemeToggle.tsx` — Consume `useTheme`; added
      `aria-pressed`; visuals unchanged.
- [x] `src/app/layout.tsx` — Wrap app in `<ThemeProvider>`; inline no-FOUC
      script now imported from `@/lib/theme` (single source of truth).

## Architectural Decisions
- **No new dependencies.** Uses React Context (existing pattern from
  `NotificationProvider`), `react-icons` (already a dep), and the existing
  Tailwind v4 token setup.
- **Tokens stay in CSS.** The navy/gold/terracotta tokens and their dark-mode
  overrides live in `src/app/globals.css` via `@theme inline` + `data-theme`
  (this was already in place). `src/lib/theme.ts` owns the *logic* around
  those tokens.
- **Persistence is per-user via localStorage** (key `theme`) — the same
  mechanism the previous standalone toggle used, so existing stored choices
  keep working. No auth/session exists yet, so browser-local is the right
  scope; a per-account key can be layered on later.
- **Dark mode is a first-class, accessible mode:** `color-scheme` is set so
  native controls adapt, focus rings use `outline-gold`, and the toggle
  exposes `aria-label` + `aria-pressed`.
- **No flash of wrong theme (FOUC):** the root layout's inline
  `themeScript` (now imported from `@/lib/theme`) paints the correct theme
  before React hydrates; the provider only keeps React state in sync.
- **OS-follow by default:** until the user makes an explicit choice the
  provider follows `prefers-color-scheme` live; choosing persists and stops
  following.

## Verification
- [x] `npm run lint` — No linting errors
- [x] `npm run typecheck` — No TypeScript errors
- [x] `npm test` — All tests pass (incl. `theme.test.ts`)
- [x] `npm run build` — Production build succeeds

## CI Note
The issue's "add caching for npm dependencies in CI" task was already
satisfied: `.github/workflows/ci.yml` uses `actions/setup-node` with
`cache: npm`.
