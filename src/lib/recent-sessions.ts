/**
 * The host's own sessions, remembered in this browser (spec §7.1).
 *
 * There are no accounts, so a session's private link is the only way back
 * into it. localStorage is the one place we can keep that link without
 * asking for anything: it stays on the host's device, and losing it costs
 * them nothing they didn't already have in their WhatsApp history.
 *
 * Only ids are stored durably — name and player count are re-read from the
 * server via `getSessionSummaries`, so a renamed or deleted session can't
 * show stale text.
 */

const KEY = "bisai.sessions";

/** Enough to cover a few weeks of a weekly mabar without unbounded growth. */
const LIMIT = 5;

export interface RecentSession {
  id: string;
  name: string;
  createdAt: string;
}

function isRecentSession(value: unknown): value is RecentSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.createdAt === "string"
  );
}

/**
 * Newest first. Returns [] rather than throwing on anything unexpected:
 * storage can be disabled outright, and the value is user-editable, so
 * neither its presence nor its shape is guaranteed.
 */
export function readRecentSessions(): RecentSession[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecentSession) : [];
  } catch {
    return [];
  }
}

/** Moves an existing id back to the front rather than duplicating it. */
export function rememberSession(entry: RecentSession): void {
  try {
    const next = [
      entry,
      ...readRecentSessions().filter((item) => item.id !== entry.id),
    ].slice(0, LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode, a full quota, or storage disabled. The session is still
    // reachable by its link; this is a convenience, so it fails quietly.
  }
}
