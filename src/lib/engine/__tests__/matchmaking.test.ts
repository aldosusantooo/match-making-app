import { describe, expect, it } from "vitest";
import {
  buildEligiblePool,
  buildPairCounts,
  comboKey,
  comboSatisfiesGenderRule,
  generateMatchDraft,
  generateSideCombos,
  pickBestCombo,
  scoreCombo,
  sortByFairness,
  timesOpposed,
  timesPartnered,
} from "../matchmaking";
import type { Combo, EnginePlayer } from "../types";
import { makeMatch, makePlayer, seededRng } from "./helpers";

function draftKey(draft: Combo): string {
  return comboKey(
    draft.sideA.map((p) => p.id),
    draft.sideB.map((p) => p.id),
  );
}

describe("buildEligiblePool", () => {
  it("excludes inactive players", () => {
    const active = makePlayer();
    const inactive = makePlayer({ status: "inactive" });
    expect(buildEligiblePool([active, inactive], [])).toEqual([active]);
  });

  it("excludes players currently in a pending match", () => {
    const players = [makePlayer(), makePlayer(), makePlayer()];
    const pending = makeMatch([players[0].id], [players[1].id], {
      status: "pending",
    });
    expect(buildEligiblePool(players, [pending])).toEqual([players[2]]);
  });

  it("keeps players whose matches are completed", () => {
    const players = [makePlayer(), makePlayer()];
    const done = makeMatch([players[0].id], [players[1].id], {
      status: "completed",
    });
    expect(buildEligiblePool(players, [done])).toEqual(players);
  });
});

