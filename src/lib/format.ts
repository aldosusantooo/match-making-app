/**
 * "Fri 4 Sep" — used for the session meta line. Assembled from parts rather
 * than formatted straight through: en-GB abbreviates September to "Sept" and
 * en-US orders it "Fri, Sep 4", and neither is what the spec asks for.
 */
export function formatSessionDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")} ${part("month")}`;
}

/** "20:02" in the viewer's timezone — call from the client only. */
export function formatClockTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Elapsed time as mm:ss, rolling past 60 minutes rather than wrapping. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Coarse wait time for the roster: "just now", "7m", "1h 04m". */
export function formatWait(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** Whole minutes, for a finished match's duration. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60000));
  return `${minutes} min`;
}
