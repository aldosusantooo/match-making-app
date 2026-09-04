import type {
  Gender as DbGender,
  GenderRule as DbGenderRule,
  Match,
  MatchPlayer,
  MatchResult,
  Player,
  PlayerStatus as DbPlayerStatus,
  Session,
  SkillTier as DbSkillTier,
} from "@prisma/client";
import type { MatchDTO, PlayerDTO, SessionDTO } from "./dto";
import type {
  EngineMatch,
  EnginePlayer,
  Gender,
  GenderRule,
  SkillTier,
} from "./engine/types";

// Prisma enums are UPPERCASE variants of the engine's lowercase strings.
export const genderFromDb = (g: DbGender) => g.toLowerCase() as Gender;
export const genderToDb = (g: Gender) => g.toUpperCase() as DbGender;
export const tierFromDb = (t: DbSkillTier) => t.toLowerCase() as SkillTier;
export const tierToDb = (t: SkillTier) => t.toUpperCase() as DbSkillTier;
export const genderRuleFromDb = (r: DbGenderRule) =>
  r.toLowerCase() as GenderRule;
export const genderRuleToDb = (r: GenderRule) =>
  r.toUpperCase() as DbGenderRule;
export const playerStatusFromDb = (s: DbPlayerStatus) =>
  s.toLowerCase() as "active" | "inactive";

export type MatchWithRelations = Match & {
  players: (MatchPlayer & { player: Player })[];
  result: MatchResult | null;
};

export function toEnginePlayer(p: Player): EnginePlayer {
  return {
    id: p.id,
    name: p.name,
    gender: genderFromDb(p.gender),
    skillTier: tierFromDb(p.skillTier),
    rating: p.rating,
    status: playerStatusFromDb(p.status),
    matchesPlayed: p.matchesPlayed,
    lastPlayedAt: p.lastPlayedAt,
  };
}

export function toEngineMatch(m: Match & { players: MatchPlayer[] }): EngineMatch {
  return {
    id: m.id,
    matchNumber: m.matchNumber,
    status: m.status === "PENDING" ? "pending" : "completed",
    players: m.players.map((mp) => ({ playerId: mp.playerId, side: mp.side })),
  };
}

export function toPlayerDTO(p: Player): PlayerDTO {
  return {
    id: p.id,
    name: p.name,
    gender: genderFromDb(p.gender),
    skillTier: tierFromDb(p.skillTier),
    rating: p.rating,
    status: playerStatusFromDb(p.status),
    matchesPlayed: p.matchesPlayed,
    lastPlayedAt: p.lastPlayedAt ? p.lastPlayedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  };
}

export function toMatchDTO(m: MatchWithRelations): MatchDTO {
  const side = (s: "A" | "B") =>
    m.players
      .filter((mp) => mp.side === s)
      .map((mp) => ({ id: mp.playerId, name: mp.player.name }));
  return {
    id: m.id,
    matchNumber: m.matchNumber,
    status: m.status === "PENDING" ? "pending" : "completed",
    startedAt: m.createdAt.toISOString(),
    endedAt: m.completedAt ? m.completedAt.toISOString() : null,
    sideA: side("A"),
    sideB: side("B"),
    winningSide: m.result?.winningSide ?? null,
    score: m.result?.score ?? null,
  };
}

export function toSessionDTO(
  s: Session & { players: Player[]; matches: MatchWithRelations[] },
): SessionDTO {
  return {
    id: s.id,
    name: s.name,
    createdAt: s.createdAt.toISOString(),
    status: s.status === "ACTIVE" ? "active" : "closed",
    genderRule: genderRuleFromDb(s.genderRule),
    skillMatchmakingEnabled: s.skillMatchmakingEnabled,
    players: s.players.map(toPlayerDTO),
    matches: [...s.matches]
      .sort((a, b) => b.matchNumber - a.matchNumber)
      .map(toMatchDTO),
  };
}
