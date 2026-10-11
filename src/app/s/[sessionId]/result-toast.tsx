"use client";

import { PlayerAvatar } from "@/components/player-avatar";
import type { AvatarMap } from "@/lib/avatar";
import { UNKNOWN_AVATAR } from "@/lib/avatar";
import type { MatchSidePlayerDTO } from "@/lib/dto";
import { Toast } from "./toast";

export interface ResultToastData {
  winners: MatchSidePlayerDTO[];
  matchNumber: number;
  /** Only true when the session actually moved the winners' rating. */
  ratingUp: boolean;
}

/**
 * Confirmation that a result landed (spec §7.3). The score sheet closes the
 * moment it saves, so without this the only feedback is a row quietly
 * appearing further down the page.
 */
export function ResultToast({
  toast,
  avatars,
  onDismiss,
}: {
  toast: ResultToastData;
  avatars: AvatarMap;
  onDismiss: () => void;
}) {
  const names = toast.winners.map((player) => player.name).join(" & ");
  const matchNo = String(toast.matchNumber).padStart(2, "0");

  return (
    <Toast onDismiss={onDismiss}>
      <span className="flex flex-none [&>*+*]:-ml-2">
        {toast.winners.map((player) => (
          <PlayerAvatar
            key={player.id}
            avatar={avatars.get(player.id) ?? UNKNOWN_AVATAR}
            size={24}
            name={player.name}
            className="border-2 border-white"
          />
        ))}
      </span>
      <span className="text-[13px] text-muted">
        <b className="font-semibold text-ink">{names} menang</b> · Match{" "}
        {matchNo}
        {toast.ratingUp && " · rating naik"}
      </span>
    </Toast>
  );
}
