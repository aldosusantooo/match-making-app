import type { Gender, GenderRule, Side, SkillTier } from "./engine/types";

export interface PlayerDTO {
  id: string;
  name: string;
  gender: Gender;
  skillTier: SkillTier;
  rating: number;
  status: "active" | "inactive";
  matchesPlayed: number;
  lastPlayedAt: string | null;
  /** Fallback "waiting since" for a player who hasn't played yet. */
  createdAt: string;
}

export interface MatchSidePlayerDTO {
  id: string;
  name: string;
}

export interface MatchDTO {
  id: string;
  matchNumber: number;
  status: "pending" | "completed";
  /** Match.createdAt — the moment the match went on court. */
  startedAt: string;
  /** Match.completedAt, null while pending. */
  endedAt: string | null;
  sideA: MatchSidePlayerDTO[];
  sideB: MatchSidePlayerDTO[];
  winningSide: Side | null;
  score: string | null;
}

export interface SessionDTO {
  id: string;
  name: string;
  createdAt: string;
  status: "active" | "closed";
  genderRule: GenderRule;
  skillMatchmakingEnabled: boolean;
  players: PlayerDTO[];
  matches: MatchDTO[];
}

export type DraftDTO = {
  sideA: PlayerDTO[];
  sideB: PlayerDTO[];
};

export type GenerateDraftResponse =
  | { ok: true; draft: DraftDTO }
  | { ok: false; reason: "not_enough_players"; required: number; available: number }
  | { ok: false; reason: "gender_conflict" }
  | { ok: false; reason: "error"; message: string };

export type ActionResponse = { ok: true } | { ok: false; error: string };
