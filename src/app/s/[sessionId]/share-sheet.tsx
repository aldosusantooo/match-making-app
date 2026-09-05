"use client";

import { useEffect, useRef, useState } from "react";
import { BandClose, HeaderBand } from "@/components/header-band";

/**
 * The link moment (spec §7.2): shown once when a session is created, and on
 * demand from the header menu afterwards. The private link is the only way
 * back into a session, so this is the one screen that exists purely to get
 * it somewhere safe.
 *
 * `url` is built on the server from the request headers rather than read
 * from `window` after mount, so the field holds the real link in the first
 * paint instead of flashing empty.
 *
 * Styling follows the house-rules sheet; both are restyled together in a
 * later pass.
 */
export function ShareSheet({
  sessionName,
  url,
  onClose,
}: {
  sessionName: string;
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be refused (insecure origin, denied permission).
      // Select the text so copying by hand is one keystroke away.
      field.current?.select();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25">
      <div className="w-full max-w-sm overflow-hidden rounded-t-[18px] bg-surface shadow-lg">
        <HeaderBand
          title="Sesi kamu siap"
          dragHandle
          action={<BandClose onClose={onClose} />}
          className="pt-3 pb-3.5"
        />

        <div className="px-4.5 pt-3.5 pb-4.5">
          <p className="mb-3 text-[13px] text-muted">
            Simpan link ini. Siapa pun yang punya link bisa buka sesi, jadi
            tempel di grup mabar kamu.
          </p>

          <input
            ref={field}
            readOnly
            value={url}
            aria-label="Link sesi"
            onFocus={(event) => event.target.select()}
            className="mb-3 h-[46px] w-full rounded-btn border border-line bg-bg px-3.5 font-mono text-[13px] text-ink outline-none"
          />

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onCopy}
              className="h-[46px] w-full rounded-btn bg-green text-[15px] font-semibold text-white active:opacity-85"
            >
              {copied ? "Tersalin ✓" : "Salin link"}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${sessionName} · ${url}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-[46px] w-full items-center justify-center rounded-btn border-[1.5px] border-line bg-surface text-[15px] font-semibold text-ink active:bg-green-soft"
            >
              Bagikan ke WhatsApp
            </a>

            <button
              type="button"
              onClick={onClose}
              className="h-[42px] w-full text-[14px] font-semibold text-muted"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
