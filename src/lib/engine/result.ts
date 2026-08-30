import { eloDeltas } from "./elo";
import type { EnginePlayer, PlayerResultUpdate, Side } from "./types";

// Pure computation of the player updates a completed match produces:
// matchesPlayed increments, lastPlayedAt moves to completedAt, and ratings
// shift by ELO when skill matchmaking is on. Deltas use each player's
// pre-match matchesPlayed for the K-factor.
export function applyMatchResult(options: {
  sideA: EnginePlayer[];
  sideB: EnginePlayer[];
  winningSide: Side;
  skillMatchmakingEnabled: boolean;
  completedAt: Date;
}): PlayerResultUpdate[] {
  const { sideA, sideB, winningSide, skillMatchmakingEnabled, completedAt } =
    options;
  const deltas = skillMatchmakingEnabled
    ? eloDeltas(sideA, sideB, winningSide)
    : new Map<string, number>();

  return [...sideA, ...sideB].map((p) => ({
    playerId: p.id,
    rating: p.rating + (deltas.get(p.id) ?? 0),
    matchesPlayed: p.matchesPlayed + 1,
    lastPlayedAt: completedAt,
  }));
}
