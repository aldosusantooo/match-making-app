import type { Metadata } from "next";
import { CreateSessionForm } from "@/components/home/create-session-form";
import { HeroScene } from "@/components/home/hero-scene";
import { HomeMotion } from "@/components/home/home-motion";
import { PhoneHero } from "@/components/home/phone-hero";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteNav } from "@/components/home/site-nav";
import { Statement } from "@/components/home/statement";
import { Steps } from "@/components/home/steps";
import { CheckIcon } from "@/components/icons";
import { APP_LEAD, HOME_TITLE } from "@/lib/constants";

export const metadata: Metadata = {
  // Absolute: the root template appends " · Bisai", which would double the
  // name on a title that already leads with it.
  title: { absolute: HOME_TITLE },
};

const TRUST_CHIPS = ["Tanpa login", "Tanpa install", "Jalan dari HP"];

/** One centred 640px column at every width — the nav is the sole exception. */
const COLUMN = "mx-auto w-[min(640px,calc(100%-40px))]";

export default function Home() {
  return (
    <>
      <HomeMotion />
      <SiteNav />

      {/* Landmark for skip-to-content and screen-reader navigation; the nav
          and footer sit outside it. */}
      <main className="flex-1">
        <header className="relative overflow-hidden pt-11 pb-10 wide:pt-[72px]">
          <HeroScene />

          <div className={`relative z-[1] grid gap-9 ${COLUMN}`}>
            <div>
              <h1
                data-reveal
                data-d="1"
                className="mt-1.5 mb-3.5 font-display text-[clamp(38px,7.5vw,64px)] leading-[1.02] font-bold tracking-[-0.03em] wide:text-[56px]"
              >
                Ribet pakai AI,{" "}
                <span className="block text-green">Mending pakai Bisai.</span>
              </h1>

              <p
                data-reveal
                data-d="2"
                className="text-[16.5px] leading-[1.55] text-muted"
              >
                {APP_LEAD}
              </p>

              {/* One line at every width, per spec §3.3 — it clips rather than
                wrapping to a second row on a narrow phone. */}
              <div
                data-reveal
                data-d="3"
                className="mt-4 flex flex-nowrap gap-1.5 overflow-hidden"
              >
                {TRUST_CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-ink"
                  >
                    <span className="text-green">
                      <CheckIcon />
                    </span>
                    {chip}
                  </span>
                ))}
              </div>

              <CreateSessionForm />
            </div>

            <PhoneHero />
          </div>
        </header>

        <Statement />
        <Steps />

        <section className="pt-5 pb-[90px]">
          <div className={COLUMN}>
            <div
              data-reveal
              className="relative overflow-hidden rounded-page-card bg-green px-[26px] py-[34px] text-center text-white shadow-page-card"
            >
              <span
                aria-hidden
                className="absolute inset-4 rounded-2xl border-[1.5px] border-white/12"
              />
              <span
                aria-hidden
                className="absolute top-4 bottom-4 left-1/2 w-[1.5px] bg-white/12"
              />
              <h2 className="relative mb-2.5 font-display text-[clamp(28px,5vw,40px)] leading-[1.08] font-bold tracking-[-0.025em]">
                Mabar minggu ini, coba Bisai.
              </h2>
              <p className="relative mb-[22px] text-[15px] text-white/75">
                Satu HP, satu link, semua kebagian main.
              </p>
              <a
                href="#form"
                className="relative inline-flex h-[50px] items-center justify-center rounded-[14px] bg-white px-[22px] text-[16px] font-semibold text-green transition-transform duration-200 ease-brand hover:-translate-y-px"
              >
                Buat sesi sekarang
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
