"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type {
  ActionResponse,
  GenerateDraftResponse,
  SessionSummaryDTO,
} from "@/lib/dto";
import { seedRating } from "@/lib/engine/elo";
import { generateMatchDraft } from "@/lib/engine/matchmaking";
import { applyMatchResult } from "@/lib/engine/result";
import type { Gender, GenderRule, Side, SkillTier } from "@/lib/engine/types";
import {
  genderRuleToDb,
  genderToDb,
  tierToDb,
  toEngineMatch,
  toEnginePlayer,
  toPlayerDTO,
} from "@/lib/mappers";

const sessionPath = (sessionId: string) => `/s/${sessionId}`;

export async function createSession(formData: FormData) {
  const hostName = String(formData.get("hostName") ?? "").trim();
  const sessionName = String(formData.get("sessionName") ?? "").trim();
  if (!hostName || !sessionName) {
    return;
  }
  const host = await prisma.host.create({ data: { name: hostName } });
  const session = await prisma.session.create({
    data: { hostId: host.id, name: sessionName },
  });
  // `new=1` opens the share sheet once on arrival (spec §7.2) — the link is
  // the whole product, and this is the only moment we know the host has just
  // been handed one. SessionView strips the flag as soon as it has read it.
  redirect(`${sessionPath(session.id)}?new=1`);
}

/** How many ids one homepage visit may ask about. */
const SUMMARY_LIMIT = 10;

/**
 * Read-only lookup for the homepage's "Sesi kamu" chips (spec §7.1). The ids
 * come from the visitor's own localStorage, so unknown ones are dropped
 * silently rather than erroring — a session deleted from the database should
 * make its chip disappear, not break the homepage.
 *
 * Session ids are cuids and already act as bearer tokens for the session
 * itself, so this exposes nothing the id doesn't already grant.
 */
export async function getSessionSummaries(
  ids: string[],
): Promise<SessionSummaryDTO[]> {
  const wanted = [...new Set(ids.filter(Boolean))].slice(0, SUMMARY_LIMIT);
  if (wanted.length === 0) {
    return [];
  }

  const sessions = await prisma.session.findMany({
    where: { id: { in: wanted } },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      _count: { select: { players: true } },
    },
  });

  const byId = new Map(sessions.map((session) => [session.id, session]));
  // Returned in the caller's order, which is most-recently-opened first.
  return wanted.flatMap((id) => {
    const session = byId.get(id);
    return session
      ? [
          {
            id: session.id,
            name: session.name,
            status: session.status === "ACTIVE" ? ("active" as const) : ("closed" as const),
            playerCount: session._count.players,
            createdAt: session.createdAt.toISOString(),
          },
        ]
      : [];
  });
}

export async function addPlayer(
  sessionId: string,
  formData: FormData,
): Promise<ActionResponse> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Name is required" };
  }
  const skillTier = (formData.get("skillTier") ?? "unknown") as SkillTier;
  const gender = (formData.get("gender") ?? "unspecified") as Gender;
  await prisma.player.create({
    data: {
      sessionId,
      name,
      gender: genderToDb(gender),
      skillTier: tierToDb(skillTier),
      rating: seedRating(skillTier),
    },
  });
  revalidatePath(sessionPath(sessionId));
  return { ok: true };
}

export async function updatePlayer(
  playerId: string,
  updates: {
    name?: string;
    gender?: Gender;
    skillTier?: SkillTier;
    status?: "active" | "inactive";
  },
): Promise<ActionResponse> {
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return { ok: false, error: "Player not found" };
  }
  // Re-seed the rating on a tier change only while the player is unplayed —
  // after that, earned rating wins.
  const newTier = updates.skillTier;
  const rating =
    newTier && player.matchesPlayed === 0 ? seedRating(newTier) : undefined;

  await prisma.player.update({
    where: { id: playerId },
    data: {
      name: updates.name?.trim() || undefined,
      gender: updates.gender ? genderToDb(updates.gender) : undefined,
      skillTier: newTier ? tierToDb(newTier) : undefined,
      status: updates.status
        ? updates.status === "active"
          ? "ACTIVE"
          : "INACTIVE"
        : undefined,
      rating,
    },
  });
  revalidatePath(sessionPath(player.sessionId));
  return { ok: true };
}

