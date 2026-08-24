# Real-Time Escrow Status Timeline with Optimistic Updates

Implements [#26](https://github.com/workman-labs/guildworkman-web/issues/26):
a live escrow lifecycle timeline that reflects on-chain state changes, applies
user actions optimistically, and rolls back gracefully on failure.

## What it does

Route `/escrow/[bookingRef]/timeline` renders the escrow's lifecycle as a
vertical, chronological timeline. From the funded state a client can **release
funds**, **cancel & refund**, or **raise a dispute**; a dispute can then be
**resolved**. Each action:

1. appears **instantly** as an optimistic node at the end of the timeline,
2. **confirms** into the history (with a tx hash + timestamp) once the chain
   settles it, or
3. **rolls back** — the optimistic node disappears, the confirmed history is
   untouched, and an inline error offers a retry.

A background poll keeps the timeline in sync with the authoritative on-chain
status, so a change made elsewhere (e.g. a counterparty acting) shows up live.

## Lifecycle model

Mirrors the Soroban `escrow` contract's `Status` enum and entrypoints
(`guildworkman-core/soroban-contracts/contracts/escrow`):

```
funded ──release──▶ completed (terminal)
       ──cancel───▶ cancelled (terminal)
       ──dispute──▶ disputed ──resolve──▶ resolved (terminal)
```

`actionsFor(status)` is the single source of truth for which actions are legal
from a given status — it drives both the buttons the UI offers and the
transitions the reducer accepts.

## Architecture decisions

1. **The timeline is an append-only event log, not a mutable `status`.**
   `TimelineState.history` is the chronological list of confirmed transitions
   (always rooted at `funded`); the current status is just its last entry. This
   is what the UI needs to *draw* a timeline, and it makes the optimistic layer
   trivially safe: an in-flight action is a single `pending` node appended
   after the confirmed history, never a mutation of it — so rollback is "drop
   the pending node" and the confirmed history is untouched by construction.

2. **One pure reducer owns every transition.** `timelineReducer` handles
   `SUBMIT` / `CONFIRMED` / `FAILED` / `SYNC` / `DISMISS_ERROR` as a pure
   function the UI and tests drive directly. Optimistic-apply-then-rollback
   isn't ad-hoc `useState` juggling; it's `SUBMIT` then `FAILED`, both tested.
   Stale confirmations/failures (superseded by a poll) are ignored by
   submission-id matching, and `SYNC` reconciles authoritative on-chain state:
   it commits an in-flight action whose target it observes, adopts a legal
   external change (dropping any now-impossible optimistic node), and ignores
   states it can't reconcile.

3. **The only impure part is an isolated, swappable chain stub.**
   `lib/escrowChain.ts` simulates the contract (latency, an occasional failed
   submission, an in-memory ledger the poll reads) so the whole feature is
   exercised today. Same rationale as the funding wizard's `fundEscrow` stub —
   `guildworkman-core`'s Soroban `escrow` contract has the methods, but no
   backend REST/RPC endpoint exposes them to the web app yet. Swap the two
   functions' bodies for real calls and nothing else changes. Keeping this out
   of `escrowTimeline.ts` keeps the reducer pure and singleton-free for tests.

4. **Real-time via visibility-aware polling.** `useEscrowTimeline` polls every
   4s, pauses while the tab is hidden, and polls once immediately on becoming
   visible again. A future SSE/WebSocket feed can replace the poll behind the
   same `SYNC` dispatch without touching the reducer or components.

5. **Accessibility.** The optimistic node is an `aria-live` region; confirmed
   status changes are announced through a separate visually-hidden live region;
   the rollback error is `role="alert"`. Colours come entirely from the design
   tokens, so light/dark both work.

## No new dependencies

Uses React (incl. `useSyncExternalStore` for hydration-safe timestamps),
`react-icons`, and the existing `ui/*` primitives and Tailwind token setup.

## Files

| File | Role |
|---|---|
| `src/lib/escrowTimeline.ts` | Pure lifecycle model: statuses, actions, the reducer, and `buildTimelineNodes`. |
| `src/lib/escrowChain.ts` | Isolated simulated on-chain source (swap for a real endpoint). |
| `src/components/escrow/useEscrowTimeline.ts` | Hook: wires the reducer to the chain (optimistic submit + polling). |
| `src/components/escrow/useHydrated.ts` | Hydration-safe "client only" flag for locale timestamps. |
| `src/components/escrow/EscrowTimeline.tsx` | Presentational vertical timeline. |
| `src/components/escrow/EscrowTimelinePanel.tsx` | Smart panel: timeline + actions + live-sync + rollback UI. |
| `src/app/escrow/[bookingRef]/timeline/page.tsx` | Route. |
| `src/lib/test/escrowTimeline.test.ts` | 22 reducer/metadata unit tests. |

`components/escrow/steps/FundingStatusStep.tsx` gained a "Track escrow status"
link from the funded state of the existing funding wizard.

## Verification

- `npm run lint` — clean (no new warnings)
- `npm run typecheck` — no errors
- `npm test` — 110 passed (incl. 22 new)
- `npm run build` — production build succeeds; `/escrow/[bookingRef]/timeline`
  emitted

## CI note

The issue's "add caching for npm dependencies in CI" task is already satisfied:
`.github/workflows/ci.yml` uses `actions/setup-node` with `cache: npm`, and
runs typecheck → lint → test → build, so any PR introducing a type error is
blocked.
