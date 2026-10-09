/**
 * Visit and funnel stats via Umami Cloud (cookieless, no personal data).
 * Everything here is a no-op unless the deploy sets the website id, so local
 * dev never pollutes the dashboard.
 */

import { APP_NAME } from "./constants";

export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

/** The funnel after the homepage: create → first match → first result. */
export type AnalyticsEvent =
  | "session-created"
  | "match-started"
  | "result-recorded";

declare global {
  interface Window {
    umami?: { track: (event: string) => Promise<void> };
  }
}

/** How long an event waits for the tracker script before it is dropped. */
const TRACKER_WAIT_MS = 5000;
const TRACKER_POLL_MS = 250;

/**
 * Records a custom event. The tracker loads after hydration, so an event
 * fired straight away on a full page load (a session created before the
 * homepage hydrated) waits for it rather than vanishing.
 */
export function track(event: AnalyticsEvent) {
  if (!UMAMI_WEBSITE_ID || typeof window === "undefined") {
    return;
  }
  const deadline = Date.now() + TRACKER_WAIT_MS;
  const send = () => {
    if (window.umami) {
      void window.umami.track(event);
    } else if (Date.now() < deadline) {
      setTimeout(send, TRACKER_POLL_MS);
    }
  };
  send();
}

const SESSION_PATH = /^\/s\/[^/]+/;

/**
 * Session ids are bearer tokens — anyone holding `/s/<id>` can run that
 * session — so they never leave for a third party. Collapsing them also
 * makes every session page one row in the dashboard. `new=1` is the
 * share-sheet flag from `createSession`, not something worth reporting.
 * UTM params pass through untouched.
 *
 * Takes an absolute URL or a same-origin path (how Umami sends referrers
 * from this site) and returns the same shape.
 */
export function scrubUrl(url: string): string {
  const isPath = url.startsWith("/");
  let parsed: URL;
  try {
    parsed = new URL(url, "http://path.invalid");
  } catch {
    return url;
  }
  parsed.pathname = parsed.pathname.replace(SESSION_PATH, "/s/[id]");
  if (parsed.searchParams.has("new")) {
    parsed.searchParams.delete("new");
  }
  return isPath
    ? `${parsed.pathname}${parsed.search}${parsed.hash}`
    : parsed.toString();
}

const isSessionPage = (url: string) => {
  try {
    return SESSION_PATH.test(new URL(url).pathname);
  } catch {
    return false;
  }
};

type Payload = Record<string, unknown>;

/**
 * A new session counts its page twice: once on arrival at `?new=1` and again
 * when SessionView drops the flag with `router.replace`. Two views of the same
 * path this close together are never two real visits.
 */
const DUPLICATE_VIEW_MS = 2000;

/**
 * Umami's `data-before-send` hook: runs on every page view and event just
 * before it is sent. Returning null drops it.
 */
export function createBeforeSend(now: () => number = Date.now) {
  let lastView: { path: string; at: number } | null = null;

  return (_type: string, payload: Payload): Payload | null => {
    const url = typeof payload.url === "string" ? payload.url : "";

    if (payload.name === undefined && url) {
      const path = new URL(url).pathname;
      const at = now();
      const duplicate =
        lastView?.path === path && at - lastView.at < DUPLICATE_VIEW_MS;
      lastView = { path, at };
      if (duplicate) {
        return null;
      }
    }

    const referrer = payload.referrer;
    return {
      ...payload,
      url: url && scrubUrl(url),
      referrer:
        typeof referrer === "string" && referrer.startsWith("/")
          ? scrubUrl(referrer)
          : referrer,
      // Session titles are the host's session name, which often carries
      // people's names. Keep those out too.
      title: isSessionPage(url) ? `Sesi · ${APP_NAME}` : payload.title,
    };
  };
}
