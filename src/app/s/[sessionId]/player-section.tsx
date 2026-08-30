"use client";

import { useState } from "react";
import { addPlayer, updatePlayer } from "@/app/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import type { PlayerDTO, SessionDTO } from "@/lib/dto";
import type { Gender, SkillTier } from "@/lib/engine/types";

const TIER_LABELS: Record<SkillTier, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unknown: "Unknown",
};

const inputClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

const sectionLabelClass =
  "font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted";

const pillClass = "rounded-full px-2 py-[3px] font-mono text-[10px]";

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

  return (
    <section className="relative z-[1]">
      <div className="mb-2 flex items-center justify-between">
        <h2 className={sectionLabelClass}>Players</h2>
        <button
          onClick={() => {
            setAdding((v) => !v);
            setCollapsed(false);
          }}
          className="rounded-[7px] bg-primary-bg px-2.5 py-[5px] font-mono text-[10.5px] text-primary"
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
          className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3 text-left text-[13px]"
        >
          <span>
            {activeCount} active · {playingIds.size} playing
          </span>
          <span className="font-mono text-xs text-muted">›</span>
        </button>
      ) : (
        <Card className="px-3">
          <ul className="divide-y divide-line">
            {session.players.length === 0 && (
              <li className="py-4 text-center text-xs text-muted">
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
        </Card>
      )}
      {!collapsed && collapsedByDefault && (
        <button
          onClick={() => setCollapsed(true)}
          className="mt-1.5 w-full text-center font-mono text-[10.5px] text-muted"
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
      className="mb-3 flex flex-col gap-2 rounded-lg border border-line bg-surface p-3"
    >
      <input
        name="name"
        required
        placeholder="Player name"
        className={inputClass}
        autoFocus
      />
      <div className="flex gap-2">
        <select
          name="skillTier"
          defaultValue="unknown"
          className={`${inputClass} flex-1`}
        >
          <option value="unknown">Skill: unknown</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          name="gender"
          defaultValue="unspecified"
          className={`${inputClass} flex-1`}
        >
          <option value="unspecified">Gender: –</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
      {error && <p className="text-xs text-warn">{error}</p>}
      <Button type="submit" size="sm">
        Add player
      </Button>
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
        <span
          className={`text-[13px] font-semibold ${inactive ? "text-muted" : ""}`}
        >
          {player.name}
          <span className="font-normal text-muted">
            {" "}
            · {TIER_LABELS[player.skillTier]}
          </span>
        </span>
        <span
          className={
            playing
              ? `${pillClass} bg-secondary-bg text-secondary`
              : inactive
                ? `${pillClass} border border-line text-muted`
                : `${pillClass} bg-primary-bg text-primary`
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
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            save(player.status === "active" ? "inactive" : "active")
          }
          disabled={saving}
          className="flex-1"
        >
          {player.status === "active" ? "Mark inactive" : "Mark active"}
        </Button>
        <Button
          size="sm"
          onClick={() => save()}
          disabled={saving || !name.trim()}
          className="flex-1"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
