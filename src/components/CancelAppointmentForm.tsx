"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentApi, viewAllAppointmentApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import type { Appointment } from "@/lib/types";

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
    <div className="max-w-md mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-4">Cancel Appointment</h2>
      <select
        className="border rounded px-3 py-2 w-full mb-4"
        onChange={(e) => setId(e.target.value)}
        defaultValue=""
      >
        <option value="">Select Appointment</option>
        {appointments.map((app) => (
          <option key={app.id} value={app.id}>
            {app.title ?? app.category} on {app.date ?? app.scheduleTime}
          </option>
        ))}
      </select>
      <button
        onClick={handleCancel}
        disabled={loading || !id}
        className="bg-red-600 text-white rounded-full px-4 py-2 disabled:opacity-50"
      >
        Cancel Appointment
      </button>
      {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
      {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
    </div>
  );
}
