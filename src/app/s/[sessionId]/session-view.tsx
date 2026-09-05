"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { LiveMatchCard } from "@/components/live-match-card";
import { SectionHeader } from "@/components/section-header";
import { FINISHED_PREVIEW_COUNT, FinishedList } from "@/components/finished-list";
import { HintLine } from "@/components/hint-line";
import { SessionTitle } from "@/components/session-title";
import { StickyCta } from "@/components/sticky-cta";
import { buildAvatarMap } from "@/lib/avatar";
import type { GenerateDraftResponse, MatchDTO, SessionDTO } from "@/lib/dto";
import { deriveNextUp } from "@/lib/next-up";
import { useNow } from "@/lib/use-now";
import { DraftModal } from "./draft-modal";
import { OptionsSheet } from "./options-sheet";
import { RosterSection } from "./roster-section";
import { ScoreModal } from "./score-modal";
import { ShareSheet } from "./share-sheet";

const HINT_ID = "next-match-hint";

type Modal =
  | { type: "draft"; initial: GenerateDraftResponse }
  | { type: "score"; match: MatchDTO }
  | { type: "options" }
  | { type: "share" }
  | null;

export function SessionView({
  session,
  dateLabel,
  sessionUrl,
}: {
  session: SessionDTO;
  dateLabel: string;
  /** Absolute link to this page, for the share sheet. */
  sessionUrl: string;
}) {
  const [modal, setModal] = useState<Modal>(null);
  // Keyed to the state it was produced against, so it disappears the moment
  // anything changes rather than lingering the way the old banner did.
  const [createError, setCreateError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [showAllFinished, setShowAllFinished] = useState(false);
  const [shareLatched, setShareLatched] = useState(false);
  const now = useNow();

  const router = useRouter();
  const pathname = usePathname();
  const isNewSession = useSearchParams().get("new") === "1";

  // `createSession` lands here with ?new=1 (spec §7.2). Latching during
  // render rather than in an effect keeps the sheet in the server's HTML —
  // useSearchParams sees the flag during SSR too — so there's no hydration
  // mismatch and no frame without it.
  if (isNewSession && !shareLatched) {
    setShareLatched(true);
    setModal({ type: "share" });
  }

  // Drop the flag as soon as it has been read, so a refresh doesn't reopen
  // the sheet and the host can't copy a ?new=1 link out of the address bar.
  // The latch above keeps the sheet open through the resulting re-render.
  useEffect(() => {
    if (isNewSession) {
      router.replace(pathname, { scroll: false });
    }
  }, [isNewSession, pathname, router]);

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

  const stateKey = `${session.players.length}:${session.matches.length}`;
  const errorMessage =
    createError?.key === stateKey ? createError.message : null;

  const nextUp = useMemo(
    () => deriveNextUp(session, playingIds),
    [session, playingIds],
  );

  async function onCreateMatch() {
    setCreating(true);
    setCreateError(null);
    try {
      const initial = await generateDraft(session.id);
      // The button is disabled unless the pool is big enough, so this only
      // fires when someone else grabbed those players first.
      if (!initial.ok && initial.reason === "not_enough_players") {
        setCreateError({
          key: stateKey,
          message: `Someone else just took those players — ${initial.available} free, need ${initial.required}.`,
        });
      } else if (!initial.ok && initial.reason === "error") {
        setCreateError({ key: stateKey, message: initial.message });
      } else {
        setModal({ type: "draft", initial });
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] pb-[90px]">
      <AppHeader
        menuItems={[
          {
            label: "Bagikan link",
            onSelect: () => setModal({ type: "share" }),
          },
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
        <HintLine nextUp={nextUp} id={HINT_ID} />
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

      {errorMessage && (
        <p role="alert" className="mt-3 px-5 text-[12px] text-warn">
          {errorMessage}
        </p>
      )}

      <StickyCta
        label={creating ? "Preparing draft…" : "Create match"}
        disabled={creating || !nextUp.ready}
        describedBy={HINT_ID}
        onClick={onCreateMatch}
      />

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
      {modal?.type === "share" && (
        <ShareSheet
          sessionName={session.name}
          url={sessionUrl}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}
