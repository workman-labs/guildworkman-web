"use client";

import { useCallback, useEffect, useState } from "react";
import { updateAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import {
  STATUS_TONE,
  byScheduleTime,
  formatCategory,
  formatScheduleTime,
  getClientId,
  isClosed,
} from "@/lib/appointments";
import { formatNaira } from "@/lib/marketplace";
import {
  getErrorMessage,
  type AppointmentStatus,
  type ViewAllAppointmentsResponse,
} from "@/lib/types";
import Card from "./ui/Card";

/** Which appointment is mid-request, and what we're setting it to. */
interface Pending {
  id: number;
  status: AppointmentStatus;
}

export default function UpdateAppointmentForm() {
  const [appointments, setAppointments] = useState<ViewAllAppointmentsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Pending | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) {
      setMessage("You need to be signed in to respond to a request.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await viewAllAppointmentApi(clientId);
      setAppointments((res.data ?? []).filter((a) => !isClosed(a)).sort(byScheduleTime));
    } catch (error) {
      setMessage(getErrorMessage(error, "Failed to load requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (appointmentId: number, status: AppointmentStatus) => {
    setPending({ id: appointmentId, status });
    setMessage("");
    try {
      await updateAppointmentApi(appointmentId, { status });
      if (status === "DECLINED") {
        setAppointments((current) => current.filter((a) => a.id !== appointmentId));
      } else {
        setAppointments((current) =>
          current.map((a) => (a.id === appointmentId ? { ...a, status } : a))
        );
      }
      setMessage(`Appointment ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Error updating appointment."));
    } finally {
      setPending(null);
    }
  };

  const isPending = (appointmentId: number, status: AppointmentStatus) =>
    pending?.id === appointmentId && pending.status === status;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">Respond to a request</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Accept or decline the jobs waiting on you.
      </p>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && appointments.length === 0 && (
        <Card className="p-8 text-center">
          <p className="font-medium text-ink">No open requests</p>
          <p className="mt-1 text-sm text-muted">
            Nothing is waiting on a response right now.
          </p>
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

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 rounded-full bg-ok px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
                disabled={pending !== null || appointment.status === "ACCEPTED"}
                onClick={() => void respond(appointment.id, "ACCEPTED")}
              >
                {isPending(appointment.id, "ACCEPTED") ? "Accepting…" : "Accept"}
              </button>
              <button
                className="flex-1 rounded-full bg-err px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
                disabled={pending !== null}
                onClick={() => void respond(appointment.id, "DECLINED")}
              >
                {isPending(appointment.id, "DECLINED") ? "Declining…" : "Decline"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-muted">{message}</p>}
    </div>
  );
}
