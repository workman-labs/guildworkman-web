"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

// ── Context shape ───────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with null so we can avoid a hydration mismatch — the inline
  // script in layout.tsx runs before React, so the DOM is already correct.
  const [theme, setThemeState] = useState<Theme | null>(null);

  // Hydrate from localStorage (or system preference) on mount.  The inline
  // script has already stamped the correct value, so we just read it back.
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else {
      setThemeState(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    }
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    localStorage.setItem("theme", t);
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      applyTheme(t);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  // Listen for system-preference changes when no explicit choice is stored.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch when the user hasn't made an explicit choice.
      // (An explicit choice is always in localStorage.)
      if (localStorage.getItem("theme") !== null) return;
      const next: Theme = e.matches ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  // Provide a stable default until hydration so children don't crash.
  const value: ThemeContextValue = {
    theme: theme ?? "light",
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}