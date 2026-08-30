import type {
  Combo,
  DraftResult,
  EngineMatch,
  EnginePlayer,
  GenderRule,
  SessionSettings,
  Weights,
} from "./types";

export const DEFAULT_WEIGHTS: Weights = { skill: 3, variety: 1 };

// --- Step 1: eligible pool ---

export function buildEligiblePool(
  players: EnginePlayer[],
  matches: EngineMatch[],
): EnginePlayer[] {
  const inPendingMatch = new Set(
    matches
      .filter((m) => m.status === "pending")
      .flatMap((m) => m.players.map((mp) => mp.playerId)),
  );
  return players.filter(
    (p) => p.status === "active" && !inPendingMatch.has(p.id),
  );
}

// --- Step 3: fairness sort ---

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Shuffle first, then stable-sort: players tied on (matchesPlayed, lastPlayedAt)
// end up in random order, which is what breaks ties at the selection cutoff.
export function sortByFairness(
  pool: EnginePlayer[],
  rng: () => number = Math.random,
): EnginePlayer[] {
  return shuffle(pool, rng).sort((a, b) => {
    if (a.matchesPlayed !== b.matchesPlayed) {
      return a.matchesPlayed - b.matchesPlayed;
    }
    const aTime = a.lastPlayedAt ? a.lastPlayedAt.getTime() : -Infinity;
    const bTime = b.lastPlayedAt ? b.lastPlayedAt.getTime() : -Infinity;
    return aTime - bTime;
  });
}

// --- Step 5: side combinations ---

export function generateSideCombos(selected: EnginePlayer[]): Combo[] {
  if (selected.length === 2) {
    return [{ sideA: [selected[0]], sideB: [selected[1]] }];
  }
  if (selected.length === 4) {
    const [a, b, c, d] = selected;
    return [
      { sideA: [a, b], sideB: [c, d] },
      { sideA: [a, c], sideB: [b, d] },
      { sideA: [a, d], sideB: [b, c] },
    ];
  }
  throw new Error(`Cannot generate side combos for ${selected.length} players`);
}

// A doubles pair satisfies same_gender_only only when both genders are known
// and equal — "unspecified" can't be verified, so it fails the strict rule.
function pairSameGender(pair: EnginePlayer[]): boolean {
  return (
    pair[0].gender !== "unspecified" && pair[0].gender === pair[1].gender
  );
}

export function comboSatisfiesGenderRule(
  combo: Combo,
  rule: GenderRule,
): boolean {
  if (rule !== "same_gender_only" || combo.sideA.length === 1) {
    return true;
  }
  return pairSameGender(combo.sideA) && pairSameGender(combo.sideB);
}

// --- Step 6: scoring ---

type PairKey = string;

