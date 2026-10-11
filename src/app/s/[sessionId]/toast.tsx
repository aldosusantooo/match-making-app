"use client";

import { type ReactNode, useEffect, useEffectEvent } from "react";

/** How long a toast stays up before dismissing itself (spec §7.3). */
const DURATION_MS = 4000;

/**
 * Short-lived confirmation, bottom centre. Sits above the sticky "Create
 * match" button rather than over it — that button is the next thing the
 * host reaches for. Tapping dismisses it early.
 */
export function Toast({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) {
  // The session screen re-renders every second for its clock, handing over a
  // fresh `onDismiss` each time. Keyed on that, the timer restarted every
  // tick and the toast never left; an effect event keeps it on one timer.
  const dismiss = useEffectEvent(onDismiss);
  useEffect(() => {
    const timer = setTimeout(dismiss, DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      // Clears the sticky CTA (its own 22px inset plus a ~54px button) with
      // 12px to spare. Set here rather than as an arbitrary Tailwind value:
      // calc() needs real whitespace around the +, which the class syntax
      // would have to escape.
      style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="pointer-events-auto flex max-w-[430px] items-center gap-2.5 rounded-[14px] border border-[rgba(23,35,28,0.06)] bg-surface px-3 py-2.5 text-left shadow-float motion-safe:animate-toast-in"
      >
        {children}
      </button>
    </div>
  );
}
