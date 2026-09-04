"use client";

import { useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { LiveMatchCard } from "@/components/live-match-card";
import { SectionHeader } from "@/components/section-header";
import { SessionTitle } from "@/components/session-title";
import { StatusBadge } from "@/components/status-badge";
import { buildAvatarMap } from "@/lib/avatar";
import type { GenerateDraftResponse, MatchDTO, SessionDTO } from "@/lib/dto";
import { useNow } from "@/lib/use-now";
import { DraftModal } from "./draft-modal";
import { OptionsSheet } from "./options-sheet";
import { PlayerSection } from "./player-section";
import { ScoreModal } from "./score-modal";

type Modal =
  | { type: "draft"; initial: GenerateDraftResponse }
  | { type: "score"; match: MatchDTO }
  | { type: "options" }
  | null;

export function SessionView({
  session,
  dateLabel,
}: {
  session: SessionDTO;
  dateLabel: string;
}) {
  const [modal, setModal] = useState<Modal>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const now = useNow();

  // Built from the whole roster in creation order so a player's colour and
  // initials are the same on the court, in the roster and in finished rows.
  const avatars = useMemo(
    () => buildAvatarMap(session.players),
    [session.players],
  );

  const liveMatches = useMemo(
    () => session.matches.filter((m) => m.status === "pending"),
    [session.matches],
  );
  const finishedMatches = useMemo(
    () => session.matches.filter((m) => m.status === "completed"),
    [session.matches],
  );

  // Courts are numbered by how long they've been running — the oldest live
  // match is Court 1 — while the cards themselves stack newest first.
  const courtNumbers = useMemo(() => {
    const numbers = new Map<string, number>();
    [...liveMatches]
      .sort((a, b) => a.matchNumber - b.matchNumber)
      .forEach((match, index) => numbers.set(match.id, index + 1));
    return numbers;
  }, [liveMatches]);

  const playingIds = useMemo(
    () =>
      new Set(
        liveMatches.flatMap((m) => [...m.sideA, ...m.sideB].map((p) => p.id)),
      ),
    [liveMatches],
  );

  async function onCreateMatch() {
    setCreating(true);
    setCreateError(null);
    try {
      const initial = await generateDraft(session.id);
      if (!initial.ok && initial.reason === "not_enough_players") {
        setCreateError(
          `Not enough available players — need ${initial.required}, have ${initial.available}.`,
        );
      } else if (!initial.ok && initial.reason === "error") {
        setCreateError(initial.message);
      } else {
        setModal({ type: "draft", initial });
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] pb-28">
      <AppHeader
        menuItems={[
          {
            label: "House rules",
            onSelect: () => setModal({ type: "options" }),
          },
        ]}
      />
      <SessionTitle
        name={session.name}
        dateLabel={dateLabel}
        playerCount={session.players.length}
        matchesPlayed={finishedMatches.length}
      />

      {/* No live match hides the section outright rather than showing an
          empty box (spec §2). */}
      {liveMatches.length > 0 && (
        <section>
          <SectionHeader
            label="On court"
            action={
              liveMatches.length === 1
                ? "Court 1"
                : `${liveMatches.length} courts`
            }
          />
          <div className="flex flex-col gap-3">
            {liveMatches.map((match) => (
              <LiveMatchCard
                key={match.id}
                match={match}
                avatars={avatars}
                now={now}
                courtLabel={
                  liveMatches.length > 1
                    ? `Court ${courtNumbers.get(match.id)}`
                    : null
                }
                onRecordResult={() => setModal({ type: "score", match })}
              />
            ))}
          </div>
        </section>
      )}

      <div className="px-4 pt-4">
        <PlayerSection
          key={session.matches.length > 0 ? "has-matches" : "no-matches"}
          session={session}
          playingIds={playingIds}
          collapsedByDefault={session.matches.length > 0}
        />

        {finishedMatches.length > 0 && (
          <section className="mt-5">
            <div className="-mx-4">
              <SectionHeader label={`Finished · ${finishedMatches.length}`} />
            </div>
            <ul className="flex flex-col gap-2.5">
              {finishedMatches.map((match) => (
                <FinishedCard key={match.id} match={match} />
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px] bg-bg/95 px-4 pt-2 pb-5 backdrop-blur">
        {createError && (
          <p className="mb-2 rounded-lg bg-warn-bg px-3 py-2 text-xs text-warn">
            {createError}
          </p>
        )}
        <Button onClick={onCreateMatch} disabled={creating} className="w-full">
          {creating ? "Preparing draft…" : "Create match"}
        </Button>
      </div>

      {modal?.type === "draft" && (
        <DraftModal
          session={session}
          playingIds={playingIds}
          initial={modal.initial}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "score" && (
        <ScoreModal match={modal.match} onClose={() => setModal(null)} />
      )}
      {modal?.type === "options" && (
        <OptionsSheet session={session} onClose={() => setModal(null)} />
      )}
    </main>
  );
}

/** Interim finished-match card — replaced by FinishedMatchRow in step 5. */
function FinishedCard({ match }: { match: MatchDTO }) {
  const names = (side: { name: string }[]) =>
    side.map((p) => p.name).join(" & ");
  const winnerNames = names(match.winningSide === "A" ? match.sideA : match.sideB);

  return (
    <li>
      <Card variant="record" accent="muted" className="p-3.5">
        <div className="flex items-center justify-between">
          <StatusBadge label="Final" tone="muted" />
          <span className="font-mono text-[10px] text-muted uppercase">
            Match {String(match.matchNumber).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-2.5 text-[13.5px] font-semibold">
          {names(match.sideA)} vs {names(match.sideB)}
        </p>
        <p className="mt-1 text-xs text-primary">
          {winnerNames} won{match.score ? ` · ${match.score}` : ""}
        </p>
      </Card>
    </li>
  );
}
