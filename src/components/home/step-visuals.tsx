import { BisaiMark, CheckIcon } from "@/components/icons";
import { PlayerAvatar } from "@/components/player-avatar";

/**
 * The illustrations inside the three "Cara pakai" cards (spec §3.7).
 *
 * These deliberately re-implement the session screen's roster row, court and
 * finished row rather than importing them. The real components are client
 * components wired to a live session — a clock, an expand toggle, a "Record
 * result" button — and they label themselves in English. Here they are flat,
 * static, Indonesian and a size smaller. The classes are copied across so
 * the two stay visually identical; the behaviour deliberately isn't.
 */

const CARD_CLASS =
  "rounded-[14px] border border-line bg-surface shadow-inset-card";

/* ── 01 · the link ─────────────────────────────────────────────────────── */

export function LinkVisual() {
  return (
    <div className="grid w-[min(100%,360px)] gap-2.5">
      <div className={`flex items-center gap-2.5 px-3.5 py-3 ${CARD_CLASS}`}>
        <BisaiMark size={30} />
        <span className="flex-1 truncate font-mono text-[13px] font-medium text-green">
          bisai.id/s/mabar-jumat-x7k
        </span>
        <span
          aria-hidden
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-[#25D366] text-[13px] font-bold text-white"
        >
          WA
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <StaticChip>Salin link</StaticChip>
        <StaticChip>Bagikan ke WhatsApp</StaticChip>
        <StaticChip className="text-green">
          <CheckIcon />
          Disimpan di Sesi kamu
        </StaticChip>
      </div>
    </div>
  );
}

function StaticChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

/* ── 02 · the roster ───────────────────────────────────────────────────── */

/** Indonesian tier labels are homepage-only; the app UI is a later pass. */
const ROSTER: {
  name: string;
  initials: string;
  colorClass: string;
  tier: string;
  tierDotClass: string;
  resting?: boolean;
}[] = [
  {
    name: "Sari",
    initials: "SA",
    colorClass: "bg-a2",
    tier: "Mahir",
    tierDotClass: "bg-tier-advanced",
  },
  {
    name: "Agus",
    initials: "AG",
    colorClass: "bg-a4",
    tier: "Menengah",
    tierDotClass: "bg-tier-intermediate",
  },
  {
    name: "Budi",
    initials: "BU",
    colorClass: "bg-a5",
    tier: "Belum tahu",
    tierDotClass: "bg-tier-unknown",
  },
  {
    name: "Wira",
    initials: "WI",
    colorClass: "bg-a7",
    tier: "Belum tahu · istirahat",
    tierDotClass: "bg-tier-unknown",
    resting: true,
  },
];

export function RosterVisual() {
  return (
    <ul className={`w-[min(100%,360px)] overflow-hidden ${CARD_CLASS}`}>
      {ROSTER.map((player) => (
        <li
          key={player.name}
          className={[
            "flex items-center gap-2.5 border-t border-line px-[11px] py-[9px] first:border-t-0",
            player.resting ? "opacity-55" : "",
          ].join(" ")}
        >
          <PlayerAvatar
            avatar={{
              colorClass: player.colorClass,
              initials: player.initials,
            }}
            size={28}
            name={player.name}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold">
              {player.name}
            </span>
            <span className="mt-px block text-[10.5px] text-muted">
              <span
                aria-hidden
                className={`mr-1 inline-block h-1.5 w-1.5 rounded-full align-[1px] ${player.tierDotClass}`}
              />
              {player.tier}
            </span>
          </span>
          <span className="text-right font-mono text-[10px] font-medium text-muted">
            <b className="block font-semibold text-ink">0 main</b>
            {player.resting ? "—" : "baru gabung"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── 03 · the match ────────────────────────────────────────────────────── */

const COURT = {
  A: [
    { name: "Budi", initials: "BU", colorClass: "bg-a5", left: "36%", top: "44%" },
    { name: "Dewi", initials: "DE", colorClass: "bg-a3", left: "70%", top: "72%" },
  ],
  B: [
    { name: "Nina", initials: "NI", colorClass: "bg-a6", left: "30%", top: "44%" },
    { name: "Rizky", initials: "RZ", colorClass: "bg-a1", left: "64%", top: "72%" },
  ],
};

export function MatchVisual() {
  return (
    <div className="grid w-[min(100%,380px)] gap-3">
      <div className="overflow-hidden rounded-[14px] border border-[rgba(23,35,28,0.05)] bg-surface shadow-inset-card">
        <div className="m-2.5 grid h-[110px] grid-cols-[1fr_5px_1fr] overflow-hidden rounded-[13px]">
          <CourtHalf side="A" />
          <div className="relative bg-white" aria-hidden>
            <span className="absolute -top-1 -left-[3.5px] h-3 w-3 rounded-full bg-white" />
            <span className="absolute -bottom-1 -left-[3.5px] h-3 w-3 rounded-full bg-white" />
          </div>
          <CourtHalf side="B" />
        </div>
      </div>

      <div
        className={`grid grid-cols-[1fr_48px_1fr] items-center px-3 py-2.5 ${CARD_CLASS} relative`}
      >
        <span className="absolute -top-px left-3 rounded-b-[6px] bg-green-soft px-1.5 py-0.5 font-mono text-[8px] font-semibold tracking-[0.12em] text-green">
          MENANG
        </span>
        <Team
          players={[
            { name: "Sari", initials: "SA", colorClass: "bg-a2" },
            { name: "Agus", initials: "AG", colorClass: "bg-a4" },
          ]}
          won
        />
        <span className="text-center">
          <span className="block font-mono text-[12px] font-semibold whitespace-nowrap">
            21–17
          </span>
          <span className="block font-mono text-[9px] font-medium tracking-[0.08em] text-faint">
            M04
          </span>
        </span>
        <Team
          players={[
            { name: "Rizky", initials: "RZ", colorClass: "bg-a1" },
            { name: "Tono", initials: "TO", colorClass: "bg-a8" },
          ]}
          won={false}
        />
      </div>

      <span className="inline-flex items-center gap-1.5 justify-self-start rounded-full bg-live-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-live-text">
        <span aria-hidden>↑</span> Rating Sari &amp; Agus naik · pasangan
        berikutnya menyesuaikan
      </span>
    </div>
  );
}

function CourtHalf({ side }: { side: "A" | "B" }) {
  return (
    <div
      className={[
        "relative",
        side === "A"
          ? "bg-[linear-gradient(160deg,var(--color-court-a-1),var(--color-court-a-2))]"
          : "bg-[linear-gradient(200deg,var(--color-court-b-1),var(--color-court-b-2))]",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(100px_70px_at_30%_20%,rgba(255,255,255,0.18),transparent_70%)]"
      />
      <span
        className={[
          "absolute top-2 font-mono text-[8.5px] font-semibold tracking-[0.14em] text-white/70",
          side === "A" ? "left-2.5" : "right-2.5",
        ].join(" ")}
      >
        SISI {side}
      </span>
      {COURT[side].map((player) => (
        <span
          key={player.name}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: player.left, top: player.top }}
        >
          <span
            aria-hidden
            className={`grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-white/95 font-display text-[12px] font-bold text-white shadow-[0_6px_14px_-5px_rgba(0,0,0,0.45)] ${player.colorClass}`}
          >
            {player.initials}
          </span>
          <span className="rounded-md bg-black/22 px-1.5 py-px text-[10px] font-semibold text-white">
            {player.name}
          </span>
        </span>
      ))}
    </div>
  );
}

function Team({
  players,
  won,
}: {
  players: { name: string; initials: string; colorClass: string }[];
  won: boolean;
}) {
  return (
    <span
      className={[
        "flex min-w-0 items-center gap-2",
        won ? "" : "flex-row-reverse text-right",
      ].join(" ")}
    >
      <span
        className={[
          "flex flex-none",
          won ? "[&>*+*]:-ml-2" : "[&>*+*]:-mr-2 opacity-55",
        ].join(" ")}
      >
        {players.map((player) => (
          <PlayerAvatar
            key={player.name}
            avatar={{
              colorClass: player.colorClass,
              initials: player.initials,
            }}
            size={26}
            name={player.name}
            className="border-2 border-white"
          />
        ))}
      </span>
      <span
        className={[
          "truncate text-[12.5px] font-semibold",
          won ? "text-ink" : "text-muted",
        ].join(" ")}
      >
        {players.map((p) => p.name).join(" & ")}
      </span>
    </span>
  );
}
