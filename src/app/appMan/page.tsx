import BookAppointmentForm from "@/components/BookAppointmentForm";
import CancelAppointmentForm from "@/components/CancelAppointmentForm";

export default function AppointmentManagerPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
        <BookAppointmentForm />
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Cancel Appointment</h2>
        <CancelAppointmentForm />
      </section>
    </div>
  );
}
