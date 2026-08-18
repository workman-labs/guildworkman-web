"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  listenForSystemTheme,
  setStoredTheme,
  type Theme,
} from "@/lib/theme";

// ── Context shape ──────────────────────────────────────────────────────
interface ThemeContextValue {
  /** The user's explicit choice, or `null` while following the OS. */
  theme: Theme | null;
  /**
   * The effective theme — the user's explicit choice once made, otherwise
   * the OS preference. `null` only for the single render before the
   * initialisation effect runs (render nothing theme-dependent then).
   */
  resolvedTheme: Theme | null;
  /** Persist and apply an explicit choice. */
  setTheme: (theme: Theme) => void;
  /** Flip between light and dark, persisting the choice. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────
/**
 * Owns the navy/gold/terracotta light & dark modes. A stored per-user
 * choice wins; otherwise the OS preference is followed live until the user
 * picks. The root layout's inline script paints the initial theme before
 * React hydrates, so this provider only keeps React state + <html> in sync
 * — never a visible flash.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(null);
  const [systemTheme, setSystemTheme] = useState<Theme | null>(null);

  // Initialise once: honour a stored choice, else resolve the OS
  // preference. The no-FOUC script in the layout has already painted the
  // correct theme by now, so this is pure state synchronisation.
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeState(stored);
      return;
    }
    setSystemTheme(getSystemTheme());
  }, []);

  // Apply changes to <html> and keep following the OS while the user has
  // not made an explicit choice.
  useEffect(() => {
    const resolved = theme ?? systemTheme;
    if (resolved) applyTheme(resolved);
    if (theme) return;
    return listenForSystemTheme(setSystemTheme);
  }, [theme, systemTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setStoredTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    // resolvedTheme may still be null for a single pre-effect render;
    // fall back to the OS preference so the first click is always right.
    const resolved = theme ?? systemTheme ?? getSystemTheme();
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [theme, systemTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme ?? systemTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, systemTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
