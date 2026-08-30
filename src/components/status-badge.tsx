import { ShuttlecockIcon } from "./icons";

/**
 * Shuttlecock icon + mono uppercase label, e.g. "On court". The primary tone
 * pulses; use "muted" for settled states (no animation).
 */
export function StatusBadge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "muted";
}) {
  return (
    <span className="inline-flex items-center gap-[7px]">
      <ShuttlecockIcon
        className={
          tone === "primary"
            ? "shrink-0 animate-pulse-glow text-primary"
            : "shrink-0 text-muted"
        }
      />
      <span
        className={[
          "font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em]",
          tone === "primary" ? "text-primary" : "text-muted",
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}
