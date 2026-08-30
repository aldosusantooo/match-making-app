"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions";
import { Button } from "@/components/button";
import { BandClose, HeaderBand } from "@/components/header-band";
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
      <div className="w-full max-w-sm overflow-hidden rounded-t-[18px] bg-surface shadow-lg">
        <HeaderBand
          title="House rules"
          dragHandle
          action={<BandClose onClose={onClose} />}
          className="pt-3 pb-3.5"
        />

        <div className="px-4.5 pt-3.5 pb-4.5">
          <p className="mb-0.5 font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted uppercase">
            Match rules
          </p>
          {RULES.map((rule) => (
            <button
              key={rule.value}
              onClick={() => setGenderRule(rule.value)}
              className="flex w-full items-start gap-[11px] py-2 text-left"
            >
              <span
                className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  genderRule === rule.value ? "border-primary" : "border-line"
                }`}
              >
                {genderRule === rule.value && (
                  <span className="h-[9px] w-[9px] rounded-full bg-primary" />
                )}
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">
                  {rule.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">
                  {rule.hint}
                </span>
              </span>
            </button>
          ))}

          <p className="mt-2 mb-0.5 font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted uppercase">
            Matchmaking
          </p>
          <div className="flex items-start justify-between gap-3 py-2">
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">
                Skill-based matchmaking
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">
                Balances matches by skill. Turn off for casual play.
              </span>
            </span>
            <button
              role="switch"
              aria-checked={skillEnabled}
              onClick={() => setSkillEnabled((v) => !v)}
              className={`relative mt-0.5 h-[19px] w-[34px] shrink-0 rounded-[10px] transition-colors ${
                skillEnabled ? "bg-primary" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 h-[15px] w-[15px] rounded-full bg-white transition-all ${
                  skillEnabled ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <p className="mt-1.5 mb-3.5 text-[10.5px] leading-normal text-muted">
            Fair rotation always comes first — this just decides how sides get
            split.
          </p>

          <Button onClick={onDone} disabled={busy} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
