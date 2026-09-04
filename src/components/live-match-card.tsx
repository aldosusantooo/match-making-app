"use client";

import type { AvatarMap } from "@/lib/avatar";
import { UNKNOWN_AVATAR } from "@/lib/avatar";
import type { MatchDTO, MatchSidePlayerDTO } from "@/lib/dto";
import { formatClockTime, formatElapsed } from "@/lib/format";
import { PlayerAvatar } from "./player-avatar";

/**
 * Court positions per spec §4.4, as percentages of the half. Doubles put the
 * front player nearer the net and the back player deep, mirrored across the
 * net; singles centres the one player.
 */
const POSITIONS = {
  A: {
    doubles: [
      { left: "36%", top: "44%" },
      { left: "70%", top: "72%" },
    ],
    singles: [{ left: "50%", top: "55%" }],
  },
  B: {
    doubles: [
      { left: "30%", top: "44%" },
      { left: "64%", top: "72%" },
    ],
    singles: [{ left: "50%", top: "55%" }],
  },
} as const;

function CourtHalf({
  side,
  players,
  avatars,
}: {
  side: "A" | "B";
  players: MatchSidePlayerDTO[];
  avatars: AvatarMap;
}) {
  const positions =
    players.length === 1 ? POSITIONS[side].singles : POSITIONS[side].doubles;

  return (
    <div
      className={[
        "relative",
        side === "A"
          ? "bg-[linear-gradient(160deg,var(--color-court-a-1),var(--color-court-a-2))]"
          : "bg-[linear-gradient(200deg,var(--color-court-b-1),var(--color-court-b-2))]",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120px_90px_at_30%_20%,rgba(255,255,255,0.18),transparent_70%)]"
      />
      <span
        className={[
          "absolute top-2.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-white/70",
          side === "A" ? "left-3" : "right-3",
        ].join(" ")}
      >
        SIDE {side}
      </span>

      {players.map((player, index) => (
        <div
          key={player.id}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
          style={positions[Math.min(index, positions.length - 1)]}
        >
          <PlayerAvatar
            avatar={avatars.get(player.id) ?? UNKNOWN_AVATAR}
            size={44}
            name={player.name}
            className="border-[3px] border-white/95 shadow-avatar"
          />
          <span className="rounded-[7px] bg-black/22 px-2 py-0.5 text-[12px] font-semibold text-white">
            {player.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LiveMatchCard({
  match,
  avatars,
  now,
  courtLabel,
  onRecordResult,
}: {
  match: MatchDTO;
  avatars: AvatarMap;
  /** Shared clock; null before mount. */
  now: number | null;
  /** Only set when more than one court is running (spec §8). */
  courtLabel: string | null;
  onRecordResult: () => void;
}) {
  const startedAt = new Date(match.startedAt).getTime();
  const elapsed = now === null ? null : formatElapsed(now - startedAt);

  return (
    <article className="mx-4 overflow-hidden rounded-card border border-[rgba(23,35,28,0.05)] bg-surface shadow-card">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div>
          <h3 className="font-display text-[17px] font-bold">
            Match {String(match.matchNumber).padStart(2, "0")}
          </h3>
          <p className="mt-0.5 text-[12px] text-muted">
            {courtLabel && <>{courtLabel} · </>}
            {/* Rendered after mount: the clock time depends on the viewer's
                timezone, which SSR doesn't know. */}
            Started {now === null ? "—" : formatClockTime(match.startedAt)}
          </p>
        </div>

        <p
          className="flex items-center gap-[7px] rounded-full bg-live-soft py-1.5 pr-2.5 pl-[9px] font-mono text-[14px] font-semibold text-live-text"
          aria-label={elapsed ? `Elapsed ${elapsed}` : "Match in progress"}
        >
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full bg-live shadow-[0_0_0_4px_rgba(245,158,11,0.22)] motion-safe:animate-live-pulse"
          />
          <span className="tabular-nums">{elapsed ?? "--:--"}</span>
        </p>
      </div>

      <div className="mx-3 mb-1.5 grid h-[150px] grid-cols-[1fr_6px_1fr] overflow-hidden rounded-court">
        <CourtHalf side="A" players={match.sideA} avatars={avatars} />
        <div className="relative bg-white" aria-hidden>
          <span className="absolute -top-1 -left-1 h-3.5 w-3.5 rounded-full bg-white" />
          <span className="absolute -bottom-1 -left-1 h-3.5 w-3.5 rounded-full bg-white" />
        </div>
        <CourtHalf side="B" players={match.sideB} avatars={avatars} />
      </div>

      <div className="px-4 pt-2.5 pb-4">
        <button
          type="button"
          onClick={onRecordResult}
          className="w-full rounded-btn bg-green py-[13px] text-center text-[15px] font-semibold text-white active:opacity-85"
        >
          Record result
        </button>
      </div>
    </article>
  );
}
