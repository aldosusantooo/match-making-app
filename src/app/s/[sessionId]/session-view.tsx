"use client";

import { useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import type { GenerateDraftResponse, MatchDTO, SessionDTO } from "@/lib/dto";
import { DraftModal } from "./draft-modal";
import { OptionsSheet } from "./options-sheet";
import { PlayerSection } from "./player-section";
import { ScoreModal } from "./score-modal";

type Modal =
  | { type: "draft"; initial: GenerateDraftResponse }
  | { type: "score"; match: MatchDTO }
  | { type: "options" }
  | null;

export function SessionView({ session }: { session: SessionDTO }) {
  const [modal, setModal] = useState<Modal>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const playingIds = useMemo(
    () =>
      new Set(
        session.matches
          .filter((m) => m.status === "pending")
          .flatMap((m) => [...m.sideA, ...m.sideB].map((p) => p.id)),
      ),
    [session.matches],
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

  const dateLabel = new Date(session.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return (
    <main className="mx-auto w-full max-w-sm px-4 pt-6 pb-28">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">{session.name}</h1>
          <p className="text-xs text-ink-muted">
            {dateLabel} · {session.players.length} player
            {session.players.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "options" })}
          className="rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-muted"
        >
          Options
        </button>
      </header>

      {/* Remount when the first match appears so the list collapses then, not
          just on the next page load. */}
      <PlayerSection
        key={session.matches.length > 0 ? "has-matches" : "no-matches"}
        session={session}
        playingIds={playingIds}
        collapsedByDefault={session.matches.length > 0}
      />

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-ink-muted">Matches</h2>
        {session.matches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-5 text-center text-xs text-ink-muted">
            No matches yet
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {session.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onOpen={() => setModal({ type: "score", match })}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-sm bg-bg/95 px-4 pt-2 pb-5 backdrop-blur">
        {createError && (
          <p className="mb-2 rounded-lg border border-warn bg-warn-bg px-3 py-2 text-xs text-warn">
            {createError}
          </p>
        )}
        <button
          onClick={onCreateMatch}
          disabled={creating}
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white active:opacity-80 disabled:opacity-50"
        >
          {creating ? "Preparing draft…" : "Create match"}
        </button>
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

function MatchCard({ match, onOpen }: { match: MatchDTO; onOpen: () => void }) {
  const names = (side: { name: string }[]) =>
    side.map((p) => p.name).join(", ");
  const completed = match.status === "completed";
  const winnerNames =
    match.winningSide === "A" ? names(match.sideA) : names(match.sideB);

  return (
    <li>
      <button
        onClick={completed ? undefined : onOpen}
        disabled={completed}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-card px-3 py-2.5 text-left disabled:cursor-default"
      >
        <span>
          <span className="block text-sm font-semibold">
            Match {match.matchNumber}
          </span>
          <span className="block text-xs text-ink-muted">
            {names(match.sideA)} vs {names(match.sideB)}
          </span>
          {completed && (
            <span className="block text-xs text-accent">
              {winnerNames} won{match.score ? ` · ${match.score}` : ""}
            </span>
          )}
        </span>
        <span
          className={
            completed
              ? "rounded-md bg-accent-bg px-2 py-0.5 text-[11px] text-accent"
              : "rounded-md bg-warn-bg px-2 py-0.5 text-[11px] text-warn"
          }
        >
          {completed ? "Done" : "In progress"}
        </span>
      </button>
    </li>
  );
}
