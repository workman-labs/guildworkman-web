/**
 * Theme system — codifies the GuildWorkman identity (trust navy / guild gold /
 * terracotta) into a single source of truth for light & dark mode.
 *
 * The colour *tokens* live in `src/app/globals.css` (Tailwind v4 `@theme
 * inline` + `data-theme` overrides). This module owns everything else:
 *
 *   - the persisted per-user choice (localStorage, key `theme`)
 *   - resolving the effective theme (stored choice, else OS preference)
 *   - applying a theme to <html data-theme> + `color-scheme`
 *   - live OS-preference listening (until the user makes an explicit choice)
 *   - the inline paint-time script used by the root layout (no flash)
 *
 * Everything here is pure / DOM-safe so it can be unit-tested in jsdom.
 */

export type Theme = "light" | "dark";

/** localStorage key used to persist the per-user theme choice. */
export const THEME_STORAGE_KEY = "theme";

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** Type guard for untrusted values (localStorage, inline script input). */
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Read the persisted per-user choice; `null` when unset or corrupted. */
export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    // localStorage can throw (private mode, storage disabled) — fall back.
    return null;
  }
}

/** Persist the per-user theme choice. Never throws. */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Non-fatal: the theme still applies for this session.
  }
}

/** The OS preference; falls back to light when matchMedia is unavailable. */
export function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
}

/** Stamp a theme on <html data-theme> and set color-scheme so native
    controls (scrollbars, selects, date pickers) match. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

/** Subscribe to OS preference changes. Returns an unsubscribe function.
    Safe to call in environments without matchMedia. */
export function listenForSystemTheme(onChange: (theme: Theme) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(SYSTEM_DARK_QUERY);
  const handler = (event: MediaQueryListEvent): void => {
    onChange(event.matches ? "dark" : "light");
  };
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

/** Resolve the effective theme from a stored choice and the OS preference:
    the stored choice wins, otherwise the OS preference. */
export function resolveTheme(
  stored: Theme | null,
  system: Theme
): Theme {
  return stored ?? system;
}

/**
 * Inline script injected in <head> by the root layout. Runs before first
 * paint so the correct theme is applied with no flash: honour a stored
 * preference, otherwise fall back to the OS setting (the CSS `@media
 * (prefers-color-scheme: dark)` rule handles the no-script case).
 * Kept here — next to the rest of the theme system — as the single source
 * of truth shared with the ThemeProvider.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var r=document.documentElement;if(t==='light'||t==='dark'){r.setAttribute('data-theme',t);r.style.colorScheme=t;}else{r.style.colorScheme=window.matchMedia('${SYSTEM_DARK_QUERY}').matches?'dark':'light';}}catch(e){}})();`;
