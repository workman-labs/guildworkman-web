"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { Appointment } from "@/lib/types";
import Select from "./ui/Select";
import Card from "./ui/Card";

export default function CancelAppointmentForm() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [id, setId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    if (!clientId) return;
    viewAllAppointmentApi(clientId).then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const handleCancel = async () => {
    const appointment = appointments.find((app) => String(app.id) === id);
    if (!appointment) {
      setErrorMessage("Please select a valid appointment to cancel.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await cancelAppointmentApi({ id: appointment.id });
      setSuccessMessage(response.message ?? "Cancel Appointment successful!");
      setAppointments((prev) => prev.filter((app) => app.id !== appointment.id));
      setTimeout(() => router.push("/book"), 2000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "An error occurred while trying to cancel the appointment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-6">Cancel an appointment</h1>
      <Card className="p-6">
        <Select label="Appointment" onChange={(e) => setId(e.target.value)} defaultValue="">
          <option value="">Select an appointment</option>
          {appointments.map((app) => (
            <option key={app.id} value={app.id}>
              {app.title ?? app.category} on {app.date ?? app.scheduleTime}
            </option>
          ))}
        </Select>
        <button
          onClick={handleCancel}
          disabled={loading || !id}
          className="mt-4 w-full rounded-full bg-error text-cream py-2.5 font-medium disabled:opacity-40 hover:bg-error/90 transition-colors"
        >
          Cancel Appointment
        </button>
        {errorMessage && <p className="text-error text-sm mt-3">{errorMessage}</p>}
        {successMessage && <p className="text-success text-sm mt-3">{successMessage}</p>}
      </Card>
    </div>
  );
}
