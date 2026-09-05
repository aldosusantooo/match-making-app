"use client";

import { useEffect, useState } from "react";
import { getSessionSummaries } from "@/app/actions";
import type { SessionSummaryDTO } from "@/lib/dto";
import { readRecentSessions } from "@/lib/recent-sessions";

/** Chips shown at most, newest first (spec §7.1). */
const VISIBLE = 3;

/** A session counts as live for this long after it was created. */
const LIVE_WINDOW_MS = 8 * 60 * 60 * 1000;

/** A summary plus the liveness snapshot taken when it was fetched. */
type RecentChipData = SessionSummaryDTO & { live: boolean };

/**
 * "Sesi kamu" — a way back into sessions this browser has opened before
 * (spec §7.1).
 *
 * Renders nothing until after hydration and nothing at all when the list is
 * empty, so a first-time visitor sees no label and no gap. The ids come from
 * localStorage but every word on screen comes from the server, so a renamed
 * session shows its new name and a deleted one drops out.
 */
export function RecentSessions() {
  const [sessions, setSessions] = useState<RecentChipData[]>([]);

  useEffect(() => {
    const remembered = readRecentSessions();
    if (remembered.length === 0) {
      return;
    }

    let active = true;
    getSessionSummaries(remembered.map((entry) => entry.id))
      .then((found) => {
        if (!active) {
          return;
        }
        // Liveness is decided once, here, rather than on every render: the
        // clock is not a pure input, and a chip flipping state mid-scroll
        // would be noise either way.
        const now = Date.now();
        setSessions(
          found.slice(0, VISIBLE).map((session) => ({
            ...session,
            live:
              session.status === "active" &&
              now - new Date(session.createdAt).getTime() < LIVE_WINDOW_MS,
          })),
        );
      })
      .catch(() => {
        // Offline or a failed action: the create form below still works, so
        // showing nothing is a better outcome than an error the host can't
        // act on.
      });

    return () => {
      active = false;
    };
  }, []);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 motion-safe:animate-chips-in">
      <p className="mb-1.5 text-[12px] font-semibold text-muted">Sesi kamu</p>
      <div className="flex flex-wrap gap-2">
        {sessions.map((session) => (
          <RecentChip key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

function RecentChip({ session }: { session: RecentChipData }) {
  const { live } = session;

  return (
    <a
      href={`/s/${session.id}`}
      className="inline-flex items-center gap-2 rounded-[10px] bg-green-soft px-3 py-2 text-[13px] font-semibold text-green transition-[scale] duration-200 ease-brand active:scale-97"
    >
      {live && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-live motion-safe:animate-live-pulse"
        />
      )}
      {session.name}
      <small className="font-mono text-[11px] font-medium text-green/75">
        · {session.playerCount} pemain{live ? " · live" : ""}
      </small>
    </a>
  );
}
