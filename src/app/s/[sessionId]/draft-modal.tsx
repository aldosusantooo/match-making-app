"use client";

import { useMemo, useState } from "react";
import { confirmMatch, generateDraft } from "@/app/actions";
import type {
  GenerateDraftResponse,
  PlayerDTO,
  SessionDTO,
} from "@/lib/dto";

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

  const swapIn = (
    side: "A" | "B",
    index: number,
    replacement: PlayerDTO,
  ) => {
    const setter = side === "A" ? setSideA : setSideB;
    setter((prev) => prev.map((p, i) => (i === index ? replacement : p)));
  };

  const hasDraft = sideA.length > 0;

  return (
    <Overlay onClose={onClose} title="New match">
      <div className="mb-3 flex gap-1.5">
        {session.skillMatchmakingEnabled && (
          <span className="rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] text-ink-muted">
            Balanced by skill
          </span>
        )}
        <span className="rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] text-ink-muted">
          Fresh pairing
        </span>
        {allowMixed && session.genderRule === "same_gender_only" && (
          <span className="rounded-md bg-warn-bg px-2 py-0.5 text-[11px] text-warn">
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
          <p className="my-1.5 text-center text-xs text-ink-muted">vs</p>
          <SideBox
            label="Side B"
            players={sideB}
            bench={bench}
            onSwap={(i, p) => swapIn("B", i, p)}
          />
        </>
      )}

      {conflict && (
        <div className="mt-3 rounded-lg border border-warn bg-warn-bg px-3 py-2.5 text-xs text-warn">
          Not enough players for same-gender only.
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => regenerate(true)}
              disabled={busy}
              className="flex-1 rounded-lg border border-warn px-2 py-1.5 disabled:opacity-50"
            >
              Mixed ok
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-warn px-2 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-warn">{error}</p>}

      {hasDraft && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => regenerate()}
            disabled={busy}
            className="flex-1 rounded-lg border border-line-strong px-3 py-2.5 text-sm disabled:opacity-50"
          >
            Regenerate
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Confirm match
          </button>
        </div>
      )}
    </Overlay>
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
    <div className="rounded-lg border border-line px-3 py-2">
      <p className="mb-1 text-[11px] text-ink-muted">{label}</p>
      {players.map((player, i) => (
        <div
          key={player.id}
          className="flex items-center justify-between border-b border-line py-1.5 last:border-b-0"
        >
          <span className="text-sm">{player.name}</span>
          {bench.length > 0 ? (
            <select
              value=""
              onChange={(e) => {
                const replacement = bench.find((p) => p.id === e.target.value);
                if (replacement) {
                  onSwap(i, replacement);
                }
              }}
              className="rounded-md border border-line bg-card px-1.5 py-0.5 text-xs text-ink-muted"
            >
              <option value="">swap</option>
              {bench.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-ink-muted/50">swap</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-card p-4 pb-6 shadow-lg sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="px-1 text-ink-muted"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
