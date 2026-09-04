"use client";

import { useMemo, useState } from "react";
import { confirmMatch, generateDraft } from "@/app/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { RacketIcon } from "@/components/icons";
import type {
  GenerateDraftResponse,
  PlayerDTO,
  SessionDTO,
} from "@/lib/dto";
import { Overlay } from "./overlay";

export function DraftModal({
  session,
  playingIds,
  initial,
  onClose,
}: {
  session: SessionDTO;
  playingIds: Set<string>;
  initial: GenerateDraftResponse;
  onClose: () => void;
}) {
  const [sideA, setSideA] = useState<PlayerDTO[]>(
    initial.ok ? initial.draft.sideA : [],
  );
  const [sideB, setSideB] = useState<PlayerDTO[]>(
    initial.ok ? initial.draft.sideB : [],
  );
  const [conflict, setConflict] = useState(
    !initial.ok && initial.reason === "gender_conflict",
  );
  const [allowMixed, setAllowMixed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftIds = useMemo(
    () => new Set([...sideA, ...sideB].map((p) => p.id)),
    [sideA, sideB],
  );
  // Bench: active players who are neither on court nor already in this draft.
  const bench = session.players.filter(
    (p) =>
      p.status === "active" && !playingIds.has(p.id) && !draftIds.has(p.id),
  );

  async function regenerate(withMixed = allowMixed) {
    setBusy(true);
    setError(null);
    try {
      const result = await generateDraft(session.id, withMixed);
      if (result.ok) {
        setSideA(result.draft.sideA);
        setSideB(result.draft.sideB);
        setConflict(false);
        setAllowMixed(withMixed);
      } else if (result.reason === "gender_conflict") {
        setConflict(true);
      } else if (result.reason === "not_enough_players") {
        setError(
          `Not enough available players — need ${result.required}, have ${result.available}.`,
        );
      } else {
        setError(result.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const result = await confirmMatch(
        session.id,
        sideA.map((p) => p.id),
        sideB.map((p) => p.id),
      );
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    } finally {
      setBusy(false);
    }
  }

  const swapIn = (side: "A" | "B", index: number, replacement: PlayerDTO) => {
    const setter = side === "A" ? setSideA : setSideB;
    setter((prev) => prev.map((p, i) => (i === index ? replacement : p)));
  };

  const hasDraft = sideA.length > 0;

  const tagClass =
    "rounded-full bg-secondary-bg px-2.5 py-1 text-[12px] font-medium text-secondary";

  return (
    <Overlay onClose={onClose} title="New match">
      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {session.skillMatchmakingEnabled && (
          <span className={tagClass}>
            {session.players.some(
              (p) => p.status === "active" && p.skillTier !== "unknown",
            )
              ? "Balanced by skill"
              : "Balanced by rotation"}
          </span>
        )}
        <span className={tagClass}>Fresh pairing</span>
        {allowMixed && session.genderRule === "same_gender_only" && (
          <span className="rounded-full bg-warn-bg px-2.5 py-1 text-[12px] font-medium text-warn">
            Mixed allowed
          </span>
        )}
      </div>

      {hasDraft && (
        <>
          <SideBox
            label="Side A"
            players={sideA}
            bench={bench}
            onSwap={(i, p) => swapIn("A", i, p)}
          />
          <NetDivider />
          <SideBox
            label="Side B"
            players={sideB}
            bench={bench}
            onSwap={(i, p) => swapIn("B", i, p)}
          />
        </>
      )}

      {conflict && (
        <div className="mt-3 rounded-lg bg-warn-bg px-3 py-2.5">
          <p className="mb-2 text-xs leading-relaxed text-warn">
            Not enough players to keep sides same-gender.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-btn-sm border-[1.5px] border-warn px-2.5 py-2 text-center text-[13px] font-semibold text-warn"
            >
              Cancel
            </button>
            <button
              onClick={() => regenerate(true)}
              disabled={busy}
              className="flex-1 rounded-btn-sm bg-warn px-2.5 py-2 text-center text-[13px] font-semibold text-white disabled:opacity-50"
            >
              Go mixed
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-warn">{error}</p>}

      {hasDraft && (
        <div className="mt-3.5 flex gap-2">
          <Button
            variant="outline"
            onClick={() => regenerate()}
            disabled={busy}
            className="flex-1"
          >
            Reshuffle
          </Button>
          <Button onClick={onConfirm} disabled={busy} className="flex-1">
            Start match
          </Button>
        </div>
      )}
    </Overlay>
  );
}

function NetDivider() {
  return (
    <div className="my-2.5 flex items-center gap-2">
      <span
        className="h-1.5 flex-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line) 0 2px, transparent 2px 7px)",
        }}
      />
      <span className="font-mono text-[10.5px] font-semibold text-secondary">
        VS
      </span>
      <span
        className="h-1.5 flex-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line) 0 2px, transparent 2px 7px)",
        }}
      />
    </div>
  );
}

function SideBox({
  label,
  players,
  bench,
  onSwap,
}: {
  label: string;
  players: PlayerDTO[];
  bench: PlayerDTO[];
  onSwap: (index: number, replacement: PlayerDTO) => void;
}) {
  return (
    <Card className="px-3.5 py-1.5">
      <p className="pt-1.5 pb-0.5 font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
        {label}
      </p>
      {players.map((player, i) => (
        <div
          key={player.id}
          className="flex items-center justify-between border-b border-line py-2 last:border-b-0"
        >
          <span className="text-[13.5px] font-semibold">{player.name}</span>
          {bench.length > 0 ? (
            <span className="flex items-center gap-1 text-muted">
              <RacketIcon />
              <select
                value=""
                onChange={(e) => {
                  const replacement = bench.find(
                    (p) => p.id === e.target.value,
                  );
                  if (replacement) {
                    onSwap(i, replacement);
                  }
                }}
                className="appearance-none bg-transparent text-[11.5px] text-muted outline-none"
              >
                <option value="">swap</option>
                {bench.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11.5px] text-muted/50">
              <RacketIcon />
              swap
            </span>
          )}
        </div>
      ))}
    </Card>
  );
}
