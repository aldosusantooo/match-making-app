/**
 * Pure helpers behind the admin dashboard: day bucketing, the activation
 * funnel and chart scaling. Kept apart from the Prisma queries in
 * `admin-stats.ts` so they can be tested, and imported by the client chart,
 * without a database.
 */

export const DAY_MS = 86_400_000;

/** WIB is UTC+7 all year (no DST), so a fixed offset is exact. */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** "2026-10-12": the WIB calendar day `date` falls on. */
export function wibDayKey(date: Date): string {
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

/** The instant WIB midnight began on the day `date` falls on. */
export function startOfWibDay(date: Date): Date {
  const shifted = date.getTime() + WIB_OFFSET_MS;
  return new Date(shifted - (shifted % DAY_MS) - WIB_OFFSET_MS);
}

export interface DayCount {
  /** WIB calendar day, "YYYY-MM-DD". */
  day: string;
  count: number;
}

/** Counts per WIB day for the `days` days ending on `now`'s, oldest first. */
export function countByDay(dates: Date[], days: number, now: Date): DayCount[] {
  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = wibDayKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, index) => {
    const day = wibDayKey(new Date(now.getTime() - (days - 1 - index) * DAY_MS));
    return { day, count: counts.get(day) ?? 0 };
  });
}

export interface FunnelStep {
  label: string;
  count: number;
}

/**
 * How far sessions get. Each step is a subset of the one before: a match
 * needs at least two players (singles), and a result needs a match.
 */
export function buildFunnel(
  sessions: { players: number; matches: number; completed: number }[],
): FunnelStep[] {
  return [
    { label: "Created", count: sessions.length },
    {
      label: "Added 2+ players",
      count: sessions.filter((s) => s.players >= 2).length,
    },
    {
      label: "Started a match",
      count: sessions.filter((s) => s.matches >= 1).length,
    },
    {
      label: "Recorded a result",
      count: sessions.filter((s) => s.completed >= 1).length,
    },
  ];
}

/** The axis top for a column chart: the next 1, 2 or 5 step at or above `max`. */
export function niceCeil(max: number): number {
  if (max <= 1) {
    return 1;
  }
  const power = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 5, 10]) {
    if (step * power >= max) {
      return step * power;
    }
  }
  return 10 * power;
}
