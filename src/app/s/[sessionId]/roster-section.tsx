"use client";

import { useState } from "react";
import { addPlayer, updatePlayer } from "@/app/actions";
import { PlayerAvatar } from "@/components/player-avatar";
import type { AvatarMap } from "@/lib/avatar";
import { UNKNOWN_AVATAR } from "@/lib/avatar";
import type { PlayerDTO } from "@/lib/dto";
import type { Gender, SkillTier } from "@/lib/engine/types";
import { formatWait } from "@/lib/format";
import { waitingSince } from "@/lib/next-up";

const TIERS: { value: SkillTier; label: string; dotClass: string }[] = [
  { value: "beginner", label: "Beginner", dotClass: "bg-tier-beginner" },
  {
    value: "intermediate",
    label: "Intermediate",
    dotClass: "bg-tier-intermediate",
  },
  { value: "advanced", label: "Advanced", dotClass: "bg-tier-advanced" },
  { value: "unknown", label: "Unknown", dotClass: "bg-tier-unknown" },
];

const TIER_BY_VALUE = new Map(TIERS.map((tier) => [tier.value, tier]));

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unspecified", label: "—" },
];

const fieldClass =
  "h-[46px] w-full rounded-btn border border-line bg-surface px-3.5 text-[15px] text-ink outline-none focus:border-green";

export function RosterSection({
  sessionId,
  roster,
  avatars,
  now,
}: {
  sessionId: string;
  /** Everyone off court, already in next-up order with resting last. */
  roster: PlayerDTO[];
  avatars: AvatarMap;
  now: number | null;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="mx-4 overflow-hidden rounded-list border border-[rgba(23,35,28,0.05)] bg-surface shadow-list">
      <ul>
        {roster.map((player) => (
          <li
            key={player.id}
            className="border-t border-line first:border-t-0"
          >
            <RosterRow
              player={player}
              avatar={avatars.get(player.id) ?? UNKNOWN_AVATAR}
              now={now}
              expanded={editingId === player.id}
              onToggle={() =>
                setEditingId(editingId === player.id ? null : player.id)
              }
            />
            {editingId === player.id && (
              <PlayerEditor
                player={player}
                onDone={() => setEditingId(null)}
              />
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <AddPlayerForm
          sessionId={sessionId}
          onDone={() => setAdding(false)}
          bordered={roster.length > 0}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={[
            "w-full px-3.5 py-3.5 text-left text-[15px] font-semibold text-green",
            roster.length > 0 ? "border-t border-line" : "",
          ].join(" ")}
        >
          {roster.length > 0 ? "Add player" : "Add your first player"}
        </button>
      )}
    </div>
  );
}

function RosterRow({
  player,
  avatar,
  now,
  expanded,
  onToggle,
}: {
  player: PlayerDTO;
  avatar: ReturnType<AvatarMap["get"]> & object;
  now: number | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  const resting = player.status !== "active";
  const tier = TIER_BY_VALUE.get(player.skillTier) ?? TIERS[3];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={[
        "flex w-full items-center gap-3 px-3.5 py-[11px] text-left",
        resting ? "opacity-55" : "",
      ].join(" ")}
    >
      <PlayerAvatar avatar={avatar} size={34} name={player.name} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">
          {player.name}
        </span>
        <span className="mt-px block text-[12px] text-muted">
          <span
            aria-hidden
            className={`mr-[5px] inline-block h-[7px] w-[7px] rounded-full align-[1px] ${tier.dotClass}`}
          />
          {tier.label}
          {resting && " · resting"}
        </span>
      </span>

      <span className="text-right font-mono text-[12px] font-medium text-muted">
        <b className="block font-semibold text-ink">
          {player.matchesPlayed} played
        </b>
        {/* A resting player isn't queueing, so there's no wait to show. */}
        {resting
          ? "—"
          : `waiting ${now === null ? "—" : formatWait(now - waitingSince(player))}`}
      </span>
    </button>
  );
}

function PlayerEditor({
  player,
  onDone,
}: {
  player: PlayerDTO;
  onDone: () => void;
}) {
  const [name, setName] = useState(player.name);
  const [tier, setTier] = useState<SkillTier>(player.skillTier);
  const [gender, setGender] = useState<Gender>(player.gender);
  const [saving, setSaving] = useState(false);

  async function save(status?: "active" | "inactive") {
    setSaving(true);
    try {
      await updatePlayer(player.id, {
        name,
        skillTier: tier,
        gender,
        status: status ?? player.status,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line bg-[#FAFBF8] px-3.5 py-3.5">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label="Player name"
        className={fieldClass}
      />

      <ChipRow
        label="Skill"
        options={TIERS.map((t) => ({ value: t.value, label: t.label }))}
        value={tier}
        onChange={setTier}
      />
      <ChipRow
        label="Gender"
        options={GENDERS}
        value={gender}
        onChange={setGender}
      />

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() =>
            save(player.status === "active" ? "inactive" : "active")
          }
          disabled={saving}
          className="flex-1 rounded-btn border-[1.5px] border-line bg-surface py-3 text-[15px] font-semibold text-ink disabled:opacity-50"
        >
          {player.status === "active" ? "Mark resting" : "Mark active"}
        </button>
        <button
          type="button"
          onClick={() => save()}
          disabled={saving || !name.trim()}
          className="flex-1 rounded-btn bg-green py-3 text-[15px] font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[12px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={[
              "rounded-btn-sm border px-3 py-2 text-[13px] font-semibold",
              value === option.value
                ? "border-green bg-green-soft text-green"
                : "border-line bg-surface text-muted",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddPlayerForm({
  sessionId,
  onDone,
  bordered,
}: {
  sessionId: string;
  onDone: () => void;
  bordered: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<SkillTier>("unknown");
  const [gender, setGender] = useState<Gender>("unspecified");

  return (
    <form
      action={async (formData: FormData) => {
        formData.set("skillTier", tier);
        formData.set("gender", gender);
        const result = await addPlayer(sessionId, formData);
        if (result.ok) {
          setError(null);
          onDone();
        } else {
          setError(result.error);
        }
      }}
      className={[
        "flex flex-col gap-3 bg-[#FAFBF8] px-3.5 py-3.5",
        bordered ? "border-t border-line" : "",
      ].join(" ")}
    >
      <input
        name="name"
        required
        autoFocus
        placeholder="Player name"
        aria-label="Player name"
        className={fieldClass}
      />
      <ChipRow
        label="Skill"
        options={TIERS.map((t) => ({ value: t.value, label: t.label }))}
        value={tier}
        onChange={setTier}
      />
      <ChipRow
        label="Gender"
        options={GENDERS}
        value={gender}
        onChange={setGender}
      />
      {error && <p className="text-[13px] text-warn">{error}</p>}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-btn border-[1.5px] border-line bg-surface py-3 text-[15px] font-semibold text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-btn bg-green py-3 text-[15px] font-semibold text-white"
        >
          Add player
        </button>
      </div>
    </form>
  );
}
