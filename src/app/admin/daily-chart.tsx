"use client";

import { useState } from "react";
import { type DayCount, niceCeil } from "@/lib/admin-metrics";
import { formatDay } from "./format";

const PLOT_HEIGHT = 140;

/**
 * Sessions per day as thin columns. Hovering, tapping or focusing a column
 * puts its day in the readout above the plot (today by default), and the
 * table under "Show as table" carries every value without hovering at all.
 */
export function DailyChart({ days }: { days: DayCount[] }) {
  const [active, setActive] = useState(days.length - 1);
  const top = niceCeil(Math.max(...days.map((d) => d.count)));
  const selected = days[active];

  return (
    <div>
      <p aria-live="polite" className="mb-4 text-[13px] text-muted">
        <b className="text-[15px] font-semibold text-ink">
          {selected.count} {selected.count === 1 ? "session" : "sessions"}
        </b>{" "}
        · {formatDay(selected.day, true)}
        {active === days.length - 1 && " (today)"}
      </p>

      <div className="flex gap-2">
        <div
          aria-hidden
          className="relative w-5 flex-none text-right text-[11px] text-faint tabular-nums"
          style={{ height: PLOT_HEIGHT }}
        >
          <span className="absolute -top-2 right-0">{top}</span>
          <span className="absolute right-0 -bottom-2">0</span>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative flex items-end gap-[2px] border-y border-line"
            style={{ height: PLOT_HEIGHT }}
          >
            {days.map((d, index) => (
              <button
                key={d.day}
                type="button"
                aria-label={`${formatDay(d.day, true)}: ${d.count} ${d.count === 1 ? "session" : "sessions"}`}
                aria-pressed={index === active}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                // The whole column is the hit target, not just the painted bar.
                className="flex h-full min-w-0 flex-1 items-end justify-center rounded-t-[4px] outline-none focus-visible:bg-green-soft"
              >
                <span
                  className={`block w-full max-w-[24px] rounded-t-[4px] transition-colors ${
                    index === active ? "bg-green" : "bg-green/60"
                  }`}
                  style={{ height: `${(d.count / top) * 100}%` }}
                />
              </button>
            ))}
          </div>
          <div
            aria-hidden
            className="mt-1.5 flex justify-between text-[11px] text-faint"
          >
            <span>{formatDay(days[0].day)}</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer font-semibold text-green">
          Show as table
        </summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-[11px] text-muted">
            <tr>
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day} className="border-t border-line">
                <td className="py-1">{formatDay(d.day, true)}</td>
                <td className="py-1 text-right">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
