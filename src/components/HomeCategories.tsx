import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import CategoryTile from "./marketplace/CategoryTile";
import { CATEGORIES } from "@/lib/marketplace";

export default function HomeCategories() {
  return (
    <section id="categories" className="px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
              Browse by trade
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Whatever the job, there&apos;s a pro for it
            </h2>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-2 hover:text-navy"
          >
            All trades <FaArrowRight aria-hidden className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.key} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
