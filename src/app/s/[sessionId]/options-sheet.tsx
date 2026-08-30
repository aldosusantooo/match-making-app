"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions";
import type { SessionDTO } from "@/lib/dto";
import type { GenderRule } from "@/lib/engine/types";

const RULES: { value: GenderRule; label: string; hint: string }[] = [
  {
    value: "mixed",
    label: "Mixed doubles allowed",
    hint: "Any gender combination",
  },
  {
    value: "same_gender_only",
    label: "Same gender only",
    hint: "Doubles pairs must match gender",
  },
  {
    value: "singles_only",
    label: "Singles only",
    hint: "1 vs 1 matches",
  },
];

export function OptionsSheet({
  session,
  onClose,
}: {
  session: SessionDTO;
  onClose: () => void;
}) {
  const [genderRule, setGenderRule] = useState<GenderRule>(session.genderRule);
  const [skillEnabled, setSkillEnabled] = useState(
    session.skillMatchmakingEnabled,
  );
  const [busy, setBusy] = useState(false);

  async function onDone() {
    setBusy(true);
    try {
      await updateSettings(session.id, {
        genderRule,
        skillMatchmakingEnabled: skillEnabled,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25">
      <div className="w-full max-w-sm rounded-t-2xl bg-card px-4 pt-3 pb-6 shadow-lg">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-strong" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Options</h2>
          <button onClick={onClose} aria-label="Close" className="px-1 text-ink-muted">
            ✕
          </button>
        </div>

        <p className="mb-1 text-sm font-semibold text-ink-muted">Match rules</p>
        {RULES.map((rule) => (
          <button
            key={rule.value}
            onClick={() => setGenderRule(rule.value)}
            className="flex w-full items-center gap-2.5 py-2 text-left"
          >
            <span
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                genderRule === rule.value ? "border-accent" : "border-line-strong"
              }`}
            >
              {genderRule === rule.value && (
                <span className="h-2 w-2 rounded-full bg-accent" />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold">{rule.label}</span>
              <span className="block text-[11px] text-ink-muted">{rule.hint}</span>
            </span>
          </button>
        ))}

        <p className="mt-3 mb-1 text-sm font-semibold text-ink-muted">
          Matchmaking
        </p>
        <div className="flex items-center justify-between py-2">
          <span className="pr-3">
            <span className="block text-sm font-semibold">
              Skill-based matchmaking
            </span>
            <span className="block text-[11px] text-ink-muted">
              Balances matches by skill. Turn off for casual play.
            </span>
          </span>
          <button
            role="switch"
            aria-checked={skillEnabled}
            onClick={() => setSkillEnabled((v) => !v)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              skillEnabled ? "bg-accent" : "bg-line-strong"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                skillEnabled ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <p className="mt-2 mb-3 text-[11px] text-ink-muted">
          Rotation order (who plays next) always applies, regardless of these
          settings.
        </p>

        <button
          onClick={onDone}
          disabled={busy}
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}
