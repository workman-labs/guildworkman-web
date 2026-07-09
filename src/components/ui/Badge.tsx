import { HTMLAttributes } from "react";

type Tone = "brand" | "gold" | "success" | "error" | "neutral" | "chain";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700",
  gold: "bg-gold-100 text-gold-600",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  neutral: "bg-ink-100 text-ink-700",
  chain: "bg-chain-100 text-chain-600",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export default function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
