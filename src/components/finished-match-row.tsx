"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import type { AvatarMap } from "@/lib/avatar";
import { UNKNOWN_AVATAR } from "@/lib/avatar";
import type { MatchDTO, MatchSidePlayerDTO } from "@/lib/dto";
import { formatClockTime, formatDuration } from "@/lib/format";

/** Scores are stored "21-17"; the row shows a proper en dash. */
const displayScore = (score: string) => score.replace("-", "–");

function Team({
  players,
  avatars,
  won,
  align,
}: {
  players: MatchSidePlayerDTO[];
  avatars: AvatarMap;
  won: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2",
        align === "right" ? "flex-row-reverse text-right" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-none [&>*+*]:-ml-[9px]",
          won ? "" : "opacity-55",
        ].join(" ")}
      >
        {players.map((player) => (
          <PlayerAvatar
            key={player.id}
            avatar={avatars.get(player.id) ?? UNKNOWN_AVATAR}
            size={28}
            name={player.name}
            className="border-2 border-white"
          />
        ))}
      </div>
      <span
        className={[
          "truncate text-[13px] leading-tight font-semibold",
          won ? "text-ink" : "text-muted",
        ].join(" ")}
      >
        {players.map((p) => p.name).join(" & ")}
      </span>
    </div>
  );
}

export function FinishedMatchRow({
  match,
  avatars,
  expanded,
  onToggle,
  /** Shared clock; null before mount, when absolute times can't be shown. */
  mounted,
}: {
  match: MatchDTO;
  avatars: AvatarMap;
  expanded: boolean;
  onToggle: () => void;
  mounted: boolean;
}) {
  const aWon = match.winningSide === "A";
  const matchNo = `M${String(match.matchNumber).padStart(2, "0")}`;

  const duration =
    match.endedAt &&
    formatDuration(
      new Date(match.endedAt).getTime() - new Date(match.startedAt).getTime(),
    );

  return (
    <li
      className={[
        "relative border-t border-line first:border-t-0",
        expanded ? "bg-[#FAFBF8]" : "",
      ].join(" ")}
    >
      <span
        className={[
          "absolute -top-px rounded-b-[6px] bg-green-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-green",
          aWon ? "left-3" : "right-3",
        ].join(" ")}
      >
        WON
      </span>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="grid w-full grid-cols-[1fr_34px_1fr] items-center px-3 py-2.5 text-left"
      >
        <Team
          players={match.sideA}
          avatars={avatars}
          won={aWon}
          align="left"
        />

        <span className="flex flex-col items-center gap-0.5">
          <span
            className={[
              "font-mono text-[13px] whitespace-nowrap",
              match.score
                ? "font-semibold text-ink"
                : "font-medium text-muted",
            ].join(" ")}
          >
            {match.score ? displayScore(match.score) : "—"}
          </span>
          <span className="font-mono text-[10px] font-medium tracking-[0.08em] text-faint">
            {matchNo}
          </span>
        </span>

        <Team
          players={match.sideB}
          avatars={avatars}
          won={!aWon}
          align="right"
        />
      </button>

      {expanded && (
        <p className="px-3 pb-3 text-center text-[12px] text-muted">
          {mounted && match.endedAt
            ? `${formatClockTime(match.startedAt)} – ${formatClockTime(match.endedAt)} · ${duration} · `
            : ""}
          {match.score
            ? `${displayScore(match.score)}`
            : "no score entered"}
        </p>
      )}
    </li>
  );
}
