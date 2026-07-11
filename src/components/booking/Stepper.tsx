import { FaCheck } from "react-icons/fa6";

interface Step {
  label: string;
  state: "done" | "current" | "todo";
}

/** Booking progress sub-header: Trade ✓ → Pro ✓ → Book & pay. */
export default function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 overflow-x-auto px-5 py-3.5 md:px-10">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-shrink-0 items-center gap-2.5">
            {i > 0 ? <span className="h-px w-6 bg-line" aria-hidden /> : null}
            <span
              className={`flex items-center gap-2 text-sm font-bold ${
                s.state === "todo" ? "text-muted" : "text-ink"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${
                  s.state === "done"
                    ? "bg-gold text-navy-ink"
                    : s.state === "current"
                    ? "bg-navy text-white"
                    : "border border-line bg-sand text-muted"
                }`}
              >
                {s.state === "done" ? <FaCheck className="text-[0.65rem]" aria-hidden /> : i + 1}
              </span>
              <span className={s.state === "current" ? "" : "hidden sm:inline"}>{s.label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
