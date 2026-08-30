import type {
  EngineMatch,
  EnginePlayer,
  Gender,
  SkillTier,
} from "../types";

let playerSeq = 0;

export function makePlayer(
  overrides: Partial<EnginePlayer> = {},
): EnginePlayer {
  playerSeq += 1;
  return {
    id: overrides.id ?? `p${playerSeq}`,
    name: overrides.name ?? `Player ${playerSeq}`,
    gender: (overrides.gender ?? "unspecified") as Gender,
    skillTier: (overrides.skillTier ?? "unknown") as SkillTier,
    rating: overrides.rating ?? 1000,
    status: overrides.status ?? "active",
    matchesPlayed: overrides.matchesPlayed ?? 0,
    lastPlayedAt: overrides.lastPlayedAt ?? null,
  };
}

let matchSeq = 0;

export function makeMatch(
  sideAIds: string[],
  sideBIds: string[],
  overrides: Partial<Pick<EngineMatch, "id" | "matchNumber" | "status">> = {},
): EngineMatch {
  matchSeq += 1;
  return {
    id: overrides.id ?? `m${matchSeq}`,
    matchNumber: overrides.matchNumber ?? matchSeq,
    status: overrides.status ?? "completed",
    players: [
      ...sideAIds.map((playerId) => ({ playerId, side: "A" as const })),
      ...sideBIds.map((playerId) => ({ playerId, side: "B" as const })),
    ],
  };
}

// Deterministic PRNG for tests (mulberry32).
export function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
