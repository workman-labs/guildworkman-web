"use client";

import { FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "./theme";

/** Light/dark toggle. State is owned by <ThemeProvider> (per-user choice
    persisted to localStorage; OS preference followed until a choice is
    made). The initial paint is handled by the inline script in the root
    layout, so there is no flash of the wrong theme. */
export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      aria-pressed={isDark}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition hover:border-navy-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {/* Render nothing until mounted to avoid a mismatched icon flash */}
      {resolvedTheme === null ? (
        <span className="h-[0.95rem] w-[0.95rem]" />
      ) : isDark ? (
        <FaSun aria-hidden className="text-[0.95rem]" />
      ) : (
        <FaMoon aria-hidden className="text-[0.95rem]" />
      )}
    </button>
  );
}
