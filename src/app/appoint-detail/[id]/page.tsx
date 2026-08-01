"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiArrowLeft, HiClock } from "react-icons/hi";
import { viewAllAppointmentApi } from "@/lib/api";
import { formatCategory, formatScheduleTime, getClientId } from "@/lib/appointments";
import { formatNaira } from "@/lib/marketplace";
import { getErrorMessage, type ViewAllAppointmentsResponse } from "@/lib/types";
import EscrowTimeline from "@/components/EscrowTimeline";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [appointment, setAppointment] = useState<ViewAllAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) {
      setError("You need to be signed in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await viewAllAppointmentApi(clientId);
      const found = (res.data ?? []).find((a) => a.id === id);
      if (found) {
        setAppointment(found);
      } else {
        setError("Appointment not found.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load appointment."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <p className="text-sm text-muted">Loading appointment…</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <Card className="p-6">
          <p className="text-err text-sm">{error ?? "Appointment not found."}</p>
          <button
            onClick={() => router.push("/view")}
            className={buttonClasses("secondary", "md")}
          >
            ← Back to appointments
          </button>
        </Card>
      </div>
    );
  }

  const statusColor =
    appointment.status === "CANCELLED" || appointment.status === "DECLINED"
      ? "bg-err/15 text-err"
      : appointment.status === "ACCEPTED"
        ? "bg-ok/15 text-ok"
        : "bg-gold/15 text-gold-deep";

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6 transition-colors"
      >
        <HiArrowLeft size={16} />
        Back
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink">
            {formatCategory(appointment.category)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {formatScheduleTime(appointment.scheduleTime)}
          </p>
          {appointment.worker && (
            <p className="mt-0.5 text-sm text-muted">
              with {appointment.worker.fullName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
          >
            {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
          </span>
          {appointment.amount !== null && (
            <span className="text-sm font-semibold tabular-nums text-ink">
              {formatNaira(appointment.amount)}
            </span>
          )}
        </div>
      </div>

      <EscrowTimeline
        appointment={appointment}
        onStatusChange={() => void load()}
      />
    </div>
  );
}