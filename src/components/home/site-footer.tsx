import { version } from "../../../package.json";
import { BisaiMark } from "@/components/icons";
import { APP_NAME } from "@/lib/constants";

/**
 * The 比赛 the name comes from, drawn from `public/hanzi-bisai.svg` as a mask
 * rather than an `<img>`: the file is an outlined path with no colour of its
 * own, and both places it appears need a different one (green in the eyebrow,
 * a 5% ghost in the corner). A mask keeps that a single asset and avoids
 * pulling a CJK web font for two characters.
 */
function Hanzi({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={["block bg-current", className].filter(Boolean).join(" ")}
      style={{
        maskImage: "url(/hanzi-bisai.svg)",
        WebkitMaskImage: "url(/hanzi-bisai.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

/** Only rendered when the deploy sets a number; wa.me wants bare digits. */
const feedbackNumber = process.env.NEXT_PUBLIC_FEEDBACK_WA;

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden border-t border-line pt-[34px] pb-10"
    >
      <Hanzi className="absolute right-[-10px] bottom-[-60px] h-[220px] w-[424px] text-[rgba(6,96,63,0.05)]" />

      <div className="relative mx-auto grid w-[min(640px,calc(100%-40px))] gap-[18px]">
        <div className="flex items-center gap-3">
          <BisaiMark size={40} />
          <span className="font-display text-[26px] leading-none font-bold tracking-[-0.03em]">
            {APP_NAME}
            <span className="mt-[5px] flex items-center gap-[0.28em] font-display text-[10px] leading-none font-bold tracking-[0.28em] text-green">
              <Hanzi className="h-3 w-[23px]" />
              <span aria-hidden>·</span>
              <span>OPEN PLAY</span>
            </span>
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-[18px] text-[13px] text-muted">
            {feedbackNumber && (
              <a
                href={`https://wa.me/${feedbackNumber}`}
                className="hover:text-ink"
              >
                Kirim masukan via WhatsApp
              </a>
            )}
            <a href="#privasi" className="hover:text-ink">
              Privasi
            </a>
            <span>Dibuat di Jakarta</span>
            <span className="font-mono text-[12px]">v{version}</span>
          </div>
          <p
            id="privasi"
            className="mt-3 max-w-[520px] text-[12px] leading-[1.5] text-faint"
          >
            Nama pemain dan hasil match disimpan supaya sesi bisa dibuka lagi
            lewat link. Host bisa hapus sesi kapan saja.
          </p>
        </div>
      </div>
    </footer>
  );
}
