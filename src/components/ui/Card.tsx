import { HTMLAttributes } from "react";

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white shadow-[0_1px_3px_rgba(33,28,23,0.06)] ${className}`}
      {...props}
    />
  );
}
