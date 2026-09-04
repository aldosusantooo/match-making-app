"use client";

/**
 * Fixed to the bottom of the phone column (spec §4.8). Disabled rather than
 * erroring when a match can't be made — the hint line above carries the
 * reason, and `describedBy` points at it so screen readers get the reason
 * too instead of an unexplained disabled control.
 */
export function StickyCta({
  label,
  disabled,
  describedBy,
  onClick,
}: {
  label: string;
  disabled: boolean;
  describedBy?: string;
  onClick: () => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px] px-4"
      style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-describedby={describedBy}
        className="w-full rounded-[14px] bg-green py-[15px] text-center text-[16px] font-semibold text-white shadow-cta active:opacity-85 disabled:opacity-50 disabled:shadow-none"
      >
        {label}
      </button>
    </div>
  );
}
