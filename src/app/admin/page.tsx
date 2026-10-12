import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BisaiMark } from "@/components/icons";
import { isAdminAuthorized } from "@/lib/admin-auth";
import type { FunnelStep } from "@/lib/admin-metrics";
import {
  CHART_DAYS,
  type Comparison,
  type RecentSession,
  getAdminStats,
} from "@/lib/admin-stats";
import { DailyChart } from "./daily-chart";
import {
  formatAgo,
  formatCount,
  formatWibDateTime,
  formatWibTime,
} from "./format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Proxy has already asked for the password; checking again where the data
  // is read means a matcher change can't quietly expose it.
  if (!isAdminAuthorized((await headers()).get("authorization"))) {
    notFound();
  }

  const now = new Date();
  const stats = await getAdminStats(now);
  const windowTotal = stats.sessionsPerDay.reduce((sum, d) => sum + d.count, 0);

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 pt-5 pb-16 wide:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BisaiMark size={26} />
          <h1 className="font-display text-[22px] font-bold">Admin</h1>
        </div>
        <p className="text-[12px] text-muted">
          Updated {formatWibTime(now)} WIB · reload to refresh
        </p>
      </header>

      <section className="mt-5">
        <div className="grid grid-cols-2 gap-3 wide:grid-cols-4">
          <StatTile
            label="Live now"
            value={stats.liveNow}
            note="Sessions with activity in the last hour"
          />
          <StatTile
            label="Sessions, last 7 days"
            value={stats.lastWeek.sessions.current}
            note={<Delta {...stats.lastWeek.sessions} />}
          />
          <StatTile
            label="Matches played, last 7 days"
            value={stats.lastWeek.matches.current}
            note={<Delta {...stats.lastWeek.matches} />}
          />
          <StatTile
            label="Players added, last 7 days"
            value={stats.lastWeek.players.current}
            note={<Delta {...stats.lastWeek.players} />}
          />
        </div>
        <p className="mt-2.5 text-[12px] text-muted">
          All time: {formatCount(stats.allTime.sessions)} sessions ·{" "}
          {formatCount(stats.allTime.players)} players ·{" "}
          {formatCount(stats.allTime.matches)} matches played. Visitors and
          where they came from are in{" "}
          <a
            href="https://cloud.umami.is"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-green"
          >
            Umami ↗
          </a>
        </p>
      </section>

      <div className="mt-4 grid gap-4 wide:grid-cols-[3fr_2fr]">
        <Panel
          title="Sessions created per day"
          subtitle={`${formatCount(windowTotal)} in the last ${CHART_DAYS} days, WIB`}
        >
          <DailyChart days={stats.sessionsPerDay} />
        </Panel>

        <Panel
          title="How far sessions get"
          subtitle={`Sessions created in the last ${CHART_DAYS} days`}
        >
          <Funnel steps={stats.funnel} />
        </Panel>
      </div>

      <Panel
        className="mt-4"
        title="Recent sessions"
        subtitle={`Newest ${stats.recent.length}. Live means activity in the last hour.`}
        flush
      >
        <RecentList sessions={stats.recent} now={now} />
      </Panel>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  className,
  flush = false,
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  /** Children run edge to edge, for lists with their own row padding. */
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={[
        "rounded-list border border-line bg-surface shadow-list",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>
      </div>
      <div className={flush ? "" : "px-4 pb-4"}>{children}</div>
    </section>
  );
}

function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: ReactNode;
}) {
  return (
    <div className="rounded-list border border-line bg-surface px-4 py-3.5 shadow-list">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-[28px] leading-none font-semibold text-ink">
        {formatCount(value)}
      </p>
      <p className="mt-2 text-[11.5px] leading-snug">{note}</p>
    </div>
  );
}

/** Change against the 7 days before. Up is good for every tile here. */
function Delta({ current, previous }: Comparison) {
  const diff = current - previous;
  if (diff === 0) {
    return <span className="text-muted">Same as the 7 days before</span>;
  }
  return diff > 0 ? (
    <span className="text-green">▲ {diff} vs the 7 days before</span>
  ) : (
    <span className="text-warn">▼ {-diff} vs the 7 days before</span>
  );
}

function Funnel({ steps }: { steps: FunnelStep[] }) {
  const created = steps[0].count;
  return (
    <ol className="grid gap-3.5">
      {steps.map((step) => {
        const share = created === 0 ? 0 : step.count / created;
        return (
          <li key={step.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-ink">{step.label}</span>
              <span className="text-muted tabular-nums">
                <b className="font-semibold text-ink">{step.count}</b> ·{" "}
                {Math.round(share * 100)}%
              </span>
            </div>
            <div
              className="h-2.5 rounded-r-[4px] bg-green"
              style={{ width: `${share * 100}%` }}
            />
          </li>
        );
      })}
    </ol>
  );
}

function RecentList({
  sessions,
  now,
}: {
  sessions: RecentSession[];
  now: Date;
}) {
  if (sessions.length === 0) {
    return (
      <p className="px-4 pb-4 text-[13px] text-muted">No sessions yet.</p>
    );
  }
  return (
    <ul>
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex items-start justify-between gap-3 border-t border-line px-4 py-3"
        >
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2">
              {session.live && <LiveBadge />}
              <a
                href={`/s/${session.id}`}
                target="_blank"
                rel="noreferrer"
                className="truncate text-[14.5px] font-semibold text-ink hover:text-green"
              >
                {session.name}
              </a>
            </p>
            <p className="mt-0.5 truncate text-[12px] text-muted">
              by {session.hostName} · {formatWibDateTime(session.createdAt)}
            </p>
          </div>
          <div className="flex-none text-right text-[12px] text-muted tabular-nums">
            <p>
              <b className="font-semibold text-ink">{session.players}</b>{" "}
              players · <b className="font-semibold text-ink">{session.matchesPlayed}</b>{" "}
              played
            </p>
            <p className="mt-0.5">active {formatAgo(session.lastActivityAt, now)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex flex-none items-center gap-1 rounded-full bg-live-soft px-2 py-0.5 text-[11px] font-semibold text-live-text">
      <span className="h-1.5 w-1.5 rounded-full bg-live" />
      Live
    </span>
  );
}
