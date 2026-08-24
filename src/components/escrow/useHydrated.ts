"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after hydration, false during SSR and the first client render.
 *
 * The timeline shows locale/timezone-dependent timestamps, which must render
 * identically on server and first client paint or React's hydration check
 * fails. This is the React-sanctioned way to express "client only" without a
 * setState-in-effect: the server snapshot is `false`, the client snapshot is
 * `true`, so the value flips exactly once, after hydration.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
