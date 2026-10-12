import {
  DAY_MS,
  type DayCount,
  type FunnelStep,
  buildFunnel,
  countByDay,
  startOfWibDay,
} from "./admin-metrics";
import { prisma } from "./db";

/** Days in the sessions-per-day chart and the funnel window. */
export const CHART_DAYS = 30;
/** Anything in a session this recently makes it live. */
const LIVE_WINDOW_MS = 60 * 60 * 1000;
const RECENT_LIMIT = 50;
const WEEK_MS = 7 * DAY_MS;

export interface Comparison {
  /** The last 7 days. */
  current: number;
  /** The 7 days before that. */
  previous: number;
}

export interface RecentSession {
  id: string;
  name: string;
  hostName: string;
  createdAt: Date;
  lastActivityAt: Date;
  players: number;
  matchesPlayed: number;
  live: boolean;
}

export interface AdminStats {
  liveNow: number;
  lastWeek: { sessions: Comparison; matches: Comparison; players: Comparison };
  allTime: { sessions: number; players: number; matches: number };
  sessionsPerDay: DayCount[];
  funnel: FunnelStep[];
  recent: RecentSession[];
}

/**
 * Everything the admin page shows, read straight from the app's tables. No
 * player names leave here: the dashboard is about whether Bisai gets used,
 * not who played.
 */
export async function getAdminStats(now: Date): Promise<AdminStats> {
  const liveSince = new Date(now.getTime() - LIVE_WINDOW_MS);
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const twoWeeksAgo = new Date(now.getTime() - 2 * WEEK_MS);
  const windowStart = startOfWibDay(
    new Date(now.getTime() - (CHART_DAYS - 1) * DAY_MS),
  );

  const inRange = (from: Date, to: Date) => ({ gte: from, lt: to });

  const [
    liveNow,
    sessionsNow,
    sessionsBefore,
    matchesNow,
    matchesBefore,
    playersNow,
    playersBefore,
    allSessions,
    allPlayers,
    allMatches,
    windowSessions,
    recentSessions,
  ] = await Promise.all([
    prisma.session.count({
      where: {
        OR: [
          { createdAt: { gte: liveSince } },
          { players: { some: { createdAt: { gte: liveSince } } } },
          {
            matches: {
              some: {
                OR: [
                  { createdAt: { gte: liveSince } },
                  { completedAt: { gte: liveSince } },
                ],
              },
            },
          },
        ],
      },
    }),
    prisma.session.count({ where: { createdAt: inRange(weekAgo, now) } }),
    prisma.session.count({ where: { createdAt: inRange(twoWeeksAgo, weekAgo) } }),
    prisma.match.count({ where: { completedAt: inRange(weekAgo, now) } }),
    prisma.match.count({
      where: { completedAt: inRange(twoWeeksAgo, weekAgo) },
    }),
    prisma.player.count({ where: { createdAt: inRange(weekAgo, now) } }),
    prisma.player.count({ where: { createdAt: inRange(twoWeeksAgo, weekAgo) } }),
    prisma.session.count(),
    prisma.player.count(),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.session.findMany({
      where: { createdAt: { gte: windowStart } },
      select: {
        createdAt: true,
        _count: { select: { players: true } },
        matches: { select: { status: true } },
      },
    }),
    prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      select: {
        id: true,
        name: true,
        createdAt: true,
        host: { select: { name: true } },
        players: { select: { createdAt: true } },
        matches: {
          select: { status: true, createdAt: true, completedAt: true },
        },
      },
    }),
  ]);

  return {
    liveNow,
    lastWeek: {
      sessions: { current: sessionsNow, previous: sessionsBefore },
      matches: { current: matchesNow, previous: matchesBefore },
      players: { current: playersNow, previous: playersBefore },
    },
    allTime: { sessions: allSessions, players: allPlayers, matches: allMatches },
    sessionsPerDay: countByDay(
      windowSessions.map((s) => s.createdAt),
      CHART_DAYS,
      now,
    ),
    funnel: buildFunnel(
      windowSessions.map((s) => ({
        players: s._count.players,
        matches: s.matches.length,
        completed: s.matches.filter((m) => m.status === "COMPLETED").length,
      })),
    ),
    recent: recentSessions.map((session) => {
      const lastActivityAt = new Date(
        Math.max(
          session.createdAt.getTime(),
          ...session.players.map((p) => p.createdAt.getTime()),
          ...session.matches.map((m) =>
            Math.max(m.createdAt.getTime(), m.completedAt?.getTime() ?? 0),
          ),
        ),
      );
      return {
        id: session.id,
        name: session.name,
        hostName: session.host.name,
        createdAt: session.createdAt,
        lastActivityAt,
        players: session.players.length,
        matchesPlayed: session.matches.filter((m) => m.status === "COMPLETED")
          .length,
        live: lastActivityAt >= liveSince,
      };
    }),
  };
}
