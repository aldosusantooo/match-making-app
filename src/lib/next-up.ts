import type { PlayerDTO, SessionDTO } from "./dto";

/** The moment a player started waiting: end of their last match, else join. */
export function waitingSince(player: PlayerDTO): number {
  return new Date(player.lastPlayedAt ?? player.createdAt).getTime();
}

/**
 * The order the matchmaker would pick from: fewest matches played, then
 * longest wait. This mirrors `sortByFairness` in the engine minus its shuffle
 * — ties there are broken randomly at the selection cutoff, which can't be
 * shown in a list, so they're broken by wait time here instead.
 */
export function byNextUp(a: PlayerDTO, b: PlayerDTO): number {
  if (a.matchesPlayed !== b.matchesPlayed) {
    return a.matchesPlayed - b.matchesPlayed;
  }
  return waitingSince(a) - waitingSince(b);
}

export interface NextUp {
  /** Everyone off court, next-up order first and resting players last. */
  roster: PlayerDTO[];
  /** Active and off court — exactly the matchmaker's eligible pool. */
  free: PlayerDTO[];
  /** 2 for a singles-only session, otherwise 4. */
  matchSize: number;
  /** Enough free players for another match. */
  ready: boolean;
  /** How many more free players a match needs; 0 once ready. */
  missing: number;
}

/**
 * Derived fresh from the session on every render, so the hint line and the
 * Create match button can never disagree with what's on screen.
 */
export function deriveNextUp(
  session: SessionDTO,
  playingIds: ReadonlySet<string>,
): NextUp {
  const offCourt = session.players.filter((p) => !playingIds.has(p.id));
  const free = offCourt
    .filter((p) => p.status === "active")
    .sort(byNextUp);
  const resting = offCourt
    .filter((p) => p.status !== "active")
    .sort(byNextUp);

  const matchSize = session.genderRule === "singles_only" ? 2 : 4;

  return {
    roster: [...free, ...resting],
    free,
    matchSize,
    ready: free.length >= matchSize,
    missing: Math.max(0, matchSize - free.length),
  };
}
