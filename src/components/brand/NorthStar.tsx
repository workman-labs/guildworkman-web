/* The North Star — GuildWorkman's reputation mark.
   Used as: the rating star, the verified tick, the escrow seal,
   the app/favicon symbol. One geometry, many jobs. */

const SPARK =
  "M240 70 C250 175 260 185 365 240 C260 295 250 305 240 410 C230 305 220 295 115 240 C220 185 230 175 240 70 Z";
const CHECK = "M198 244 L228 274 L294 206";

interface NorthStarProps {
  size?: number;
  /** Overlay the verified check (turns the star into a "verified" tick). */
  verified?: boolean;
  /** Star fill. Use "currentColor" to inherit text colour (e.g. rating pills). */
  color?: string;
  /** Check stroke colour when `verified`. */
  checkColor?: string;
  className?: string;
  title?: string;
}

export default function NorthStar({
  size = 20,
  verified = false,
  color = "var(--gold)",
  checkColor = "var(--navy)",
  className = "",
  title,
}: NorthStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 480 480"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d={SPARK} fill={color} />
      {verified ? (
        <path
          d={CHECK}
          fill="none"
          stroke={checkColor}
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
