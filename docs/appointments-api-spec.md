# Appointments API — backend spec (guildworkman-core / backend-api)

**Status:** proposed · blocks the account/appointments redesign
**Audience:** whoever owns the backend (`guildworkman-core` → `backend-api/`)

## Why

The redesigned account screens (client appointment list, cancel, and the
worker accept/decline inbox) need to read a client's appointments and act on a
specific one. The frontend API client (`src/lib/api.ts`) has been corrected to
match the current backend contract for the mutation endpoints, but the **read**
endpoint doesn't return enough to build the UI.

### What the API returns today

`GET /api/v1/client/viewAllAppointment?clientId={id}` →

```json
{ "data": { "scheduleTime": "13-July-2026 at 11:00 AM", "category": "ELECTRICAL" }, "status": true }
```

Problems:

1. **It's a single object, not a list** — a "view all" that returns one appointment.
2. **No `id`** — so the client can never obtain an `appointmentId` to pass to
   `cancelAppointment` / `updateAppointment` / `deleteAppointment` (all of which
   require `?appointmentId=`). The management flow is unreachable end-to-end.
3. **No `status`, worker, or `amount`** — nothing to render a real list or map to
   the escrow lifecycle.

## What's needed

### 1. `viewAllAppointment` should return a **list** with richer records

`GET /api/v1/client/viewAllAppointment?clientId={id}` →

```json
{
  "status": true,
  "data": [
    {
      "id": 1024,
      "status": "SCHEDULED",
      "category": "ELECTRICAL",
      "scheduleTime": "2026-07-13T11:00:00",
      "amount": 8800,
      "worker": { "id": 42, "fullName": "Chidi O.", "trade": "Electrician" }
    }
  ]
}
```

- `scheduleTime` as ISO-8601 (`LocalDateTime`) is preferable to the display-formatted
  string — the frontend formats for display. If the formatted string must stay, add
  an ISO field alongside it.
- `worker` summary (`id`, `fullName`, `trade`) powers the appointment cards; without
  it the UI can only show category + time.

Suggested `ViewAllAppointmentsResponse` fields: `id: Long`, `status: AppointmentStatus`,
`category: Category`, `scheduleTime: LocalDateTime`, `amount: BigDecimal`, `worker` (id + name + trade).
And the service should return `List<ViewAllAppointmentsResponse>`.

### 2. (Optional) Extend `AppointmentStatus` for the escrow lifecycle

Current enum: `ACCEPTED, DECLINED, SCHEDULED, CANCELLED, UPDATED`.

The redesign shows a **"confirm & release"** step (client releases escrow once the job
is done). There's no `COMPLETED`/`RELEASED` state to represent that. If escrow
release is in scope, add e.g. `COMPLETED` (job done, funds released) and optionally
`REFUNDED`. If not, the UI will map "done" onto existing states and hide the release
action until the Soroban escrow work lands.

### 3. Mutation endpoints — no change needed

The frontend now matches these as-is:

| Action | Method | Path | Body |
|---|---|---|---|
| Cancel | `PUT` | `/api/v1/client/cancelAppointment?appointmentId={id}` | — |
| Accept/decline | `PUT` | `/api/v1/client/updateAppointment?appointmentId={id}` | `{ "status": "ACCEPTED" \| "DECLINED", ... }` |
| Delete | `DELETE` | `/api/v1/client/deleteAppointment?appointmentId={id}` | `{ "appointment_Id": {id} }` |

All wrap their payload in `ApiResponse { data, status }` — the frontend unwraps `data`.

## Frontend readiness

- `api.ts` already calls the correct method/params for cancel/update/delete and unwraps
  `ApiResponse`.
- `types.ts` has an `Appointment` interface ready for the richer record above; only
  `viewAllAppointment`'s response needs to become that list.
- Once the list ships, the cancel/update screens drop their temporary manual-id input
  and populate a picker/list automatically, and the account redesign can be built for real.
