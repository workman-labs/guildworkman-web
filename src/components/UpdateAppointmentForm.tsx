"use client";

import { useState } from "react";
import { updateAppointmentApi } from "@/lib/api";
import { getErrorMessage, type AppointmentStatus } from "@/lib/types";
import Card from "./ui/Card";
import Input from "./ui/Input";

export default function UpdateAppointmentForm() {
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<AppointmentStatus | null>(null);

  const respond = async (status: AppointmentStatus) => {
    const appointmentId = Number(id);
    if (!appointmentId) {
      setMessage("Enter a valid appointment id.");
      return;
    }
    setBusy(status);
    setMessage("");
    try {
      await updateAppointmentApi(appointmentId, { status });
      setMessage(`Appointment ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Error updating appointment."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold mb-2">Respond to a request</h1>
      <p className="text-muted text-sm mb-6">
        Enter the appointment id, then accept or decline. The incoming-requests list
        returns once the API provides appointment ids (see the appointments-API spec).
      </p>
      <Card className="p-6">
        <Input
          label="Appointment id"
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. 1024"
        />
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 rounded-full bg-ok px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            disabled={!id || busy !== null}
            onClick={() => respond("ACCEPTED")}
          >
            {busy === "ACCEPTED" ? "Accepting..." : "Accept"}
          </button>
          <button
            className="flex-1 rounded-full bg-err px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            disabled={!id || busy !== null}
            onClick={() => respond("DECLINED")}
          >
            {busy === "DECLINED" ? "Declining..." : "Decline"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-muted">{message}</p>}
      </Card>
    </div>
  );
}
