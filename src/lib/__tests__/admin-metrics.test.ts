import { describe, expect, it } from "vitest";
import {
  buildFunnel,
  countByDay,
  niceCeil,
  startOfWibDay,
  wibDayKey,
} from "../admin-metrics";

describe("wibDayKey", () => {
  it("rolls over at WIB midnight, not UTC midnight", () => {
    // 16:59 UTC is 23:59 WIB; 17:00 UTC is 00:00 WIB the next day.
    expect(wibDayKey(new Date("2026-10-11T16:59:00Z"))).toBe("2026-10-11");
    expect(wibDayKey(new Date("2026-10-11T17:00:00Z"))).toBe("2026-10-12");
  });
});

describe("startOfWibDay", () => {
  it("returns the instant WIB midnight began", () => {
    expect(startOfWibDay(new Date("2026-10-12T03:30:00Z")).toISOString()).toBe(
      "2026-10-11T17:00:00.000Z",
    );
  });
});

describe("countByDay", () => {
  const now = new Date("2026-10-12T05:00:00Z"); // 12:00 WIB, 12 Oct

  it("zero-fills a window ending today, oldest first", () => {
    const days = countByDay([], 3, now);
    expect(days).toEqual([
      { day: "2026-10-10", count: 0 },
      { day: "2026-10-11", count: 0 },
      { day: "2026-10-12", count: 0 },
    ]);
  });

  it("buckets by WIB day", () => {
    const days = countByDay(
      [
        new Date("2026-10-11T18:00:00Z"), // 01:00 WIB on the 12th
        new Date("2026-10-12T01:00:00Z"), // 08:00 WIB on the 12th
        new Date("2026-10-11T10:00:00Z"), // 17:00 WIB on the 11th
      ],
      2,
      now,
    );
    expect(days).toEqual([
      { day: "2026-10-11", count: 1 },
      { day: "2026-10-12", count: 2 },
    ]);
  });
});

describe("buildFunnel", () => {
  it("counts each step as a subset of the last", () => {
    const steps = buildFunnel([
      { players: 0, matches: 0, completed: 0 },
      { players: 3, matches: 0, completed: 0 },
      { players: 4, matches: 2, completed: 0 },
      { players: 6, matches: 3, completed: 2 },
    ]);
    expect(steps.map((s) => s.count)).toEqual([4, 3, 2, 1]);
  });
});

describe("niceCeil", () => {
  it("rounds up to a 1, 2 or 5 step", () => {
    expect([0, 1, 2, 3, 6, 12, 47, 100].map(niceCeil)).toEqual([
      1, 1, 2, 5, 10, 20, 50, 100,
    ]);
  });
});
