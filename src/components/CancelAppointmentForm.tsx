"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import Card from "./ui/Card";
import Input from "./ui/Input";

export default function CancelAppointmentForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    const appointmentId = Number(id);
    if (!appointmentId) {
      setErrorMessage("Enter a valid appointment id.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await cancelAppointmentApi(appointmentId);
      setSuccessMessage("Appointment cancelled.");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "An error occurred while cancelling the appointment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-2">Cancel an appointment</h1>
      <p className="text-muted text-sm mb-6">
        Enter the appointment id to cancel. A picker returns once the API lists
        appointments with ids (see the appointments-API spec).
      </p>
      <Card className="p-6">
        <Input
          label="Appointment id"
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. 1024"
        />
        <button
          onClick={handleCancel}
          disabled={loading || !id}
          className="mt-4 w-full rounded-full bg-err text-white py-2.5 font-medium disabled:opacity-40 hover:bg-err/90 transition-colors"
        >
          {loading ? "Cancelling..." : "Cancel appointment"}
        </button>
        {errorMessage && <p className="text-err text-sm mt-3">{errorMessage}</p>}
        {successMessage && <p className="text-ok text-sm mt-3">{successMessage}</p>}
      </Card>
    </div>
  );
}
