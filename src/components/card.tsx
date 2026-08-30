import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * "record" — one specific match/record: 4px radius, 4px left accent, no
   * other border (the accent stays reserved for records per the spec).
   * "container" — generic list box / side box: 8px radius, full 1px border.
   */
  variant?: "record" | "container";
  /** Record accent color; "muted" for settled/completed records. */
  accent?: "primary" | "muted";
};

export function Card({
  variant = "container",
  accent = "primary",
  className,
  ...props
}: CardProps) {
  const variantClasses =
    variant === "record"
      ? [
          "rounded-[4px] border-l-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
          accent === "primary" ? "border-primary" : "border-line",
        ].join(" ")
      : "rounded-lg border border-line";

  return (
    <div
      className={["bg-surface", variantClasses, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
