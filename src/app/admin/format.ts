/** Display formatting for the admin page. Times are WIB: hosts play in Indonesia. */

const TIME_ZONE = "Asia/Jakarta";

/**
 * A "YYYY-MM-DD" day key as "12 Oct", or "Mon 12 Oct" with the weekday. Read
 * as UTC so the key's calendar day survives whatever zone formats it.
 */
export function formatDay(day: string, withWeekday = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: withWeekday ? "short" : undefined,
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${day}T00:00:00Z`))
    .replace("Sept", "Sep")
    .replace(",", "");
}

/** "19:02" in WIB. */
export function formatWibTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** "Mon 12 Oct, 19:02" in WIB. */
export function formatWibDateTime(date: Date): string {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return `${formatDay(day, true)}, ${formatWibTime(date)}`;
}

/** "just now", "12m ago", "3h ago", "4d ago". */
export function formatAgo(date: Date, now: Date): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (minutes < 48 * 60) {
    return `${Math.floor(minutes / 60)}h ago`;
  }
  return `${Math.floor(minutes / (24 * 60))}d ago`;
}

export const formatCount = (value: number) => value.toLocaleString("en-US");
