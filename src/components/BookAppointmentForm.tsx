"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookingApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import { categories, electricalDetails, plumberDetails } from "@/lib/constants";
import CategoryButton from "./CategoryButton";
import SkillCard from "./SkillCard";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";

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
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold mb-1">Book an appointment</h1>
      <p className="text-ink-500 mb-8">Pick a category, then a date and time that works.</p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-52 shrink-0">
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
          {details.length > 0 && (
            <div className="mb-6">
              {details.map((detail, index) => (
                <SkillCard key={index} {...detail} />
              ))}
            </div>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Date & time"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
              />
              <Input label="Category" value={currentCategory} readOnly placeholder="Select a category above" />
              {errorMessage && <p className="text-error text-sm">{errorMessage}</p>}
              {successMessage && <p className="text-success text-sm">{successMessage}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </Card>
          <button onClick={() => router.push("/")} className="mt-4 text-ink-500 underline text-sm">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
