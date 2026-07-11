import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import Stepper from "@/components/booking/Stepper";
import FilterBar from "@/components/booking/FilterBar";
import WorkerBrowseRow from "@/components/booking/WorkerBrowseRow";
import { buttonClasses } from "@/components/ui/Button";
import { getCategory, getWorkersByCategory, type CategoryKey } from "@/lib/marketplace";

const PLURAL: Record<CategoryKey, string> = {
  electrical: "Electricians",
  plumbing: "Plumbers",
  beauty: "Beauty pros",
  carpentry: "Carpenters",
  fashion: "Fashion designers",
  photography: "Photographers",
};

const AREA = "Yaba, Lagos";

export default async function BrowseCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) notFound();

  const workers = getWorkersByCategory(meta.key);
  const heading = PLURAL[meta.key];

  return (
    <>
      <Stepper
        steps={[
          { label: `Trade · ${meta.label}`, state: "done" },
          { label: "Choose a pro", state: "current" },
          { label: "Book & pay", state: "todo" },
        ]}
      />
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-6 md:px-10">
        <Link href="/book" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <FaArrowLeft aria-hidden className="text-xs" /> All trades
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{heading} near you</h1>
        <p className="mb-4 mt-1 text-muted">
          <b className="font-bold text-ink tabular-nums">{meta.count} pros</b> available in {AREA}
        </p>

        <FilterBar area="Yaba" />

        <div className="grid gap-3">
          {workers.map((w) => (
            <WorkerBrowseRow key={w.id} worker={w} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className={buttonClasses("outline", "md")}>Show more pros</button>
        </div>
      </div>
    </>
  );
}
