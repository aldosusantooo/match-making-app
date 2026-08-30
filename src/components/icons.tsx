export function ShuttlecockIcon({
  className,
  size = 15,
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
      <path
        d="M12 14 L6 4 M12 14 L9 2.5 M12 14 L12 1.5 M12 14 L15 2.5 M12 14 L18 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.2" r="2.6" fill="currentColor" />
    </svg>
  );
}

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
