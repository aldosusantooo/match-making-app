import Image from "next/image";
import { PlayerAvatar } from "@/components/player-avatar";
import { CheckIcon } from "@/components/icons";
import type { ReactNode } from "react";

/**
 * The hero device shot (spec §3.5). A flat PNG rather than a React rebuild
 * of the session screen: it is the LCP element, so a preloaded image with
 * fixed dimensions costs no layout shift and no web-font round trip, and a
 * hand-built copy would drift from the real screen the first time
 * `LiveMatchCard` changes.
 *
 * The three cards around it *are* real DOM — they parallax independently and
 * carry text — but they only exist from 960px, where there is room outside
 * the 640px column for them.
 */
export function PhoneHero() {
  return (
    <div
      data-reveal
      data-d="2"
      // No horizontal padding: the prototype's 10px was room for the frame
      // it drew as a box-shadow, and this export carries that frame inside
      // the image. Instead the wrapper bleeds 10px past the column on each
      // side, so on a 360px phone (320px column) the 340px export still fits
      // edge to edge; narrower than that, preflight's `img { max-width: 100% }`
      // shrinks it with the column rather than letting it overflow.
      className="relative -mx-2.5 flex justify-center pt-6 pb-3.5 wide:mx-0 wide:overflow-visible wide:pt-[34px] wide:pb-5"
    >
      <FloatingCard
        speed="-0.06"
        delay="2"
        className="left-[-150px] top-[60px]"
        icon={
          <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-live-soft">
            <span className="h-2 w-2 rounded-full bg-live" />
          </span>
        }
        title="Match berikutnya siap"
        detail="Budi, Nina, Tono, Wira"
      />

      <FloatingCard
        speed="0.05"
        delay="3"
        className="right-[-170px] top-[300px]"
        icon={
          <span className="flex flex-none [&>*+*]:-ml-2">
            <PlayerAvatar
              avatar={{ colorClass: "bg-a2", initials: "SA" }}
              size={24}
              name="Sari"
              className="border-2 border-white"
            />
            <PlayerAvatar
              avatar={{ colorClass: "bg-a4", initials: "AG" }}
              size={24}
              name="Agus"
              className="border-2 border-white"
            />
          </span>
        }
        title="Sari & Agus menang"
        detail="21–17 · Match 04"
      />

      <FloatingCard
        speed="-0.04"
        delay="4"
        className="left-[-160px] bottom-[120px]"
        icon={
          <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-green-soft text-green">
            <CheckIcon size={16} />
          </span>
        }
        title="Semua sudah main 2x"
        detail="Nunggu paling lama: 6 menit"
      />

      {/* 364 x 647 is the source at 1x (it ships at 3x); the rendered width
          is 340 / 360, which is the prototype's 320 / 340 screen plus the
          10px frame either side that this export bakes in. Measured against
          homepage-mobile.png and homepage-desktop.png: 339 and 359. */}
      <Image
        src="/hero-phone.png"
        width={364}
        height={647}
        preload
        alt="Layar sesi Bisai: match yang sedang berjalan dan daftar pemain yang menunggu"
        // The export carries no shadow of its own so it can sit on any
        // background; drop-shadow follows the alpha edge, which box-shadow
        // would not — it would box the rounded corners.
        style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,.35))" }}
        className="relative z-[1] h-auto w-[340px] rotate-[-2deg] motion-safe:animate-hero-float wide:w-[360px] wide:translate-y-1.5 wide:rotate-[-3deg]"
      />
    </div>
  );
}

function FloatingCard({
  speed,
  delay,
  className,
  icon,
  title,
  detail,
}: {
  speed: string;
  /** Reveal stagger, so the three arrive one after another. */
  delay: string;
  className: string;
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div
      data-speed={speed}
      data-reveal
      data-d={delay}
      className={[
        "absolute z-[3] hidden items-center gap-2.5 rounded-[14px] border border-[rgba(23,35,28,0.06)] bg-surface px-3 py-2.5 text-[12.5px] shadow-float will-change-transform wide:flex",
        className,
      ].join(" ")}
    >
      {icon}
      <span>
        <b className="block font-semibold">{title}</b>
        <small className="text-[11.5px] text-muted">{detail}</small>
      </span>
    </div>
  );
}
