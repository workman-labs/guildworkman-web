"use client";

import { useRouter } from "next/navigation";

const actions = [
  { label: "Book Appointment", path: "/book", image: "/assets/fashiondesigner.jpg" },
  { label: "Cancel Appointment", path: "/cancel", image: "/assets/mernsonMen.jpg" },
  { label: "Update Appointment", path: "/update", image: "/assets/hairstylist.jpg" },
  { label: "View All Appointments", path: "/view", image: "/assets/foundationLayers.jpg" },
];

export default function AppointmentHub() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-1">GuildWorkman</h1>
      <h2 className="text-slate-500 mb-8">Client Appointments</h2>

      <div className="flex flex-wrap gap-3 mb-10">
        {actions.map((action) => (
          <button
            key={action.path}
            className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => router.push(action.path)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {actions.map((action, index) => (
          <div
            key={action.path}
            className={`flex flex-col sm:flex-row items-center gap-6 ${index % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={action.image} alt="" className="rounded-lg h-40 w-full sm:w-64 object-cover" />
            <div>
              <h3 className="text-xl font-semibold">{action.label}</h3>
              <p className="text-slate-500 mb-2">Manage appointments easily and reliably</p>
              <button
                className="px-4 py-2 rounded-full bg-blue-600 text-white"
                onClick={() => router.push(action.path)}
              >
                {action.label}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
