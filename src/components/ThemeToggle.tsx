"use client";

import { FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "./ThemeProvider";

/** Light/dark toggle. Defaults to the system preference; once toggled,
    the choice is stamped on <html data-theme> and persisted. The initial
    paint is handled by the inline script in the root layout (no FOUC). */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition hover:border-navy-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {theme === "dark" ? (
        <FaSun aria-hidden className="text-[0.95rem]" />
      ) : (
        <FaMoon aria-hidden className="text-[0.95rem]" />
      )}
    </button>
  );
}
