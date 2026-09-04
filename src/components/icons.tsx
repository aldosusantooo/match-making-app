export function RacketIcon({
  className,
  size = 10,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <ellipse cx="12" cy="9" rx="6" ry="7" stroke="currentColor" strokeWidth="1.8" />
      <line
        x1="12"
        y1="16"
        x2="12"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The Bisai mark, inlined verbatim from `docs/design/brand/svg/bisai-mark.svg`
 * — 比 as two players either side of a net, with the amber shuttlecock dot.
 * Inlined rather than loaded as an image so the header never flashes an empty
 * box; the geometry is the master file's, unmodified. Do not redraw it.
 *
 * The tile carries its own 22% corner radius. The wrapper clips to the 7px
 * the brand sheet specifies at 22px, which trims the corners very slightly.
 */
export function BisaiMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className="rounded-[7px]"
      aria-hidden
    >
      <rect width="1024" height="1024" rx="226" fill="#06603F" />
      <rect
        x="500.7"
        y="82"
        width="22.5"
        height="860"
        rx="11"
        fill="rgba(255,255,255,.35)"
      />
      <path
        fill="#FFFFFF"
        transform="translate(174.00 737) scale(0.6760 -0.6760)"
        d="M204 563H466V419H204ZM856 724 974 590Q920 542 861.5 494.0Q803 446 744.5 400.5Q686 355 629 314Q619 340 597.0 372.5Q575 405 557 427Q610 465 663.5 516.5Q717 568 766.5 622.5Q816 677 856 724ZM502 842H656V137Q656 94 661.5 82.5Q667 71 692 71Q697 71 708.0 71.0Q719 71 732.0 71.0Q745 71 756.0 71.0Q767 71 772 71Q790 71 799.5 89.0Q809 107 813.5 154.5Q818 202 821 288Q839 275 864.5 261.0Q890 247 916.0 236.5Q942 226 962 221Q956 117 939.0 52.0Q922 -13 886.5 -43.0Q851 -73 788 -73Q779 -73 762.5 -73.0Q746 -73 727.5 -73.0Q709 -73 693.0 -73.0Q677 -73 668 -73Q604 -73 568.0 -53.5Q532 -34 517.0 12.0Q502 58 502 139ZM105 -98Q100 -80 88.0 -57.0Q76 -34 62.5 -12.0Q49 10 37 22Q57 36 75.5 62.0Q94 88 94 126V839H250V43Q250 43 235.5 34.0Q221 25 199.5 9.5Q178 -6 156.0 -24.5Q134 -43 119.5 -62.0Q105 -81 105 -98ZM105 -98 81 48 139 97 448 204Q447 181 447.5 153.0Q448 125 450.0 99.0Q452 73 455 55Q356 17 292.5 -8.0Q229 -33 192.5 -49.5Q156 -66 136.5 -77.5Q117 -89 105 -98Z"
      />
      <circle cx="880" cy="144" r="92" fill="#F59E0B" />
    </svg>
  );
}

export function MenuIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
