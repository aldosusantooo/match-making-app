"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

export const FIELD_CLASS =
  "h-12 w-full rounded-xl border-[1.5px] border-line bg-surface px-3.5 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-green focus:shadow-[0_0_0_4px_rgba(6,96,63,0.12)]";

export const LABEL_CLASS = "mb-1.5 block text-[12px] font-semibold text-muted";

const WEEKDAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Defaults to "Mabar {hari ini}" (spec §3.4).
 *
 * Filled in after hydration rather than server-rendered: the server's clock
 * is UTC on the deploy box, so a host creating a Friday-evening session in
 * Jakarta would have been handed "Mabar Kamis". Uncontrolled, so typing
 * doesn't re-render the card, and the effect leaves any value already typed
 * alone.
 */
export function SessionNameField() {
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = field.current;
    if (input && !input.value) {
      input.value = `Mabar ${WEEKDAYS[new Date().getDay()]}`;
    }
  }, []);

  return (
    <input
      ref={field}
      id="sessionName"
      name="sessionName"
      required
      defaultValue=""
      className={FIELD_CLASS}
    />
  );
}

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[50px] w-full rounded-[14px] bg-green text-[16px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(6,96,63,0.6)] transition-[translate,scale,box-shadow] duration-200 ease-brand hover:-translate-y-px active:scale-97 hover:shadow-[0_14px_26px_-12px_rgba(6,96,63,0.7)] disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none"
    >
      {pending ? "Membuat sesi…" : "Mulai sesi"}
    </button>
  );
}
