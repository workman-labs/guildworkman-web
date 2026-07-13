"use client";

import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa6";

type Theme = "light" | "dark";

/** Light/dark toggle. Defaults to the system preference; once toggled,
    the choice is stamped on <html data-theme> and persisted. The initial
    paint is handled by the inline script in the root layout (no FOUC). */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition hover:border-navy-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {/* Render nothing until mounted to avoid a mismatched icon flash */}
      {theme === "dark" ? (
        <FaSun aria-hidden className="text-[0.95rem]" />
      ) : theme === "light" ? (
        <FaMoon aria-hidden className="text-[0.95rem]" />
      ) : (
        <span className="h-[0.95rem] w-[0.95rem]" />
      )}
    </button>
  );
}
