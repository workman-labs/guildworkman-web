"use client";

import { useEffect, useState } from "react";
import { updateAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import type { Appointment } from "@/lib/types";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

export default function UpdateAppointmentForm() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) return;
    viewAllAppointmentApi(clientId).then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const handleUpdate = async (id: number, status: string) => {
    setAppointments((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
    try {
      await updateAppointmentApi({ id, status });
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-6">Incoming appointment requests</h1>
      {appointments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {appointments.map((app) => (
            <Card key={app.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-ink-900">
                  {app.title ?? app.category} &middot; {app.date ?? app.scheduleTime}
                </p>
                {app.status && (
                  <Badge tone="neutral" className="mt-1">
                    {app.status}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="bg-success text-cream rounded-full px-4 py-1.5 text-sm font-medium hover:opacity-90"
                  onClick={() => handleUpdate(app.id, "Accepted")}
                >
                  Accept
                </button>
                <button
                  className="bg-error text-cream rounded-full px-4 py-1.5 text-sm font-medium hover:opacity-90"
                  onClick={() => handleUpdate(app.id, "Declined")}
                >
                  Decline
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-ink-500">No appointments available to update.</p>
      )}
    </div>
  );
}
