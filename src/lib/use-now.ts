"use client";

import { useSyncExternalStore } from "react";

/**
 * A single shared clock for the session screen: one interval drives the live
 * match timer and every roster wait time, however many components read it.
 *
 * Returns null on the server and through hydration. Everything clock-derived
 * renders from that null in the server HTML, which keeps absolute times — and
 * the timezone they were formatted in — out of it; the alternative is a
 * hydration mismatch on every timestamp on the screen.
 *
 * Under `prefers-reduced-motion: reduce` the clock is read once and never
 * ticks, so the timer stops animating (spec §8). Values still refresh
 * whenever the page revalidates.
 */

const listeners = new Set<() => void>();
let intervalId: number | null = null;
let now = 0;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  if (intervalId === null) {
    now = Date.now();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      intervalId = window.setInterval(() => {
        now = Date.now();
        for (const listener of listeners) {
          listener();
        }
      }, 1000);
    }
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

const getSnapshot = () => now;
const getServerSnapshot = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
