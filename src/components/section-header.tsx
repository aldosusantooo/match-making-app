import type { ReactNode } from "react";

/**
 * Mono uppercase eyebrow on the left, optional green action on the right
 * (spec §4.3). The eyebrow is one of only two places mono uppercase is
 * allowed; the other is numbers.
 */
export function SectionHeader({
  label,
  action,
}: {
  label: string;
  /** Plain text, or a button when the action does something. */
  action?: ReactNode;
}) {
  return (
    <div className="mt-5 mb-2.5 flex items-baseline justify-between px-5">
      <h2 className="font-mono text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </h2>
      {action && (
        <span className="text-[13px] font-semibold text-green">{action}</span>
      )}
    </div>
  );
}
