import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import WorkerCard from "./marketplace/WorkerCard";
import { FEATURED_WORKERS } from "@/lib/marketplace";

export default function FeaturedPros() {
  return (
    <section className="px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
              Top-rated near you
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pros clients keep re-booking
            </h2>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-2 hover:text-navy"
          >
            See all in Lagos <FaArrowRight aria-hidden className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_WORKERS.map((w) => (
            <WorkerCard key={w.id} worker={w} variant="stack" />
          ))}
        </div>
      </div>
    </section>
  );
}
