import type { NextUp } from "@/lib/next-up";

/**
 * Replaces the old persistent error banner (spec §5). It's derived straight
 * from the current session state on every render, so it can't go stale the
 * way the banner did — there is no dismissal and nothing to clear.
 */
export function HintLine({ nextUp }: { nextUp: NextUp }) {
  if (!nextUp.ready) {
    const { missing } = nextUp;
    return (
      <p className="mt-2 px-5 text-[12px] text-muted">
        Need{" "}
        <b className="font-semibold text-green">
          {missing} more free {missing === 1 ? "player" : "players"}
        </b>{" "}
        for the next match
      </p>
    );
  }

  const lineup = nextUp.free.slice(0, nextUp.matchSize);
  const shown = lineup.slice(0, 3).map((p) => p.name);
  const rest = lineup.length - shown.length;

  return (
    <p className="mt-2 px-5 text-[12px] text-muted">
      Next match ready:{" "}
      <b className="font-semibold text-green">
        {shown.join(", ")}
        {rest > 0 && ` + ${rest} more`}
      </b>
    </p>
  );
}
