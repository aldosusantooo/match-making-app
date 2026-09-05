const LEAD_WORDS =
  "Mabar itu harusnya soal main, bukan soal ngatur. Bisai ingat siapa yang sudah main, siapa yang nunggu paling lama, dan siapa yang belum pernah jadi partner.".split(
    " ",
  );

const CLOSING_WORDS = "Host tinggal tekan satu tombol.".split(" ");

/**
 * The scroll-driven word reveal (spec §3.6). Each word is its own span so
 * `HomeMotion` can turn them ink one at a time as the block crosses the
 * viewport; the closing sentence carries `data-hi` and lands green instead.
 *
 * Built from arrays rather than the prototype's regex split of `innerHTML`,
 * which would rewrite the DOM out from under React on mount.
 */
export function Statement() {
  return (
    <section id="kenapa" className="pt-24 pb-10">
      <div className="mx-auto grid w-[min(640px,calc(100%-40px))] gap-[22px]">
        <span
          data-reveal
          className="inline-flex items-center gap-2 justify-self-start rounded-full border border-line bg-surface py-1.5 pr-3 pl-2.5 text-[12.5px] font-medium text-muted"
        >
          <i className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_0_3px_rgba(6,96,63,0.15)]" />
          Kenapa Bisai
        </span>

        <p
          data-words
          className="font-display text-[clamp(26px,4.6vw,44px)] leading-[1.18] font-medium tracking-[-0.02em]"
        >
          {LEAD_WORDS.map((word, index) => (
            <span data-word key={`lead-${index}`}>
              {word}{" "}
            </span>
          ))}
          {CLOSING_WORDS.map((word, index) => (
            <span data-word data-hi key={`closing-${index}`}>
              {word}
              {index < CLOSING_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
