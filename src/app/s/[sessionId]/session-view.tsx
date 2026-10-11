"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import { AppHeader } from "@/components/app-header";
import { LiveMatchCard } from "@/components/live-match-card";
import { SectionHeader } from "@/components/section-header";
import { FINISHED_PREVIEW_COUNT, FinishedList } from "@/components/finished-list";
import { HintLine } from "@/components/hint-line";
import { CheckIcon } from "@/components/icons";
import { SessionTitle } from "@/components/session-title";
import { StickyCta } from "@/components/sticky-cta";
import { track } from "@/lib/analytics";
import { buildAvatarMap } from "@/lib/avatar";
import type { GenerateDraftResponse, MatchDTO, SessionDTO } from "@/lib/dto";
import { deriveNextUp } from "@/lib/next-up";
import { useNow } from "@/lib/use-now";
import { DraftModal } from "./draft-modal";
import { OptionsSheet } from "./options-sheet";
import { RememberSession } from "./remember-session";
import type { ResultToastData } from "./result-toast";
import { ResultToast } from "./result-toast";
import { RosterSection } from "./roster-section";
import { ScoreModal } from "./score-modal";
import { shareSessionLink } from "./share-link";
import { Toast } from "./toast";

const HINT_ID = "next-match-hint";

type Modal =
  | { type: "draft"; initial: GenerateDraftResponse }
  | { type: "score"; match: MatchDTO }
  | { type: "options" }
  | null;

/** One toast slot: a newer toast replaces whatever is showing. */
type ToastState =
  | { type: "result"; data: ResultToastData }
  // `at` keys the toast, so copying again restarts its timer.
  | { type: "copied"; at: number }
  | null;

export function SessionView({
  session,
  dateLabel,
}: {
  session: SessionDTO;
  dateLabel: string;
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
  const [toast, setToast] = useState<ToastState>(null);
  const now = useNow();

  const router = useRouter();
  const pathname = usePathname();
  const isNewSession = useSearchParams().get("new") === "1";

  // `createSession` lands here with ?new=1, the one reliable sign a session
  // was just created. Count it, then drop the flag so a refresh doesn't count
  // it twice and the host can't copy a ?new=1 link out of the address bar.
  useEffect(() => {
    if (isNewSession) {
      track("session-created");
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
      <RememberSession
        id={session.id}
        name={session.name}
        createdAt={session.createdAt}
      />
      <AppHeader
        menuItems={[
          {
            label: "Bagikan link",
            onSelect: async () => {
              if ((await shareSessionLink(session.name)) === "copied") {
                setToast({ type: "copied", at: Date.now() });
              }
            },
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

      {toast?.type === "result" && (
        <ResultToast
          // Keyed so a second result restarts the animation and the timer
          // instead of inheriting the first toast's remaining time.
          key={toast.data.matchNumber}
          toast={toast.data}
          avatars={avatars}
          onDismiss={() => setToast(null)}
        />
      )}
      {toast?.type === "copied" && (
        <Toast key={toast.at} onDismiss={() => setToast(null)}>
          <span className="text-green">
            <CheckIcon size={14} />
          </span>
          <span className="text-[13px] font-semibold text-ink">
            Link disalin
          </span>
        </Toast>
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
        <ScoreModal
          match={modal.match}
          onClose={() => setModal(null)}
          onSaved={(winningSide, ratingUp) =>
            setToast({
              type: "result",
              data: {
                winners:
                  winningSide === "A" ? modal.match.sideA : modal.match.sideB,
                matchNumber: modal.match.matchNumber,
                ratingUp,
              },
            })
          }
        />
      )}
      {modal?.type === "options" && (
        <OptionsSheet session={session} onClose={() => setModal(null)} />
      )}
    </main>
  );
}
