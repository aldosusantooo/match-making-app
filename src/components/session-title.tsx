/**
 * The screen's anchor: session name at 30px over a meta line (spec §4.2).
 *
 * `dateLabel` is formatted on the server and passed in — formatting it here
 * would render in the server's timezone during SSR and the browser's after
 * hydration, which differs by a day either side of midnight.
 */
export function SessionTitle({
  name,
  dateLabel,
  playerCount,
  matchesPlayed,
}: {
  name: string;
  dateLabel: string;
  playerCount: number;
  matchesPlayed: number;
}) {
  return (
    <div className="px-5 pt-1.5">
      <h1 className="font-display text-[30px] leading-[1.05] font-bold tracking-[-0.01em]">
        {name}
      </h1>
      <p className="mt-1.5 text-[13px] text-muted">
        {dateLabel} ·{" "}
        <b className="font-semibold text-ink">
          {playerCount} {playerCount === 1 ? "player" : "players"}
        </b>{" "}
        · {matchesPlayed} {matchesPlayed === 1 ? "match" : "matches"} played
      </p>
    </div>
  );
}
