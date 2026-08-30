"use client";

import { useState } from "react";
import { submitResult } from "@/app/actions";
import type { MatchDTO } from "@/lib/dto";
import type { Side } from "@/lib/engine/types";
import { Overlay } from "./draft-modal";

export function ScoreModal({
  match,
  onClose,
}: {
  match: MatchDTO;
  onClose: () => void;
}) {
  const [winner, setWinner] = useState<Side | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameA = match.sideA.map((p) => p.name).join(" & ");
  const nameB = match.sideB.map((p) => p.name).join(" & ");

  async function onSave() {
    if (!winner) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitResult(match.id, winner, score || undefined);
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    } finally {
      setBusy(false);
    }
  }

  const choiceClass = (selected: boolean) =>
    selected
      ? "w-full rounded-lg border-2 border-accent bg-accent-bg px-3 py-2.5 text-left text-sm text-accent"
      : "w-full rounded-lg border border-line-strong bg-card px-3 py-2.5 text-left text-sm";

  return (
    <Overlay title={`Match ${match.matchNumber} result`} onClose={onClose}>
      <p className="mb-4 text-center text-sm text-ink-muted">
        {nameA} vs {nameB}
      </p>
      <div className="flex flex-col gap-2">
        <button className={choiceClass(winner === "A")} onClick={() => setWinner("A")}>
          {nameA} won
        </button>
        <button className={choiceClass(winner === "B")} onClick={() => setWinner("B")}>
          {nameB} won
        </button>
      </div>

      {showScore ? (
        <input
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="e.g. 21-15"
          className="mt-3 w-full rounded-lg border border-line-strong bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setShowScore(true)}
          className="mt-3 text-xs text-ink-muted"
        >
          + Add score (optional)
        </button>
      )}

      {error && <p className="mt-3 text-xs text-warn">{error}</p>}

      <button
        onClick={onSave}
        disabled={!winner || busy}
        className="mt-4 w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        Save result
      </button>
    </Overlay>
  );
}
