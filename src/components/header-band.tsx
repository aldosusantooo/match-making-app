import type { ReactNode } from "react";

/**
 * Solid primary band that opens every screen and modal. Sits flush (no
 * radius); a 3px translucent line caps the bottom edge.
 */
export function HeaderBand({
  title,
  subtitle,
  action,
  dragHandle = false,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Right-aligned node: a band button, close button, etc. */
  action?: ReactNode;
  /** Bottom-sheet variant: show the drag handle above the title row. */
  dragHandle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={["relative bg-primary px-4 pt-4 pb-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      {dragHandle && (
        <div className="mx-auto mb-2.5 h-[3.5px] w-8 rounded-[2px] bg-white/30" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg leading-[1.1] font-bold text-band-text">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-[3px] text-[11px] text-band-sub">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/16" />
    </div>
  );
}

/** Translucent button that lives inside the band (e.g. "House rules"). */
export function BandButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-[7px] border border-white/30 bg-white/14 px-2.5 py-[5px] font-mono text-[10px] whitespace-nowrap text-band-text"
    >
      {children}
    </button>
  );
}

/** The ✕ close control for modal bands. */
export function BandClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="shrink-0 px-1 text-sm text-band-sub"
    >
      ✕
    </button>
  );
}