export async function updateSettings(
  sessionId: string,
  settings: { genderRule: GenderRule; skillMatchmakingEnabled: boolean },
): Promise<ActionResponse> {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      genderRule: genderRuleToDb(settings.genderRule),
      skillMatchmakingEnabled: settings.skillMatchmakingEnabled,
    },
  });
  revalidatePath(sessionPath(sessionId));
  return { ok: true };
}

export async function generateDraft(
  sessionId: string,
  allowMixedOverride = false,
): Promise<GenerateDraftResponse> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { players: true, matches: { include: { players: true } } },
  });
  if (!session) {
    return { ok: false, reason: "error", message: "Session not found" };
  }

  const result = generateMatchDraft({
    players: session.players.map(toEnginePlayer),
    matches: session.matches.map(toEngineMatch),
    settings: {
      genderRule: session.genderRule.toLowerCase() as GenderRule,
      skillMatchmakingEnabled: session.skillMatchmakingEnabled,
    },
    allowMixedOverride,
  });

  if (!result.ok) {
    if (result.reason === "not_enough_players") {
      return {
        ok: false,
        reason: "not_enough_players",
        required: result.required,
        available: result.available,
      };
    }
    return { ok: false, reason: "gender_conflict" };
  }

  const byId = new Map(session.players.map((p) => [p.id, p]));
  return {
    ok: true,
    draft: {
      sideA: result.draft.sideA.map((p) => toPlayerDTO(byId.get(p.id)!)),
      sideB: result.draft.sideB.map((p) => toPlayerDTO(byId.get(p.id)!)),
    },
  };
}

export async function confirmMatch(
  sessionId: string,
  sideAIds: string[],
  sideBIds: string[],
): Promise<ActionResponse> {
  const size = sideAIds.length;
  if (
    (size !== 1 && size !== 2) ||
    sideBIds.length !== size ||
    new Set([...sideAIds, ...sideBIds]).size !== size * 2
  ) {
    return { ok: false, error: "Match must be 1v1 or 2v2 with distinct players" };
  }

  const allIds = [...sideAIds, ...sideBIds];
  const players = await prisma.player.findMany({
    where: { id: { in: allIds }, sessionId, status: "ACTIVE" },
  });
  if (players.length !== allIds.length) {
    return { ok: false, error: "All players must be active in this session" };
  }
  const busy = await prisma.matchPlayer.findFirst({
    where: { playerId: { in: allIds }, match: { status: "PENDING" } },
    include: { player: true },
  });
  if (busy) {
    return { ok: false, error: `${busy.player.name} is already in a match` };
  }

  const last = await prisma.match.aggregate({
    where: { sessionId },
    _max: { matchNumber: true },
  });
  try {
    await prisma.match.create({
      data: {
        sessionId,
        matchNumber: (last._max.matchNumber ?? 0) + 1,
        players: {
          create: [
            ...sideAIds.map((playerId) => ({ playerId, side: "A" as const })),
            ...sideBIds.map((playerId) => ({ playerId, side: "B" as const })),
          ],
        },
      },
    });
  } catch {
    return { ok: false, error: "Could not create the match — try again" };
  }
  revalidatePath(sessionPath(sessionId));
  return { ok: true };
}

export async function submitResult(
  matchId: string,
  winningSide: Side,
  score?: string,
): Promise<ActionResponse> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: { include: { player: true } },
      session: true,
    },
  });
  if (!match) {
    return { ok: false, error: "Match not found" };
  }
  if (match.status === "COMPLETED") {
    return { ok: false, error: "Result already recorded" };
  }

  const completedAt = new Date();
  const sideOf = (s: Side) =>
    match.players.filter((mp) => mp.side === s).map((mp) => toEnginePlayer(mp.player));
  const updates = applyMatchResult({
    sideA: sideOf("A"),
    sideB: sideOf("B"),
    winningSide,
    skillMatchmakingEnabled: match.session.skillMatchmakingEnabled,
    completedAt,
  });

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { status: "COMPLETED", completedAt },
    }),
    prisma.matchResult.create({
      data: { matchId, winningSide, score: score?.trim() || null },
    }),
    ...updates.map((u) =>
      prisma.player.update({
        where: { id: u.playerId },
        data: {
          rating: u.rating,
          matchesPlayed: u.matchesPlayed,
          lastPlayedAt: u.lastPlayedAt,
        },
      }),
    ),
  ]);
  revalidatePath(sessionPath(match.sessionId));
  return { ok: true };
}