function pairKey(idA: string, idB: string): PairKey {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

export interface PairCounts {
  partnered: Map<PairKey, number>;
  opposed: Map<PairKey, number>;
}

// Counts come from all persisted matches (pending included — a match in
// progress is still a real pairing), computed on the fly per the brief.
export function buildPairCounts(matches: EngineMatch[]): PairCounts {
  const partnered = new Map<PairKey, number>();
  const opposed = new Map<PairKey, number>();
  const bump = (map: Map<PairKey, number>, key: PairKey) =>
    map.set(key, (map.get(key) ?? 0) + 1);

  for (const match of matches) {
    const sideA = match.players.filter((p) => p.side === "A");
    const sideB = match.players.filter((p) => p.side === "B");
    for (const side of [sideA, sideB]) {
      for (let i = 0; i < side.length; i++) {
        for (let j = i + 1; j < side.length; j++) {
          bump(partnered, pairKey(side[i].playerId, side[j].playerId));
        }
      }
    }
    for (const a of sideA) {
      for (const b of sideB) {
        bump(opposed, pairKey(a.playerId, b.playerId));
      }
    }
  }
  return { partnered, opposed };
}

export function timesPartnered(
  counts: PairCounts,
  idA: string,
  idB: string,
): number {
  return counts.partnered.get(pairKey(idA, idB)) ?? 0;
}

export function timesOpposed(
  counts: PairCounts,
  idA: string,
  idB: string,
): number {
  return counts.opposed.get(pairKey(idA, idB)) ?? 0;
}

function avgRating(side: EnginePlayer[]): number {
  return side.reduce((sum, p) => sum + p.rating, 0) / side.length;
}

export function scoreCombo(
  combo: Combo,
  counts: PairCounts,
  skillMatchmakingEnabled: boolean,
  weights: Weights = DEFAULT_WEIGHTS,
): number {
  const skillScore = skillMatchmakingEnabled
    ? -Math.abs(avgRating(combo.sideA) - avgRating(combo.sideB))
    : 0;

  let staleness = 0;
  for (const side of [combo.sideA, combo.sideB]) {
    if (side.length === 2) {
      staleness += timesPartnered(counts, side[0].id, side[1].id);
    }
  }
  for (const a of combo.sideA) {
    for (const b of combo.sideB) {
      staleness += timesOpposed(counts, a.id, b.id);
    }
  }
  const freshnessScore = -staleness;

  return weights.skill * skillScore + weights.variety * freshnessScore;
}

// Two combos are "identical" when the partnerships match, regardless of
// which side is labelled A or B and of player order within a side.
export function comboKey(sideAIds: string[], sideBIds: string[]): string {
  const a = [...sideAIds].sort().join("+");
  const b = [...sideBIds].sort().join("+");
  return [a, b].sort().join(" vs ");
}

function matchComboKey(match: EngineMatch): string {
  return comboKey(
    match.players.filter((p) => p.side === "A").map((p) => p.playerId),
    match.players.filter((p) => p.side === "B").map((p) => p.playerId),
  );
}

export function pickBestCombo(
  combos: Combo[],
  counts: PairCounts,
  skillMatchmakingEnabled: boolean,
  previousMatch: EngineMatch | null,
  weights: Weights = DEFAULT_WEIGHTS,
): Combo {
  const previousKey = previousMatch ? matchComboKey(previousMatch) : null;
  const notRepeats = combos.filter(
    (c) =>
      comboKey(
        c.sideA.map((p) => p.id),
        c.sideB.map((p) => p.id),
      ) !== previousKey,
  );
  const candidates = notRepeats.length > 0 ? notRepeats : combos;

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const combo of candidates) {
    const score = scoreCombo(combo, counts, skillMatchmakingEnabled, weights);
    if (score > bestScore) {
      best = combo;
      bestScore = score;
    }
  }
  return best;
}

// --- Orchestrator ---

export interface DraftOptions {
  players: EnginePlayer[];
  matches: EngineMatch[];
  settings: SessionSettings;
  /** Host chose "allow mixed for this match" after a gender conflict. */
  allowMixedOverride?: boolean;
  rng?: () => number;
  weights?: Weights;
}

export function generateMatchDraft(options: DraftOptions): DraftResult {
  const {
    players,
    matches,
    settings,
    allowMixedOverride = false,
    rng = Math.random,
    weights = DEFAULT_WEIGHTS,
  } = options;

  const matchSize = settings.genderRule === "singles_only" ? 2 : 4;
  const pool = buildEligiblePool(players, matches);
  if (pool.length < matchSize) {
    return {
      ok: false,
      reason: "not_enough_players",
      required: matchSize,
      available: pool.length,
    };
  }

  const selected = sortByFairness(pool, rng).slice(0, matchSize);
  const combos = generateSideCombos(selected);

  const effectiveRule: GenderRule = allowMixedOverride
    ? "mixed"
    : settings.genderRule;
  const validCombos = combos.filter((c) =>
    comboSatisfiesGenderRule(c, effectiveRule),
  );
  if (validCombos.length === 0) {
    return {
      ok: false,
      reason: "gender_conflict",
      options: ["allow_mixed_for_this_match", "cancel"] as const,
    };
  }

  const counts = buildPairCounts(matches);
  const previousMatch =
    matches.length > 0
      ? matches.reduce((latest, m) =>
          m.matchNumber > latest.matchNumber ? m : latest,
        )
      : null;

  const best = pickBestCombo(
    validCombos,
    counts,
    settings.skillMatchmakingEnabled,
    previousMatch,
    weights,
  );
  return { ok: true, draft: best };
}
