"use client";

import { useState } from "react";
import { viewAllAppointmentApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { Appointment } from "@/lib/types";

export default function ViewAllAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientId = localStorage.getItem("userId") ?? "";
      const result = await viewAllAppointmentApi(clientId);
      setAppointments(result);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch appointments."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-4">All Appointments</h2>
      <button onClick={handleViewAppointments} className="bg-blue-600 text-white rounded-full px-4 py-2 mb-4">
        View All Appointments
      </button>

      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {appointments.length > 0 ? (
            appointments.map((app) => (
              <li key={app.id} className="border rounded-lg p-3">
                {app.title ?? app.category} on {app.date ?? app.scheduleTime}
                {app.status && <span className="ml-2 text-slate-500">({app.status})</span>}
              </li>
            ))
          ) : (
            <li>No appointments available</li>
          )}
        </ul>
      )}
    </div>
  );
}
