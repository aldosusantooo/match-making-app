"use client";

import { useEffect } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import type { AvatarMap } from "@/lib/avatar";
import { UNKNOWN_AVATAR } from "@/lib/avatar";
import type { MatchSidePlayerDTO } from "@/lib/dto";

/** How long the toast stays up before dismissing itself (spec §7.3). */
const DURATION_MS = 4000;

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
 *
 * Sits above the sticky "Create match" button rather than over it — that
 * button is the next thing the host reaches for.
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
  useEffect(() => {
    const timer = setTimeout(onDismiss, DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const names = toast.winners.map((player) => player.name).join(" & ");
  const matchNo = String(toast.matchNumber).padStart(2, "0");

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      // Clears the sticky CTA (its own 22px inset plus a ~54px button) with
      // 12px to spare. Set here rather than as an arbitrary Tailwind value:
      // calc() needs real whitespace around the +, which the class syntax
      // would have to escape.
      style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="pointer-events-auto flex max-w-[430px] items-center gap-2.5 rounded-[14px] border border-[rgba(23,35,28,0.06)] bg-surface px-3 py-2.5 text-left shadow-float motion-safe:animate-toast-in"
      >
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
      </button>
    </div>
  );
}
