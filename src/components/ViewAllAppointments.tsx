"use client";

import { useState } from "react";
import { viewAllAppointmentApi } from "@/lib/api";
import { getErrorMessage, type ViewAllAppointmentsResponse } from "@/lib/types";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function ViewAllAppointments() {
  const [appointments, setAppointments] = useState<ViewAllAppointmentsResponse[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientId = localStorage.getItem("userId") ?? "";
      const res = await viewAllAppointmentApi(clientId);
      // The API returns a single appointment today (time + category, no id/status).
      setAppointments(res?.data ? [res.data] : []);
      setLoaded(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch appointments."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-2">All appointments</h1>
      <p className="text-muted text-sm mb-6">
        The current API returns a single appointment (time + category). A full list
        with status and pro details is pending a backend update.
      </p>
      <Button onClick={handleView} className="mb-6">
        {loading ? "Loading..." : "View appointments"}
      </Button>

      {error ? (
        <p className="text-err text-sm">Error: {error}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((app, i) => (
            <Card key={i} className="p-4">
              <p className="font-medium text-ink">
                {app.category} &middot; {app.scheduleTime}
              </p>
            </Card>
          ))}
          {loaded && appointments.length === 0 && (
            <p className="text-muted text-sm">No appointments available.</p>
          )}
        </div>
      )}
    </div>
  );
}
