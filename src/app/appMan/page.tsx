import BookAppointmentForm from "@/components/BookAppointmentForm";
import CancelAppointmentForm from "@/components/CancelAppointmentForm";

export default function AppointmentManagerPage() {
  return (
    <div className="divide-y divide-line">
      <BookAppointmentForm />
      <CancelAppointmentForm />
    </div>
  );
}
