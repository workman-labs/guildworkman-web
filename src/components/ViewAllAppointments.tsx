"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { viewAllAppointmentApi } from "@/lib/api";
import {
  STATUS_TONE,
  byScheduleTime,
  formatCategory,
  formatScheduleTime,
  getClientId,
} from "@/lib/appointments";
import { formatNaira } from "@/lib/marketplace";
import { getErrorMessage, type ViewAllAppointmentsResponse } from "@/lib/types";
import { buttonClasses } from "./ui/Button";
import Card from "./ui/Card";

export default function ViewAllAppointments() {
  const [appointments, setAppointments] = useState<ViewAllAppointmentsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) {
      setError("You need to be signed in to see your appointments.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await viewAllAppointmentApi(clientId);
      setAppointments([...(res.data ?? [])].sort(byScheduleTime));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch appointments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">Your appointments</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Every job you&apos;ve booked, soonest first.
      </p>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {error && !loading && (
        <Card className="p-4">
          <p className="text-sm text-err">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-3 text-sm font-medium text-navy underline underline-offset-4"
          >
            Try again
          </button>
        </Card>
      )}

      {!loading && !error && appointments.length === 0 && (
        <Card className="p-8 text-center">
          <p className="font-medium text-ink">No appointments yet</p>
          <p className="mt-1 mb-5 text-sm text-muted">
            When you book a pro, the job shows up here.
          </p>
          <Link href="/book" className={buttonClasses("primary", "md")}>
            Find a pro
          </Link>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {formatCategory(appointment.category)}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {formatScheduleTime(appointment.scheduleTime)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {appointment.worker
                    ? appointment.worker.fullName
                    : "No pro assigned yet"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[appointment.status]}`}
                >
                  {appointment.status.charAt(0) +
                    appointment.status.slice(1).toLowerCase()}
                </span>
                {appointment.amount !== null && (
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    {formatNaira(appointment.amount)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
