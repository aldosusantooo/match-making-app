export type SkillTier = "beginner" | "intermediate" | "advanced" | "unknown";
export type Gender = "male" | "female" | "unspecified";
export type GenderRule = "mixed" | "same_gender_only" | "singles_only";
export type Side = "A" | "B";

export interface EnginePlayer {
  id: string;
  name: string;
  gender: Gender;
  skillTier: SkillTier;
  rating: number;
  status: "active" | "inactive";
  matchesPlayed: number;
  lastPlayedAt: Date | null;
}

export interface EngineMatchPlayer {
  playerId: string;
  side: Side;
}

export interface EngineMatch {
  id: string;
  matchNumber: number;
  status: "pending" | "completed";
  players: EngineMatchPlayer[];
}

export interface SessionSettings {
  genderRule: GenderRule;
  skillMatchmakingEnabled: boolean;
}

export interface Combo {
  sideA: EnginePlayer[];
  sideB: EnginePlayer[];
}

export interface Weights {
  skill: number;
  variety: number;
}

export type DraftResult =
  | { ok: true; draft: Combo }
  | {
      ok: false;
      reason: "not_enough_players";
      required: number;
      available: number;
    }
  | {
      ok: false;
      reason: "gender_conflict";
      options: readonly ["allow_mixed_for_this_match", "cancel"];
    };

export interface PlayerResultUpdate {
  playerId: string;
  rating: number;
  matchesPlayed: number;
  lastPlayedAt: Date;
}
