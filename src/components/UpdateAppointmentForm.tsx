"use client";

import { useEffect, useState } from "react";
import { updateAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import type { Appointment } from "@/lib/types";

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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-4">Update Appointment</h2>
      {appointments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {appointments.map((app) => (
            <div key={app.id} className="border rounded-lg p-3 flex items-center justify-between">
              <span>
                {app.title ?? app.category} on {app.date ?? app.scheduleTime}
                {app.status && <span className="ml-2 text-slate-500">({app.status})</span>}
              </span>
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white rounded-full px-3 py-1 text-sm"
                  onClick={() => handleUpdate(app.id, "Accepted")}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 text-white rounded-full px-3 py-1 text-sm"
                  onClick={() => handleUpdate(app.id, "Declined")}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No appointments available to update.</p>
      )}
    </div>
  );
}
