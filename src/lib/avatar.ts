/**
 * Per-player avatar colour and initials (visual spec §5).
 *
 * Colour is `palette[indexInSession % 8]`. That needs no schema change and is
 * stable for the life of a session: players are always read back ordered by
 * `createdAt asc` and there is no delete path, so a player's index never
 * moves. It also beats hashing `player.id` on the axis that matters here —
 * the first eight players are guaranteed eight distinct colours, where a hash
 * collides early and often on a small roster.
 *
 * Build the map once per render from the full session roster and pass it to
 * the court, the roster and the finished rows, so the same player is
 * guaranteed the same colour and initials everywhere on screen.
 */

/** Tailwind classes, written out in full so the scanner can see them. */
const PALETTE = [
  "bg-a1",
  "bg-a2",
  "bg-a3",
  "bg-a4",
  "bg-a5",
  "bg-a6",
  "bg-a7",
  "bg-a8",
] as const;

export interface Avatar {
  /** Background colour utility class. */
  colorClass: string;
  /** Two uppercase letters. */
  initials: string;
}

export type AvatarMap = ReadonlyMap<string, Avatar>;

const letters = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Candidate initials in preference order: first two letters of the first
 * word, then first letters of the first two words, then first + third letter.
 */
function candidates(name: string): string[] {
  const words = name.trim().split(/\s+/).map(letters).filter(Boolean);
  const first = words[0] ?? "";
  const second = words[1] ?? "";
  const out: string[] = [];

  if (first.length >= 2) {
    out.push(first.slice(0, 2));
  }
  if (first && second) {
    out.push(first[0] + second[0]);
  }
  if (first.length >= 3) {
    out.push(first[0] + first[2]);
  }
  if (first) {
    out.push(first[0]);
  }
  return out.map((c) => c.toUpperCase());
}

/**
 * @param players session roster in creation order.
 */
export function buildAvatarMap(
  players: readonly { id: string; name: string }[],
): AvatarMap {
  const map = new Map<string, Avatar>();
  const taken = new Set<string>();

  players.forEach((player, index) => {
    const options = candidates(player.name);
    // Earlier players keep the preferred form; later collisions step down the
    // fallback chain. Past the chain we accept a duplicate rather than
    // inventing letters that aren't in the name.
    const initials =
      options.find((option) => !taken.has(option)) ?? options[0] ?? "?";
    taken.add(initials);
    map.set(player.id, {
      colorClass: PALETTE[index % PALETTE.length],
      initials,
    });
  });

  return map;
}

/** Fallback for a player id missing from the map (shouldn't happen). */
export const UNKNOWN_AVATAR: Avatar = {
  colorClass: "bg-a8",
  initials: "?",
};
