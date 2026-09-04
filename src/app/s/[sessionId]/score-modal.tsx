"use client";

import { useState } from "react";
import { submitResult } from "@/app/actions";
import { Button } from "@/components/button";
import type { MatchDTO } from "@/lib/dto";
import type { Side } from "@/lib/engine/types";
import { Overlay } from "./overlay";

export function ScoreModal({
  match,
  onClose,
}: {
  match: MatchDTO;
  onClose: () => void;
}) {
  const [winner, setWinner] = useState<Side | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
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
      const score =
        scoreA.trim() && scoreB.trim()
          ? `${scoreA.trim()}-${scoreB.trim()}`
          : undefined;
      const result = await submitResult(match.id, winner, score);
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay
      title={`Match ${String(match.matchNumber).padStart(2, "0")} result`}
      onClose={onClose}
    >
      <p className="mb-4 text-center text-[12.5px] text-muted">
        {nameA} vs {nameB}
      </p>

      <div className="flex flex-col gap-2">
        <WinRow
          label={`${nameA} won`}
          selected={winner === "A"}
          onSelect={() => setWinner("A")}
        />
        <WinRow
          label={`${nameB} won`}
          selected={winner === "B"}
          onSelect={() => setWinner("B")}
        />
      </div>

      {showScore ? (
        <div className="mt-4 mb-1">
          <div className="mb-0.5 flex justify-center">
            <span className="w-[70px] truncate text-center text-[12px] font-medium text-muted">
              {nameA}
            </span>
            <span className="w-8" />
            <span className="w-[70px] truncate text-center text-[12px] font-medium text-muted">
              {nameB}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <input
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={2}
              placeholder="21"
              autoFocus
              className="w-[58px] rounded-lg border-[1.5px] border-line bg-surface py-2 text-center font-mono text-[26px] font-bold text-ink outline-none placeholder:text-line focus:border-primary"
            />
            <span className="font-mono text-xl text-muted">–</span>
            <input
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              maxLength={2}
              placeholder="18"
              className="w-[58px] rounded-lg border-[1.5px] border-line bg-surface py-2 text-center font-mono text-[26px] font-bold text-ink outline-none placeholder:text-line focus:border-primary"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowScore(true)}
          className="mt-2.5 px-0.5 text-[13px] font-semibold text-primary"
        >
          Add score (optional)
        </button>
      )}

      {error && <p className="mt-3 text-xs text-warn">{error}</p>}

      <Button
        onClick={onSave}
        disabled={!winner || busy}
        className="mt-4 w-full"
      >
        Save result
      </Button>
    </Overlay>
  );
}

function WinRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg border-[1.5px] px-3.5 py-3 text-left text-[13.5px] font-semibold",
        selected
          ? "border-primary bg-primary-bg text-primary"
          : "border-line bg-surface text-ink",
      ].join(" ")}
    >
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-current">
        {selected && <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
      {label}
    </button>
  );
}
