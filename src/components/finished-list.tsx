"use client";

import { useState } from "react";
import type { AvatarMap } from "@/lib/avatar";
import type { MatchDTO } from "@/lib/dto";
import { FinishedMatchRow } from "./finished-match-row";

/** Rows shown before "Show N more" (spec §4.7). */
export const FINISHED_PREVIEW_COUNT = 3;

export function FinishedList({
  matches,
  avatars,
  showAll,
  onToggleShowAll,
  mounted,
}: {
  /** Completed matches, newest first. */
  matches: MatchDTO[];
  avatars: AvatarMap;
  showAll: boolean;
  onToggleShowAll: () => void;
  mounted: boolean;
}) {
  // Only one row is open at a time; opening another closes the first.
  const [openId, setOpenId] = useState<string | null>(null);

  const hidden = matches.length - FINISHED_PREVIEW_COUNT;
  const visible = showAll
    ? matches
    : matches.slice(0, FINISHED_PREVIEW_COUNT);

  return (
    <div className="mx-4 overflow-hidden rounded-list border border-[rgba(23,35,28,0.05)] bg-surface shadow-list">
      <ul>
        {visible.map((match) => (
          <FinishedMatchRow
            key={match.id}
            match={match}
            avatars={avatars}
            mounted={mounted}
            expanded={openId === match.id}
            onToggle={() =>
              setOpenId(openId === match.id ? null : match.id)
            }
          />
        ))}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="w-full border-t border-line py-3 text-center text-[13px] font-semibold text-green"
        >
          {showAll ? "Show less" : `Show ${hidden} more`}
        </button>
      )}
    </div>
  );
}
