import type { AppointmentStatus, ViewAllAppointmentsResponse } from "./types";

/** The backend sends a zoneless LocalDateTime ("2026-07-20T10:30:00"), which
    Date reads as local time — the right reading for a Lagos booking. */
export function formatScheduleTime(scheduleTime: string): string {
  const date = new Date(scheduleTime);
  if (Number.isNaN(date.getTime())) return scheduleTime;
  return date.toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Category enums arrive as BEAUTY_CARE / FASHION_DESIGN. */
export function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const STATUS_TONE: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-gold/15 text-gold-deep",
  ACCEPTED: "bg-ok/15 text-ok",
  UPDATED: "bg-navy/10 text-navy",
  DECLINED: "bg-err/15 text-err",
  CANCELLED: "bg-err/15 text-err",
};

/** An appointment that's over — no longer actionable. */
export function isClosed(appointment: ViewAllAppointmentsResponse): boolean {
  return appointment.status === "CANCELLED" || appointment.status === "DECLINED";
}

/** Soonest first. */
export function byScheduleTime(
  a: ViewAllAppointmentsResponse,
  b: ViewAllAppointmentsResponse
): number {
  return new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime();
}

/** clientId is set by the login flow. */
export function getClientId(): string | null {
  const clientId = localStorage.getItem("userId");
  return !clientId || clientId === "undefined" ? null : clientId;
}
