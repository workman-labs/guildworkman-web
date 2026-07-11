import Stepper from "@/components/booking/Stepper";
import BookingScreen from "@/components/booking/BookingScreen";
import { getWorkerById, getCategory, WORKERS } from "@/lib/marketplace";
import { getServices, buildDates, TIME_SLOTS } from "@/lib/booking";

export default async function BookWorkerPage({
  params,
}: {
  params: Promise<{ category: string; worker: string }>;
}) {
  const { category, worker: workerId } = await params;

  // Illustrative lookup — falls back so any id renders during the redesign.
  const worker = getWorkerById(workerId) ?? WORKERS[0];
  const categoryLabel = getCategory(worker.category)?.label ?? "Pro";
  const services = getServices(worker.category, worker.trade);
  const dates = buildDates(7);

  return (
    <>
      <Stepper
        steps={[
          { label: `Trade · ${categoryLabel}`, state: "done" },
          { label: `Pro · ${worker.name}`, state: "done" },
          { label: "Book & pay", state: "current" },
        ]}
      />
      <BookingScreen
        worker={worker}
        backHref={`/book/${category}`}
        services={services}
        dates={dates}
        timeSlots={TIME_SLOTS}
      />
    </>
  );
}
