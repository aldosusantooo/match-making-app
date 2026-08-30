import { describe, expect, it } from "vitest";
import { eloDeltas, expectedScore, kFactor, seedRating } from "../elo";
import { makePlayer } from "./helpers";

describe("seedRating", () => {
  it("seeds ratings from skill tier per the brief", () => {
    expect(seedRating("beginner")).toBe(800);
    expect(seedRating("intermediate")).toBe(1000);
    expect(seedRating("advanced")).toBe(1200);
    expect(seedRating("unknown")).toBe(1000);
  });
});

describe("kFactor", () => {
  it("is 40 for a player's first 5 matches, then 20", () => {
    expect(kFactor(0)).toBe(40);
    expect(kFactor(4)).toBe(40); // 5th match: still 40
    expect(kFactor(5)).toBe(20); // 6th match: drops to 20
    expect(kFactor(50)).toBe(20);
  });
});

describe("expectedScore", () => {
  it("is 0.5 for equal ratings", () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5);
  });

  it("gives the higher-rated team more than 0.5, symmetrically", () => {
    const strong = expectedScore(1200, 1000);
    const weak = expectedScore(1000, 1200);
    expect(strong).toBeGreaterThan(0.5);
    expect(strong + weak).toBeCloseTo(1);
  });

  it("matches the 400-point formula: +400 gap → 10:1 odds", () => {
    expect(expectedScore(1200, 800)).toBeCloseTo(10 / 11, 5);
  });
});

describe("eloDeltas", () => {
  it("moves equal-rated teams by ±K·0.5", () => {
    const a1 = makePlayer({ rating: 1000, matchesPlayed: 0 });
    const a2 = makePlayer({ rating: 1000, matchesPlayed: 0 });
    const b1 = makePlayer({ rating: 1000, matchesPlayed: 0 });
    const b2 = makePlayer({ rating: 1000, matchesPlayed: 0 });

    const deltas = eloDeltas([a1, a2], [b1, b2], "A");
    expect(deltas.get(a1.id)).toBeCloseTo(20); // 40 * (1 - 0.5)
    expect(deltas.get(a2.id)).toBeCloseTo(20);
    expect(deltas.get(b1.id)).toBeCloseTo(-20); // 40 * (0 - 0.5)
    expect(deltas.get(b2.id)).toBeCloseTo(-20);
  });

  it("uses team average ratings, applying the same expected score to both members", () => {
    const a1 = makePlayer({ rating: 1200 });
    const a2 = makePlayer({ rating: 800 }); // team A avg 1000
    const b1 = makePlayer({ rating: 1000 });
    const b2 = makePlayer({ rating: 1000 }); // team B avg 1000

    const deltas = eloDeltas([a1, a2], [b1, b2], "B");
    expect(deltas.get(a1.id)).toBeCloseTo(-20);
    expect(deltas.get(a2.id)).toBeCloseTo(-20);
    expect(deltas.get(b1.id)).toBeCloseTo(20);
    expect(deltas.get(b2.id)).toBeCloseTo(20);
  });

  it("applies K per player, not per match", () => {
    const veteran = makePlayer({ rating: 1000, matchesPlayed: 10 }); // K=20
    const rookie = makePlayer({ rating: 1000, matchesPlayed: 1 }); // K=40
    const b1 = makePlayer({ rating: 1000, matchesPlayed: 10 });
    const b2 = makePlayer({ rating: 1000, matchesPlayed: 10 });

    const deltas = eloDeltas([veteran, rookie], [b1, b2], "A");
    expect(deltas.get(veteran.id)).toBeCloseTo(10); // 20 * 0.5
    expect(deltas.get(rookie.id)).toBeCloseTo(20); // 40 * 0.5
  });

  it("rewards an upset win more than a favored win", () => {
    const underdogA = makePlayer({ rating: 800 });
    const underdogB = makePlayer({ rating: 800 });
    const favA = makePlayer({ rating: 1200 });
    const favB = makePlayer({ rating: 1200 });

    const deltas = eloDeltas([underdogA, underdogB], [favA, favB], "A");
    // expected_A = 1/(1+10^(400/400)) = 1/11; delta = 40 * (1 - 1/11)
    expect(deltas.get(underdogA.id)).toBeCloseTo(40 * (1 - 1 / 11), 5);
    expect(deltas.get(favA.id)).toBeCloseTo(40 * (0 - 10 / 11), 5);
  });

  it("works for singles (one player per side)", () => {
    const a = makePlayer({ rating: 1000 });
    const b = makePlayer({ rating: 1000 });
    const deltas = eloDeltas([a], [b], "B");
    expect(deltas.get(a.id)).toBeCloseTo(-20);
    expect(deltas.get(b.id)).toBeCloseTo(20);
  });
});
