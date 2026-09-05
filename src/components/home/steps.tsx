import type { ReactNode } from "react";
import { LinkVisual, MatchVisual, RosterVisual } from "./step-visuals";

const STEPS: {
  number: string;
  title: string;
  body: string;
  /** Sticky offsets rise by 16px a card so each one parks just below the last. */
  top: string;
  visual: ReactNode;
}[] = [
  {
    number: "01",
    title: "Buat sesi, dapat link.",
    body: "Isi nama kamu dan nama sesi. Bisai kasih link privat yang bisa kamu tempel di grup WhatsApp, jadi sesi nggak hilang kalau tab ketutup.",
    top: "84px",
    visual: <LinkVisual />,
  },
  {
    number: "02",
    title: "Tambah pemain, kasih level.",
    body: "Ketik nama, pilih level kalau tahu. Yang datang telat tinggal ditambah, yang istirahat tinggal di-nonaktifkan. Nggak perlu ulang dari awal.",
    top: "100px",
    visual: <RosterVisual />,
  },
  {
    number: "03",
    title: "Tekan satu tombol, catat hasil.",
    body: "Bisai pilih empat orang yang paling lama nunggu, bagi jadi dua sisi yang seimbang, dan nggak ngulang pasangan yang sama. Selesai main, ketuk siapa yang menang.",
    top: "116px",
    visual: <MatchVisual />,
  },
];

/**
 * "Cara pakai" (spec §3.7). The cards stack over each other on scroll with
 * plain `position: sticky` and staggered `top` offsets — no scroll listener,
 * no library, and it degrades to a normal stack of cards wherever sticky is
 * unavailable.
 */
export function Steps() {
  return (
    <section id="cara" className="pt-10 pb-30">
      <div className="mx-auto w-[min(640px,calc(100%-40px))]">
        <div className="mb-9 grid gap-3.5">
          <h2
            data-reveal
            className="font-display text-[clamp(30px,5vw,44px)] leading-[1.06] font-bold tracking-[-0.025em]"
          >
            Cara pakai.{" "}
            <span className="block text-faint">Tiga langkah, satu malam.</span>
          </h2>
          <p
            data-reveal
            data-d="1"
            className="max-w-[420px] text-[16px] leading-[1.55] text-muted"
          >
            Nggak ada yang perlu didownload pemain. Mereka cukup lihat layar HP
            kamu, atau nunggu dipanggil.
          </p>
        </div>

        <div className="grid gap-[18px]">
          {STEPS.map((step) => (
            <article
              key={step.number}
              style={{ top: step.top }}
              className="sticky grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-step-card border border-[rgba(23,35,28,0.06)] bg-surface shadow-step-card"
            >
              <div className="px-6 pt-[26px] pb-2 wide:px-[30px] wide:pt-[30px] wide:pb-2.5">
                <span className="inline-block rounded-full bg-green-soft px-2.5 py-[5px] font-mono text-[11px] font-semibold tracking-[0.12em] text-green">
                  {step.number}
                </span>
                <h3 className="mt-3.5 mb-2 font-display text-[26px] leading-[1.1] font-bold tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-muted">
                  {step.body}
                </p>
              </div>

              <div className="relative flex min-h-[230px] items-center justify-center bg-[linear-gradient(180deg,rgba(6,96,63,0.04),rgba(6,96,63,0.09))] px-5 pt-[18px] pb-6 wide:min-h-[260px]">
                <span
                  aria-hidden
                  className="absolute inset-[18px] rounded-[14px] border-[1.5px] border-[rgba(6,96,63,0.1)]"
                />
                <span
                  aria-hidden
                  className="absolute top-[18px] bottom-[18px] left-1/2 w-[1.5px] bg-[rgba(6,96,63,0.1)]"
                />
                <div className="relative z-[1] flex w-full min-w-0 justify-center">
                  {step.visual}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
