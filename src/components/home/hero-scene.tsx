/**
 * Decorative backdrop for the hero: two court-line layers drifting at
 * different parallax speeds over a soft green glow (spec §3.3). The two
 * `<svg>` geometries are the prototype's, unchanged.
 *
 * `HomeMotion` reads `data-speed` and writes `transform`, so the layers keep
 * their own `translateX(-50%)` as part of that transform rather than as a
 * class — a class would be overwritten on the first scroll.
 */
export function HeroScene() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute top-[-120px] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(6,96,63,0.1),transparent_70%)]" />

      <svg
        data-speed="0.18"
        viewBox="0 0 1600 520"
        fill="none"
        stroke="#06603F"
        strokeOpacity=".13"
        strokeWidth="1.5"
        className="absolute top-[-40px] left-1/2 w-[1600px] max-w-none -translate-x-1/2 opacity-55"
      >
        <path d="M200 60 H1400 V460 H200 Z" />
        <path d="M800 60 V460" />
        <path d="M200 260 H1400" />
        <path d="M560 60 V460" />
        <path d="M1040 60 V460" />
        <path d="M260 60 V460" />
        <path d="M1340 60 V460" />
      </svg>

      <svg
        data-speed="0.32"
        viewBox="0 0 1600 520"
        fill="none"
        stroke="#06603F"
        strokeOpacity=".12"
        strokeWidth="1.5"
        className="absolute top-[140px] left-1/2 w-[1600px] max-w-none -translate-x-1/2 opacity-35"
      >
        <path d="M-100 120 H1700 V520 H-100 Z" />
        <path d="M800 120 V520" />
        <path d="M440 120 V520" />
        <path d="M1160 120 V520" />
      </svg>

      {/* Fade the court lines into the page colour so the hero hands over
          to the statement without a hard edge. */}
      <div className="absolute inset-x-0 bottom-0 h-[160px] bg-[linear-gradient(to_bottom,transparent,var(--color-bg))]" />
    </div>
  );
}