describe("sortByFairness", () => {
  it("sorts by matches played ascending", () => {
    const three = makePlayer({ matchesPlayed: 3 });
    const one = makePlayer({ matchesPlayed: 1 });
    const zero = makePlayer({ matchesPlayed: 0 });
    const sorted = sortByFairness([three, one, zero], seededRng(1));
    expect(sorted.map((p) => p.id)).toEqual([zero.id, one.id, three.id]);
  });

  it("breaks matches-played ties by last played, never-played first", () => {
    const playedLate = makePlayer({
      matchesPlayed: 1,
      lastPlayedAt: new Date("2026-08-30T20:00:00Z"),
    });
    const playedEarly = makePlayer({
      matchesPlayed: 1,
      lastPlayedAt: new Date("2026-08-30T19:00:00Z"),
    });
    const neverPlayed = makePlayer({ matchesPlayed: 1, lastPlayedAt: null });
    const sorted = sortByFairness(
      [playedLate, playedEarly, neverPlayed],
      seededRng(1),
    );
    expect(sorted.map((p) => p.id)).toEqual([
      neverPlayed.id,
      playedEarly.id,
      playedLate.id,
    ]);
  });

  it("orders fully-tied players randomly via the injected rng", () => {
    const tied = Array.from({ length: 6 }, () => makePlayer());
    const orders = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        sortByFairness(tied, seededRng(seed))
          .map((p) => p.id)
          .join(","),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("generateSideCombos", () => {
  it("returns exactly the 3 splits for 4 players", () => {
    const [a, b, c, d] = [makePlayer(), makePlayer(), makePlayer(), makePlayer()];
    const combos = generateSideCombos([a, b, c, d]);
    expect(combos).toHaveLength(3);
    const keys = new Set(combos.map(draftKey));
    expect(keys).toEqual(
      new Set([
        comboKey([a.id, b.id], [c.id, d.id]),
        comboKey([a.id, c.id], [b.id, d.id]),
        comboKey([a.id, d.id], [b.id, c.id]),
      ]),
    );
  });

  it("returns a single fixed combo for singles", () => {
    const [a, b] = [makePlayer(), makePlayer()];
    expect(generateSideCombos([a, b])).toEqual([{ sideA: [a], sideB: [b] }]);
  });

  it("throws for unsupported player counts", () => {
    expect(() => generateSideCombos([makePlayer()])).toThrow();
  });
});

describe("comboSatisfiesGenderRule", () => {
  const male = () => makePlayer({ gender: "male" });
  const female = () => makePlayer({ gender: "female" });

  it("accepts anything under the mixed rule", () => {
    const combo: Combo = { sideA: [male(), female()], sideB: [male(), female()] };
    expect(comboSatisfiesGenderRule(combo, "mixed")).toBe(true);
  });

  it("requires both pairs to share a gender under same_gender_only", () => {
    const ok: Combo = { sideA: [male(), male()], sideB: [female(), female()] };
    const bad: Combo = { sideA: [male(), female()], sideB: [male(), female()] };
    expect(comboSatisfiesGenderRule(ok, "same_gender_only")).toBe(true);
    expect(comboSatisfiesGenderRule(bad, "same_gender_only")).toBe(false);
  });

  it("treats unspecified gender as failing the strict rule", () => {
    const combo: Combo = {
      sideA: [makePlayer(), makePlayer()],
      sideB: [female(), female()],
    };
    expect(comboSatisfiesGenderRule(combo, "same_gender_only")).toBe(false);
  });
});

describe("pair counts", () => {
  it("computes times partnered and opposed from match history", () => {
    const [a, b, c, d] = [makePlayer(), makePlayer(), makePlayer(), makePlayer()];
    const counts = buildPairCounts([
      makeMatch([a.id, b.id], [c.id, d.id]),
      makeMatch([a.id, b.id], [c.id, d.id]),
      makeMatch([a.id, c.id], [b.id, d.id]),
    ]);
    expect(timesPartnered(counts, a.id, b.id)).toBe(2);
    expect(timesPartnered(counts, b.id, a.id)).toBe(2); // order-insensitive
    expect(timesPartnered(counts, a.id, c.id)).toBe(1);
    expect(timesPartnered(counts, a.id, d.id)).toBe(0);
    expect(timesOpposed(counts, a.id, c.id)).toBe(2);
    expect(timesOpposed(counts, a.id, d.id)).toBe(3);
    expect(timesOpposed(counts, a.id, b.id)).toBe(1);
  });
});

describe("scoreCombo", () => {
  it("prefers skill-balanced splits when skill matchmaking is on", () => {
    const strong1 = makePlayer({ rating: 1200 });
    const strong2 = makePlayer({ rating: 1200 });
    const weak1 = makePlayer({ rating: 800 });
    const weak2 = makePlayer({ rating: 800 });

    const balanced: Combo = { sideA: [strong1, weak1], sideB: [strong2, weak2] };
    const lopsided: Combo = { sideA: [strong1, strong2], sideB: [weak1, weak2] };
    const counts = buildPairCounts([]);
    expect(scoreCombo(balanced, counts, true)).toBeGreaterThan(
      scoreCombo(lopsided, counts, true),
    );
  });

  it("ignores ratings when skill matchmaking is off", () => {
    const strong1 = makePlayer({ rating: 1200 });
    const strong2 = makePlayer({ rating: 1200 });
    const weak1 = makePlayer({ rating: 800 });
    const weak2 = makePlayer({ rating: 800 });

    const balanced: Combo = { sideA: [strong1, weak1], sideB: [strong2, weak2] };
    const lopsided: Combo = { sideA: [strong1, strong2], sideB: [weak1, weak2] };
    const counts = buildPairCounts([]);
    expect(scoreCombo(balanced, counts, false)).toBe(
      scoreCombo(lopsided, counts, false),
    );
  });

  it("penalizes repeat partners and opponents", () => {
    const [a, b, c, d] = [makePlayer(), makePlayer(), makePlayer(), makePlayer()];
    const counts = buildPairCounts([makeMatch([a.id, b.id], [c.id, d.id])]);

    const repeat: Combo = { sideA: [a, b], sideB: [c, d] };
    const fresh: Combo = { sideA: [a, c], sideB: [b, d] };
    expect(scoreCombo(fresh, counts, false)).toBeGreaterThan(
      scoreCombo(repeat, counts, false),
    );
  });
});

describe("pickBestCombo", () => {
  it("never repeats the immediately preceding match when an alternative exists", () => {
    const [a, b, c, d] = [
      makePlayer({ rating: 1200 }),
      makePlayer({ rating: 1200 }),
      makePlayer({ rating: 800 }),
      makePlayer({ rating: 800 }),
    ];
    // Skill-wise the best split pairs a+c vs b+d (or a+d vs b+c) — both avg 1000.
    const previous = makeMatch([a.id, c.id], [b.id, d.id]);
    const combos = generateSideCombos([a, b, c, d]);
    const best = pickBestCombo(
      combos,
      buildPairCounts([previous]),
      true,
      previous,
    );
    expect(draftKey(best)).not.toBe(comboKey([a.id, c.id], [b.id, d.id]));
    // The other balanced split wins over the lopsided one.
    expect(draftKey(best)).toBe(comboKey([a.id, d.id], [b.id, c.id]));
  });

  it("allows a repeat when it is the only valid combo", () => {
    const [a, b] = [makePlayer(), makePlayer()];
    const previous = makeMatch([a.id], [b.id]);
    const combos = generateSideCombos([a, b]);
    const best = pickBestCombo(
      combos,
      buildPairCounts([previous]),
      true,
      previous,
    );
    expect(draftKey(best)).toBe(comboKey([a.id], [b.id]));
  });
});

describe("generateMatchDraft", () => {
  const settings = {
    genderRule: "mixed" as const,
    skillMatchmakingEnabled: true,
  };

  it("errors when the eligible pool is short (doubles needs 4)", () => {
    const players = [makePlayer(), makePlayer(), makePlayer()];
    const result = generateMatchDraft({ players, matches: [], settings });
    expect(result).toEqual({
      ok: false,
      reason: "not_enough_players",
      required: 4,
      available: 3,
    });
  });

  it("errors when active players are tied up in a pending match", () => {
    const players = [makePlayer(), makePlayer(), makePlayer(), makePlayer()];
    const pending = makeMatch(
      [players[0].id, players[1].id],
      [players[2].id, players[3].id],
      { status: "pending" },
    );
    const result = generateMatchDraft({ players, matches: [pending], settings });
    expect(result).toMatchObject({ ok: false, reason: "not_enough_players" });
  });

  it("singles needs only 2 players and returns a 1v1 draft", () => {
    const players = [makePlayer(), makePlayer()];
    const result = generateMatchDraft({
      players,
      matches: [],
      settings: { genderRule: "singles_only", skillMatchmakingEnabled: true },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.sideA).toHaveLength(1);
      expect(result.draft.sideB).toHaveLength(1);
    }
  });

  it("selects the least-played, longest-resting players", () => {
    const fresh1 = makePlayer({ matchesPlayed: 0 });
    const fresh2 = makePlayer({ matchesPlayed: 0 });
    const rested = makePlayer({
      matchesPlayed: 1,
      lastPlayedAt: new Date("2026-08-30T19:00:00Z"),
    });
    const recent = makePlayer({
      matchesPlayed: 1,
      lastPlayedAt: new Date("2026-08-30T20:00:00Z"),
    });
    const veteran = makePlayer({
      matchesPlayed: 4,
      lastPlayedAt: new Date("2026-08-30T18:00:00Z"),
    });

    const result = generateMatchDraft({
      players: [veteran, recent, rested, fresh1, fresh2],
      matches: [],
      settings,
      rng: seededRng(7),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = new Set(
        [...result.draft.sideA, ...result.draft.sideB].map((p) => p.id),
      );
      expect(ids).toEqual(new Set([fresh1.id, fresh2.id, rested.id, recent.id]));
    }
  });

  it("balances sides by rating when skill matchmaking is on", () => {
    const strong1 = makePlayer({ rating: 1200 });
    const strong2 = makePlayer({ rating: 1200 });
    const weak1 = makePlayer({ rating: 800 });
    const weak2 = makePlayer({ rating: 800 });

    const result = generateMatchDraft({
      players: [strong1, strong2, weak1, weak2],
      matches: [],
      settings,
      rng: seededRng(3),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const avg = (side: EnginePlayer[]) =>
        side.reduce((s, p) => s + p.rating, 0) / side.length;
      expect(avg(result.draft.sideA)).toBe(avg(result.draft.sideB));
    }
  });

  it("rotates partnerships instead of repeating the previous match", () => {
    const [a, b, c, d] = [
      makePlayer({ id: "a" }),
      makePlayer({ id: "b" }),
      makePlayer({ id: "c" }),
      makePlayer({ id: "d" }),
    ];
    const previous = makeMatch(["a", "b"], ["c", "d"], { status: "completed" });
    const result = generateMatchDraft({
      players: [a, b, c, d],
      matches: [previous],
      settings: { genderRule: "mixed", skillMatchmakingEnabled: false },
      rng: seededRng(11),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(draftKey(result.draft)).not.toBe(comboKey(["a", "b"], ["c", "d"]));
    }
  });

  it("returns a gender conflict with host options when no combo satisfies the rule", () => {
    const players = [
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "female" }),
    ];
    const result = generateMatchDraft({
      players,
      matches: [],
      settings: { genderRule: "same_gender_only", skillMatchmakingEnabled: true },
    });
    expect(result).toEqual({
      ok: false,
      reason: "gender_conflict",
      options: ["allow_mixed_for_this_match", "cancel"],
    });
  });

  it("honors the host's allow-mixed override after a conflict", () => {
    const players = [
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "male" }),
      makePlayer({ gender: "female" }),
    ];
    const result = generateMatchDraft({
      players,
      matches: [],
      settings: { genderRule: "same_gender_only", skillMatchmakingEnabled: true },
      allowMixedOverride: true,
    });
    expect(result.ok).toBe(true);
  });

  it("keeps same-gender pairs when the rule is satisfiable", () => {
    const m1 = makePlayer({ gender: "male" });
    const m2 = makePlayer({ gender: "male" });
    const f1 = makePlayer({ gender: "female" });
    const f2 = makePlayer({ gender: "female" });

    const result = generateMatchDraft({
      players: [m1, f1, m2, f2],
      matches: [],
      settings: { genderRule: "same_gender_only", skillMatchmakingEnabled: true },
      rng: seededRng(5),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(draftKey(result.draft)).toBe(
        comboKey([m1.id, m2.id], [f1.id, f2.id]),
      );
    }
  });
});
