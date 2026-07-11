/* The Adinkra cultural mark, tiled as a faint decorative texture for
   dark navy / terracotta bands. Each instance needs a unique `id`
   (SVG pattern ids are document-global). */

const ARM =
  "M240 240 L240 168 C240 142 266 134 284 152 C300 168 294 192 272 196";

interface AdinkraPatternProps {
  id: string;
  color?: string;
  opacity?: number;
  className?: string;
}

export default function AdinkraPattern({
  id,
  color = "var(--gold)",
  opacity = 0.1,
  className = "",
}: AdinkraPatternProps) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <g transform="translate(60 60) scale(0.19) translate(-240 -240)">
            <g
              fill="none"
              stroke={color}
              strokeWidth={17}
              strokeLinecap="round"
            >
              <path d={ARM} />
              <path d={ARM} transform="rotate(90 240 240)" />
              <path d={ARM} transform="rotate(180 240 240)" />
              <path d={ARM} transform="rotate(270 240 240)" />
            </g>
            <circle cx="240" cy="240" r="12" fill={color} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
