/* GuildWorkman primary lockup — the Chevron mark + wordmark.
   The left chevron and wordmark inherit `currentColor` (so the lockup
   flips for light/dark surfaces by setting text colour); the right
   chevron is always Guild gold. Size it by setting a font size /
   text-* utility on the element. */

interface LogoProps {
  className?: string;
  /** Hide the wordmark, render the chevron mark only (favicon/avatar use). */
  markOnly?: boolean;
}

export default function Logo({ className = "", markOnly = false }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-extrabold tracking-tight leading-none ${className}`}
    >
      <svg
        viewBox="0 0 168 150"
        aria-hidden="true"
        className="w-auto shrink-0"
        style={{ height: "0.92em" }}
      >
        <path
          d="M14 28 L46 132 L82 60"
          fill="none"
          stroke="currentColor"
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M82 60 L118 132 L154 28"
          fill="none"
          stroke="var(--gold)"
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {markOnly ? (
        <span className="sr-only">GuildWorkman</span>
      ) : (
        <span>GuildWorkman</span>
      )}
    </span>
  );
}
