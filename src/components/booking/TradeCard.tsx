import Link from "next/link";
import type { IconType } from "react-icons";
import { FaBolt, FaWrench, FaScissors, FaHammer, FaShirt, FaCamera, FaArrowRight } from "react-icons/fa6";
import { formatNaira, type CategoryMeta, type CategoryKey } from "@/lib/marketplace";

const ICONS: Record<CategoryKey, IconType> = {
  electrical: FaBolt,
  plumbing: FaWrench,
  beauty: FaScissors,
  carpentry: FaHammer,
  fashion: FaShirt,
  photography: FaCamera,
};

/** Rich category card for the /book "choose a trade" step. */
export default function TradeCard({ category }: { category: CategoryMeta }) {
  const Icon = ICONS[category.key];
  return (
    <Link
      href={`/book/${category.key}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-[18px] transition hover:-translate-y-0.5 hover:border-gold hover:shadow-float"
    >
      <FaArrowRight
        aria-hidden
        className="absolute right-[18px] top-[18px] text-navy-2 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
      />
      <span className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-navy/8 text-navy-2">
        <Icon aria-hidden className="text-[1.4rem]" />
      </span>
      <span className="text-[1.05rem] font-extrabold">{category.label}</span>
      <span className="-mt-1.5 text-sm font-semibold text-muted tabular-nums">
        {category.count} pros near you
      </span>
      <span className="mt-auto text-sm text-muted">
        from{" "}
        <b className="font-extrabold text-ink tabular-nums">{formatNaira(category.fromPrice)}</b>
      </span>
    </Link>
  );
}
