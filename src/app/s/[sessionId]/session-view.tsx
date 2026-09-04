"use client";

import { useMemo, useState } from "react";
import { generateDraft } from "@/app/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { BandButton, HeaderBand } from "@/components/header-band";
import { StatusBadge } from "@/components/status-badge";
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
    <main className="mx-auto w-full max-w-sm pb-28">
      <HeaderBand
        title={session.name}
        subtitle={`${dateLabel} · ${session.players.length} player${
          session.players.length === 1 ? "" : "s"
        }`}
        action={
          <BandButton onClick={() => setModal({ type: "options" })}>
            House rules
          </BandButton>
        }
      />

      <div className="px-4 pt-4">
        {/* Remount when the first match appears so the list collapses then, not
            just on the next page load. */}
        <PlayerSection
          key={session.matches.length > 0 ? "has-matches" : "no-matches"}
          session={session}
          playingIds={playingIds}
          collapsedByDefault={session.matches.length > 0}
        />

        <section className="relative z-[1] mt-5">
          <h2 className="mb-2 font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted uppercase">
            Matches
          </h2>
          {session.matches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line py-5 text-center text-xs text-muted">
              No one&apos;s on court yet
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {session.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEnterResult={() => setModal({ type: "score", match })}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-sm bg-bg/95 px-4 pt-2 pb-5 backdrop-blur">
        {createError && (
          <p className="mb-2 rounded-lg bg-warn-bg px-3 py-2 text-xs text-warn">
            {createError}
          </p>
        )}
        <Button
          onClick={onCreateMatch}
          disabled={creating}
          className="w-full"
        >
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

function matchupLine(match: MatchDTO): string {
  const names = (side: { name: string }[]) =>
    side.map((p) => p.name).join(" & ");
  return `${names(match.sideA)} vs ${names(match.sideB)}`;
}

function MatchCard({
  match,
  onEnterResult,
}: {
  match: MatchDTO;
  onEnterResult: () => void;
}) {
  const matchNo = `Match ${String(match.matchNumber).padStart(2, "0")}`;

  if (match.status === "pending") {
    return (
      <li>
        <Card variant="record" className="p-3.5">
          <StatusBadge label="On court" />
          <p className="mt-2.5 mb-3 text-[13.5px] font-semibold">
            {matchupLine(match)}
          </p>
          <Button variant="outline" size="sm" onClick={onEnterResult}>
            Who won?
          </Button>
        </Card>
      </li>
    );
  }

  const winnerNames = (
    match.winningSide === "A" ? match.sideA : match.sideB
  )
    .map((p) => p.name)
    .join(", ");

  return (
    <li>
      <Card variant="record" accent="muted" className="p-3.5">
        <div className="flex items-center justify-between">
          <StatusBadge label="Final" tone="muted" />
          <span className="font-mono text-[10px] text-muted uppercase">
            {matchNo}
          </span>
        </div>
        <p className="mt-2.5 text-[13.5px] font-semibold">
          {matchupLine(match)}
        </p>
        <p className="mt-1 text-xs text-primary">
          {winnerNames} won{match.score ? ` · ${match.score}` : ""}
        </p>
      </Card>
    </li>
  );
}
