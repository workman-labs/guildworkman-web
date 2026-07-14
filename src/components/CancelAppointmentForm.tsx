"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cancelAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import {
  byScheduleTime,
  formatCategory,
  formatScheduleTime,
  getClientId,
  isClosed,
} from "@/lib/appointments";
import { getErrorMessage, type ViewAllAppointmentsResponse } from "@/lib/types";
import { buttonClasses } from "./ui/Button";
import Card from "./ui/Card";

export default function CancelAppointmentForm() {
  const [appointments, setAppointments] = useState<ViewAllAppointmentsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const load = useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) {
      setErrorMessage("You need to be signed in to cancel an appointment.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await viewAllAppointmentApi(clientId);
      setAppointments((res.data ?? []).filter((a) => !isClosed(a)).sort(byScheduleTime));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load your appointments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = async (appointmentId: number) => {
    setCancelling(appointmentId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await cancelAppointmentApi(appointmentId);
      // Drop it locally rather than refetching — it's no longer cancellable.
      setAppointments((current) => current.filter((a) => a.id !== appointmentId));
      setSuccessMessage("Appointment cancelled.");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "An error occurred while cancelling the appointment.")
      );
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">Cancel an appointment</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Pick the job you want to call off. Cancelled and declined jobs aren&apos;t shown.
      </p>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && appointments.length === 0 && !errorMessage && (
        <Card className="p-8 text-center">
          <p className="font-medium text-ink">Nothing to cancel</p>
          <p className="mt-1 mb-5 text-sm text-muted">You have no active appointments.</p>
          <Link href="/appointments" className={buttonClasses("secondary", "md")}>
            View all appointments
          </Link>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="p-4">
            <p className="font-medium text-ink">{formatCategory(appointment.category)}</p>
            <p className="mt-0.5 text-sm text-muted">
              {formatScheduleTime(appointment.scheduleTime)}
              {appointment.worker ? ` · ${appointment.worker.fullName}` : ""}
            </p>
            <button
              onClick={() => void handleCancel(appointment.id)}
              disabled={cancelling !== null}
              className="mt-3 w-full rounded-full bg-err py-2.5 font-medium text-white transition-colors hover:bg-err/90 disabled:opacity-40"
            >
              {cancelling === appointment.id ? "Cancelling…" : "Cancel appointment"}
            </button>
          </Card>
        ))}
      </div>

      {errorMessage && <p className="mt-4 text-sm text-err">{errorMessage}</p>}
      {successMessage && <p className="mt-4 text-sm text-ok">{successMessage}</p>}
    </div>
  );
}
