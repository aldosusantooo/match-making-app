"use client";

import { useState } from "react";
import { addPlayer, updatePlayer } from "@/app/actions";
import type { PlayerDTO, SessionDTO } from "@/lib/dto";
import type { Gender, SkillTier } from "@/lib/engine/types";

const TIER_LABELS: Record<SkillTier, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unknown: "Unknown",
};

const inputClass =
  "rounded-lg border border-line-strong bg-card px-3 py-2 text-sm outline-none focus:border-accent";

export function PlayerSection({
  session,
  playingIds,
  collapsedByDefault,
}: {
  session: SessionDTO;
  playingIds: Set<string>;
  collapsedByDefault: boolean;
}) {
  const [collapsed, setCollapsed] = useState(collapsedByDefault);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = session.players.filter(
    (p) => p.status === "active",
  ).length;
  const restingCount = activeCount - playingIds.size;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-muted">Players</h2>
        <button
          onClick={() => {
            setAdding((v) => !v);
            setCollapsed(false);
          }}
          className="rounded-md border border-line-strong bg-card px-2.5 py-1 text-xs"
        >
          {adding ? "Close" : "+ Add"}
        </button>
      </div>

      {adding && (
        <AddPlayerForm sessionId={session.id} onDone={() => setAdding(false)} />
      )}

      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex w-full items-center justify-between rounded-lg border border-line bg-card px-3 py-2.5 text-left text-sm"
        >
          <span>
            {session.players.length} player
            {session.players.length === 1 ? "" : "s"}
            <span className="text-ink-muted">
              {" "}
              · {playingIds.size} playing · {restingCount} resting
            </span>
          </span>
          <span className="text-xs text-ink-muted">Show</span>
        </button>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-card px-3">
          {session.players.length === 0 && (
            <li className="py-4 text-center text-xs text-ink-muted">
              No players yet — add the first one
            </li>
          )}
          {session.players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              playing={playingIds.has(player.id)}
              editing={editingId === player.id}
              onToggleEdit={() =>
                setEditingId(editingId === player.id ? null : player.id)
              }
            />
          ))}
        </ul>
      )}
      {!collapsed && collapsedByDefault && (
        <button
          onClick={() => setCollapsed(true)}
          className="mt-1.5 w-full text-center text-xs text-ink-muted"
        >
          Collapse players
        </button>
      )}
    </section>
  );
}

function AddPlayerForm({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData: FormData) => {
        const result = await addPlayer(sessionId, formData);
        if (!result.ok) {
          setError(result.error);
        } else {
          setError(null);
          onDone();
        }
      }}
      className="mb-3 flex flex-col gap-2 rounded-lg border border-line bg-card p-3"
    >
      <input
        name="name"
        required
        placeholder="Player name"
        className={inputClass}
        autoFocus
      />
      <div className="flex gap-2">
        <select name="skillTier" defaultValue="unknown" className={`${inputClass} flex-1`}>
          <option value="unknown">Skill: unknown</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select name="gender" defaultValue="unspecified" className={`${inputClass} flex-1`}>
          <option value="unspecified">Gender: –</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
      {error && <p className="text-xs text-warn">{error}</p>}
      <button
        type="submit"
        className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white active:opacity-80"
      >
        Add player
      </button>
    </form>
  );
}

function PlayerRow({
  player,
  playing,
  editing,
  onToggleEdit,
}: {
  player: PlayerDTO;
  playing: boolean;
  editing: boolean;
  onToggleEdit: () => void;
}) {
  const inactive = player.status === "inactive";

  return (
    <li className="py-2.5">
      <button
        onClick={onToggleEdit}
        className="flex w-full items-center justify-between text-left"
      >
        <span className={`text-sm font-semibold ${inactive ? "text-ink-muted" : ""}`}>
          {player.name}
          <span className="font-normal text-ink-muted">
            {" "}
            · {TIER_LABELS[player.skillTier]}
          </span>
        </span>
        <span
          className={
            playing
              ? "rounded-md bg-bg px-2 py-0.5 text-[11px] text-ink-muted"
              : inactive
                ? "rounded-md border border-line px-2 py-0.5 text-[11px] text-ink-muted"
                : "rounded-md bg-accent-bg px-2 py-0.5 text-[11px] text-accent"
          }
        >
          {playing ? "Playing" : inactive ? "Inactive" : "Active"}
        </span>
      </button>

      {editing && <PlayerEditor player={player} onDone={onToggleEdit} />}
    </li>
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
    <div className="mt-2 flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
      />
      <div className="flex gap-2">
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as SkillTier)}
          className={`${inputClass} flex-1`}
        >
          <option value="unknown">Unknown</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className={`${inputClass} flex-1`}
        >
          <option value="unspecified">Gender: –</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            save(player.status === "active" ? "inactive" : "active")
          }
          disabled={saving}
          className="flex-1 rounded-lg border border-line-strong px-3 py-2 text-xs disabled:opacity-50"
        >
          {player.status === "active" ? "Mark inactive" : "Mark active"}
        </button>
        <button
          onClick={() => save()}
          disabled={saving || !name.trim()}
          className="flex-1 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
