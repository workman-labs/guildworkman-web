import { HTMLAttributes } from "react";

type Tone =
  | "brand"
  | "gold"
  | "success"
  | "error"
  | "neutral"
  | "chain"
  | "navy";

const toneClasses: Record<Tone, string> = {
  brand: "bg-terra/10 text-terra-deep",
  gold: "bg-gold/20 text-gold-deep",
  success: "bg-ok/12 text-ok",
  error: "bg-err/12 text-err",
  neutral: "bg-line/70 text-ink",
  chain: "bg-navy-tint text-navy-2",
  navy: "bg-navy-tint text-navy-2",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export default function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
