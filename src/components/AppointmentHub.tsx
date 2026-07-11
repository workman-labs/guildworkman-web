"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "./ui/Button";
import Card from "./ui/Card";

const actions = [
  { label: "Book an appointment", path: "/book", image: "/assets/fashiondesigner.jpg", copy: "Browse tradespeople by category and schedule a time that works for you." },
  { label: "Cancel an appointment", path: "/cancel", image: "/assets/mernsonMen.jpg", copy: "Plans changed? Cancel a booking in a couple of taps." },
  { label: "Update an appointment", path: "/update", image: "/assets/hairstylist.jpg", copy: "Accept or decline incoming requests as a worker." },
  { label: "View all appointments", path: "/view", image: "/assets/foundationLayers.jpg", copy: "See everything you've booked, past and upcoming." },
];

export default function AppointmentHub() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <span className="inline-block bg-terra/10 text-terra-deep text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-4">
        Appointments
      </span>
      <h1 className="font-heading text-3xl font-semibold">Manage your bookings</h1>
      <p className="text-muted mt-2 mb-10">Everything you need in one place.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {actions.map((action) => (
          <Card key={action.path} className="overflow-hidden flex flex-col">
            <div className="relative h-40 w-full">
              <Image src={action.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 45vw" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-heading text-lg font-semibold">{action.label}</h3>
              <p className="text-muted text-sm mt-1 mb-4 flex-1">{action.copy}</p>
              <Button variant="secondary" onClick={() => router.push(action.path)} className="w-fit">
                {action.label}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
