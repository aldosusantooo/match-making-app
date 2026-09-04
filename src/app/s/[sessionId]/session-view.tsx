"use client";

import { useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/button";
import { LiveMatchCard } from "@/components/live-match-card";
import { SectionHeader } from "@/components/section-header";
import { FINISHED_PREVIEW_COUNT, FinishedList } from "@/components/finished-list";
import { HintLine } from "@/components/hint-line";
import { SessionTitle } from "@/components/session-title";
import { buildAvatarMap } from "@/lib/avatar";
import type { GenerateDraftResponse, MatchDTO, SessionDTO } from "@/lib/dto";
import { deriveNextUp } from "@/lib/next-up";
import { useNow } from "@/lib/use-now";
import { DraftModal } from "./draft-modal";
import { OptionsSheet } from "./options-sheet";
import { RosterSection } from "./roster-section";
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
  const [showAllFinished, setShowAllFinished] = useState(false);
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

  const nextUp = useMemo(
    () => deriveNextUp(session, playingIds),
    [session, playingIds],
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

      <section>
        <SectionHeader
          label={`Waiting · ${nextUp.roster.length}`}
          action="Next up"
        />
        <RosterSection
          sessionId={session.id}
          roster={nextUp.roster}
          avatars={avatars}
          now={now}
        />
        <HintLine nextUp={nextUp} />
      </section>

      {/* Hidden entirely when nothing has finished yet (spec §2). */}
      {finishedMatches.length > 0 && (
        <section>
          <SectionHeader
            label={`Finished · ${finishedMatches.length}`}
            action={
              finishedMatches.length > FINISHED_PREVIEW_COUNT &&
              !showAllFinished ? (
                <button type="button" onClick={() => setShowAllFinished(true)}>
                  Show all
                </button>
              ) : null
            }
          />
          <FinishedList
            matches={finishedMatches}
            avatars={avatars}
            mounted={now !== null}
            showAll={showAllFinished}
            onToggleShowAll={() => setShowAllFinished((value) => !value)}
          />
        </section>
      )}

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
