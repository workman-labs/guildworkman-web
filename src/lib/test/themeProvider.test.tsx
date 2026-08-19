import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../../components/theme";
import { THEME_STORAGE_KEY } from "../theme";

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** jsdom has no matchMedia — stub it with a controllable mock. */
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: SYSTEM_DARK_QUERY,
    addEventListener: vi.fn((_: string, cb: (event: MediaQueryListEvent) => void) => listeners.add(cb)),
    removeEventListener: vi.fn((_: string, cb: (event: MediaQueryListEvent) => void) => listeners.delete(cb)),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return { mql, listeners };
}

/** Minimal consumer exposing the hook's values through DOM nodes. */
function ThemeConsumer() {
  const { resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="resolved">{resolvedTheme ?? "none"}</span>
      <button data-testid="set-light" onClick={() => setTheme("light")}>
        light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>
        dark
      </button>
      <button data-testid="toggle" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

function render() {
  act(() => {
    root.render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
  });
}

function resolvedThemeText() {
  return container.querySelector('[data-testid="resolved"]')!.textContent;
}

function click(testid: string) {
  act(() => {
    container
      .querySelector(`[data-testid="${testid}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("ThemeProvider", () => {
  it("follows the OS preference live until an explicit choice, then stops listening", () => {
    const { listeners } = stubMatchMedia(false);
    render();

    // The init effect resolves from the OS preference and subscribes.
    expect(resolvedThemeText()).toBe("light");
    expect(listeners.size).toBe(1);

    // OS flips to dark while the user hasn't chosen -> followed live.
    act(() => {
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    });
    expect(resolvedThemeText()).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    // Explicit choice -> persisted, applied, and the listener removed.
    click("set-dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(listeners.size).toBe(0);
    expect(resolvedThemeText()).toBe("dark");

    // OS flips again -> ignored now that the user has chosen.
    act(() => {
      listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent));
    });
    expect(resolvedThemeText()).toBe("dark");
  });

  it("lets a stored choice win and never listens to the OS", () => {
    const { listeners } = stubMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    render();

    expect(resolvedThemeText()).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(listeners.size).toBe(0);
  });

  it("persists and applies toggle flips", () => {
    stubMatchMedia(false);
    render();

    click("toggle"); // light -> dark
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(resolvedThemeText()).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    click("toggle"); // dark -> light
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(resolvedThemeText()).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
