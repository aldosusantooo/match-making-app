import type { EnginePlayer, Side, SkillTier } from "./types";

export const TIER_SEED_RATING: Record<SkillTier, number> = {
  beginner: 800,
  intermediate: 1000,
  advanced: 1200,
  unknown: 1000,
};

export function seedRating(tier: SkillTier): number {
  return TIER_SEED_RATING[tier];
}

// K is 40 for a player's first 5 matches, so the check uses matchesPlayed
// as it stands BEFORE this match is counted.
export function kFactor(matchesPlayedBefore: number): number {
  return matchesPlayedBefore < 5 ? 40 : 20;
}

export function expectedScore(teamRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - teamRating) / 400));
}

function avg(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

export function eloDeltas(
  sideA: EnginePlayer[],
  sideB: EnginePlayer[],
  winningSide: Side,
): Map<string, number> {
  const teamA = avg(sideA.map((p) => p.rating));
  const teamB = avg(sideB.map((p) => p.rating));
  const expectedA = expectedScore(teamA, teamB);
  const expectedB = 1 - expectedA;
  const actualA = winningSide === "A" ? 1 : 0;
  const actualB = 1 - actualA;

  const deltas = new Map<string, number>();
  for (const p of sideA) {
    deltas.set(p.id, kFactor(p.matchesPlayed) * (actualA - expectedA));
  }
  for (const p of sideB) {
    deltas.set(p.id, kFactor(p.matchesPlayed) * (actualB - expectedB));
  }
  return deltas;
}
