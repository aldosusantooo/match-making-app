import { describe, expect, it } from "vitest";
import { applyMatchResult } from "../result";
import { makePlayer } from "./helpers";

describe("applyMatchResult", () => {
  const completedAt = new Date("2026-08-30T20:30:00Z");

  it("increments matches played and stamps last played for every participant", () => {
    const players = [
      makePlayer({ matchesPlayed: 2 }),
      makePlayer({ matchesPlayed: 0 }),
      makePlayer({ matchesPlayed: 5 }),
      makePlayer({ matchesPlayed: 1 }),
    ];
    const updates = applyMatchResult({
      sideA: [players[0], players[1]],
      sideB: [players[2], players[3]],
      winningSide: "A",
      skillMatchmakingEnabled: false,
      completedAt,
    });
    expect(updates).toHaveLength(4);
    for (const update of updates) {
      const before = players.find((p) => p.id === update.playerId)!;
      expect(update.matchesPlayed).toBe(before.matchesPlayed + 1);
      expect(update.lastPlayedAt).toBe(completedAt);
    }
  });

  it("leaves ratings untouched when skill matchmaking is off", () => {
    const a = makePlayer({ rating: 1000 });
    const b = makePlayer({ rating: 1200 });
    const updates = applyMatchResult({
      sideA: [a],
      sideB: [b],
      winningSide: "A",
      skillMatchmakingEnabled: false,
      completedAt,
    });
    expect(updates.find((u) => u.playerId === a.id)!.rating).toBe(1000);
    expect(updates.find((u) => u.playerId === b.id)!.rating).toBe(1200);
  });

  it("applies ELO with the pre-match K-factor when skill matchmaking is on", () => {
    // 5th match for this player (matchesPlayed 4 before): still K=40.
    const a = makePlayer({ rating: 1000, matchesPlayed: 4 });
    const b = makePlayer({ rating: 1000, matchesPlayed: 5 }); // K=20
    const updates = applyMatchResult({
      sideA: [a],
      sideB: [b],
      winningSide: "A",
      skillMatchmakingEnabled: true,
      completedAt,
    });
    expect(updates.find((u) => u.playerId === a.id)!.rating).toBeCloseTo(1020);
    expect(updates.find((u) => u.playerId === b.id)!.rating).toBeCloseTo(990);
  });
});
