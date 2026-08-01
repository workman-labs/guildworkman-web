"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HiCheckCircle, HiClock, HiXCircle, HiRefresh } from "react-icons/hi";
import { updateAppointmentApi } from "@/lib/api";
import { formatScheduleTime } from "@/lib/appointments";
import { getErrorMessage, type AppointmentStatus, type ViewAllAppointmentsResponse } from "@/lib/types";
import Card from "./ui/Card";
import { buttonClasses } from "./ui/Button";

/* ── Escrow lifecycle stages ── */

interface Stage {
  status: AppointmentStatus | "COMPLETED" | "RELEASED";
  label: string;
  description: string;
  icon: typeof HiCheckCircle;
  terminal?: boolean;
}

const STAGES: Stage[] = [
  { status: "SCHEDULED", label: "Scheduled", description: "Appointment booked — payment held in escrow", icon: HiClock },
  { status: "ACCEPTED", label: "Accepted", description: "Worker accepted — job in progress", icon: HiCheckCircle },
  { status: "COMPLETED", label: "Completed", description: "Job finished — awaiting payment release", icon: HiCheckCircle },
  { status: "RELEASED", label: "Released", description: "Payment released from escrow", icon: HiCheckCircle },
];

const TERMINAL_STAGES: Record<string, { label: string; description: string }> = {
  CANCELLED: { label: "Cancelled", description: "Appointment was cancelled — escrow refunded" },
  DECLINED: { label: "Declined", description: "Worker declined — escrow refunded" },
};

/* ── Status progression map ── */

const STATUS_ORDER: Record<string, number> = {
  SCHEDULED: 0,
  ACCEPTED: 1,
};

/* ── Props ── */

type Props = {
  appointment: ViewAllAppointmentsResponse;
  onStatusChange?: () => void;
};

/* ── Component ── */

export default function EscrowTimeline({ appointment, onStatusChange }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const currentStatus = optimisticStatus ?? appointment.status;
  const isClosed = currentStatus === "CANCELLED" || currentStatus === "DECLINED";
  const currentIndex = STATUS_ORDER[currentStatus] ?? -1;

  const terminalStage = TERMINAL_STAGES[currentStatus];
  const isTerminal = terminalStage !== undefined;

  /* ── Optimistic update — accept appointment ── */

  const markAccepted = useCallback(async () => {
    if (updating) return;
    setUpdating(true);
    setError(null);

    const previousStatus = appointment.status;
    setOptimisticStatus("ACCEPTED");

    try {
      await updateAppointmentApi(appointment.id, { status: "ACCEPTED" });
      onStatusChange?.();
    } catch (err) {
      // Rollback: revert to the original status on failure.
      if (mountedRef.current) {
        setOptimisticStatus(previousStatus);
        setError(getErrorMessage(err, "Failed to update status. The timeline has been reverted."));
      }
    } finally {
      if (mountedRef.current) {
        setUpdating(false);
      }
    }
  }, [appointment.id, appointment.status, onStatusChange, updating]);

  /* ── Render: timeline ── */

  const renderTimeline = () => (
    <ol className="escrow-timeline">
      {STAGES.map((stage, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={stage.status}
            className={`escrow-timeline__item ${
              isActive ? "escrow-timeline__item--active" : ""
            } ${isCurrent ? "escrow-timeline__item--current" : ""}`}
          >
            <div className="escrow-timeline__dot" aria-hidden="true">
              {isActive ? (
                <HiCheckCircle className="escrow-timeline__dot-icon" />
              ) : (
                <div className="escrow-timeline__dot-ring" />
              )}
            </div>
            <div className="escrow-timeline__content">
              <strong className="escrow-timeline__label">{stage.label}</strong>
              <p className="escrow-timeline__desc">{stage.description}</p>
              {index === 0 && (
                <time className="escrow-timeline__time">
                  {formatScheduleTime(appointment.scheduleTime)}
                </time>
              )}
            </div>
          </li>
        );
      })}

      {/* Terminal state (cancelled / declined) */}
      {isTerminal && (
        <li className="escrow-timeline__item escrow-timeline__item--terminal">
          <div className="escrow-timeline__dot escrow-timeline__dot--terminal" aria-hidden="true">
            <HiXCircle className="escrow-timeline__dot-icon" />
          </div>
          <div className="escrow-timeline__content">
            <strong className="escrow-timeline__label">{terminalStage.label}</strong>
            <p className="escrow-timeline__desc">{terminalStage.description}</p>
          </div>
        </li>
      )}
    </ol>
  );

  /* ── Render: actionable card ── */

  const renderActions = () => {
    if (isTerminal) return null;

    return (
      <div className="mt-4 flex flex-col gap-2">
        {error && (
          <p className="text-sm text-err" role="alert">
            {error}
          </p>
        )}
        {currentStatus === "SCHEDULED" && (
          <button
            onClick={() => void markAccepted()}
            disabled={updating}
            className={buttonClasses("primary", "md")}
          >
            {updating ? (
              <>
                <HiRefresh className="animate-spin inline mr-1" size={16} />
                Accepting…
              </>
            ) : (
              "Accept appointment"
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <HiClock className="text-navy" size={18} />
        <h3 className="font-heading font-semibold text-ink">Escrow timeline</h3>
      </div>
      <p className="text-xs text-muted mb-4">
        Track the payment lifecycle from booking to release.
      </p>
      {renderTimeline()}
      {renderActions()}
    </Card>
  );
}