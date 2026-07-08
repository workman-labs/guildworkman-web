"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookingApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import { categories, electricalDetails, plumberDetails } from "@/lib/constants";
import CategoryButton from "./CategoryButton";
import SkillCard from "./SkillCard";

export default function BookAppointmentForm() {
  const router = useRouter();
  const [dateTime, setDateTime] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime || !currentCategory) {
      setErrorMessage("Please select a category and a date.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId || userId === "undefined") {
      router.push("/login");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await bookingApi({
        scheduleTime: dateTime,
        category: currentCategory,
        clientId: userId,
      });

      if (response.status) {
        setSuccessMessage(response.data.message ?? "Appointment booked successfully!");
        setTimeout(() => router.push("/view"), 500);
      } else {
        throw new Error(response.data.error ?? "Booking failed");
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "An error occurred while booking."));
    } finally {
      setLoading(false);
    }
  };

  const details =
    currentCategory === "ELECTRICAL" ? electricalDetails : currentCategory === "PLUMBING" ? plumberDetails : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold mb-6">Book Appointment</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-48">
          {categories.map((category) => (
            <CategoryButton
              key={category}
              categoryName={category}
              active={category === currentCategory}
              onClick={() => setCurrentCategory(category)}
            />
          ))}
        </div>

        <div className="flex-1">
          {details.map((detail, index) => (
            <SkillCard key={index} {...detail} />
          ))}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <label className="flex flex-col gap-1 text-sm">
              Date &amp; Time
              <input
                type="datetime-local"
                className="border rounded px-3 py-2"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Category
              <input type="text" className="border rounded px-3 py-2 bg-slate-50" value={currentCategory} readOnly />
            </label>
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded-full py-2">
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
          <button onClick={() => router.push("/")} className="mt-4 text-slate-500 underline">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
