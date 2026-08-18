import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  isTheme,
  listenForSystemTheme,
  resolveTheme,
  setStoredTheme,
  themeScript,
} from "../theme";

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** jsdom has no matchMedia — stub it with a controllable mock. */
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: SYSTEM_DARK_QUERY,
    addEventListener: vi.fn((_: string, cb: () => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_: string, cb: () => void) => listeners.delete(cb)),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return { mql, listeners };
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTheme", () => {
  it("accepts only the two supported themes", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme("")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
});

describe("getStoredTheme / setStoredTheme", () => {
  it("returns null when nothing has been stored", () => {
    expect(getStoredTheme()).toBeNull();
  });

  it("round-trips a stored choice", () => {
    setStoredTheme("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("treats an invalid stored value as no preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "neon");
    expect(getStoredTheme()).toBeNull();
  });

  it("recovers gracefully when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getStoredTheme()).toBeNull();

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => setStoredTheme("light")).not.toThrow();
  });
});

describe("getSystemTheme", () => {
  it("falls back to light when matchMedia is unavailable", () => {
    // jsdom ships no matchMedia, so this is the un-stubbed path.
    expect(getSystemTheme()).toBe("light");
  });

  it("reports dark when the OS prefers dark", () => {
    stubMatchMedia(true);
    expect(getSystemTheme()).toBe("dark");
  });

  it("reports light when the OS prefers light", () => {
    stubMatchMedia(false);
    expect(getSystemTheme()).toBe("light");
  });
});

describe("resolveTheme", () => {
  it("lets a stored choice win over the OS preference", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
  });

  it("falls back to the OS preference when nothing is stored", () => {
    expect(resolveTheme(null, "dark")).toBe("dark");
    expect(resolveTheme(null, "light")).toBe("light");
  });
});

describe("applyTheme", () => {
  it("stamps <html data-theme> and color-scheme", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

describe("listenForSystemTheme", () => {
  it("notifies on OS preference changes and unsubscribes", () => {
    const { listeners } = stubMatchMedia(false);
    const onChange = vi.fn();

    const unsubscribe = listenForSystemTheme(onChange);
    expect(window.matchMedia).toHaveBeenCalledWith(SYSTEM_DARK_QUERY);

    // Simulate the OS switching to dark.
    listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    expect(onChange).toHaveBeenCalledWith("dark");

    unsubscribe();
    listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is a no-op without matchMedia", () => {
    expect(() => listenForSystemTheme(vi.fn())).not.toThrow();
  });
});

describe("themeScript", () => {
  it("is a self-contained script that reads the shared storage key", () => {
    expect(themeScript).toContain(THEME_STORAGE_KEY);
    expect(themeScript).toContain("data-theme");
    expect(themeScript).toContain("prefers-color-scheme");
    // Must be an IIFE guarding against storage errors, not rely on imports.
    expect(themeScript.startsWith("(function(){try{")).toBe(true);
  });
});
