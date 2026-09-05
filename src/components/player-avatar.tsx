import type { Avatar } from "@/lib/avatar";

/**
 * 44 on the court, 34 in the roster, 28 in a finished row (session spec
 * §4.5); 26 and 24 in the homepage's scaled-down step visuals and floating
 * cards (homepage spec §3.5, §3.7).
 */
export type AvatarSize = 44 | 34 | 28 | 26 | 24;

const SIZE_CLASSES: Record<AvatarSize, string> = {
  44: "h-11 w-11 text-[14px]",
  34: "h-[34px] w-[34px] text-[13px]",
  28: "h-7 w-7 text-[11px]",
  26: "h-[26px] w-[26px] text-[10px]",
  24: "h-6 w-6 text-[9.5px]",
};

export function PlayerAvatar({
  avatar,
  size,
  name,
  className,
}: {
  avatar: Avatar;
  size: AvatarSize;
  /** Full name, exposed to assistive tech since the initials are decorative. */
  name: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={[
        "grid shrink-0 place-items-center rounded-full font-display font-bold text-white",
        SIZE_CLASSES[size],
        avatar.colorClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden>{avatar.initials}</span>
    </span>
  );
}
