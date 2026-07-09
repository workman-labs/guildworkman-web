"use client";

import { useState } from "react";
import { viewAllAppointmentApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { Appointment } from "@/lib/types";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

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
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-6">All appointments</h1>
      <Button onClick={handleViewAppointments} className="mb-6">
        {loading ? "Loading..." : "View All Appointments"}
      </Button>

      {error ? (
        <p className="text-error text-sm">Error: {error}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.length > 0 ? (
            appointments.map((app) => (
              <Card key={app.id} className="p-4">
                <p className="font-medium text-ink-900">
                  {app.title ?? app.category} &middot; {app.date ?? app.scheduleTime}
                </p>
                {app.status && (
                  <Badge tone="neutral" className="mt-1">
                    {app.status}
                  </Badge>
                )}
              </Card>
            ))
          ) : (
            <p className="text-ink-500 text-sm">No appointments available.</p>
          )}
        </div>
      )}
    </div>
  );
}
