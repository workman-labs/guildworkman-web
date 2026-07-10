import Link from "next/link";
import type { IconType } from "react-icons";
import { FaBolt, FaWrench, FaScissors, FaHammer, FaShirt, FaCamera } from "react-icons/fa6";
import type { CategoryMeta, CategoryKey } from "@/lib/marketplace";

const ICONS: Record<CategoryKey, IconType> = {
  electrical: FaBolt,
  plumbing: FaWrench,
  beauty: FaScissors,
  carpentry: FaHammer,
  fashion: FaShirt,
  photography: FaCamera,
};

export default function CategoryTile({ category }: { category: CategoryMeta }) {
  const Icon = ICONS[category.key];
  return (
    <Link
      href={`/book/${encodeURIComponent(category.apiCategory)}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-float"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/8 text-navy-2">
        <Icon aria-hidden className="text-[1.25rem]" />
      </span>
      <span className="font-extrabold text-ink">{category.label}</span>
      <span className="text-sm font-semibold text-muted tabular-nums">
        {category.count} pros
      </span>
    </Link>
  );
}
