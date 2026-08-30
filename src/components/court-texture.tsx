/**
 * Decorative court-line layer behind body content: an inset border plus a
 * vertical center line. Parent must be `relative`; interactive content sits
 * above it at z-index 1 (`relative z-[1]`).
 */
export function CourtTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-3 z-0 border-[1.5px] border-[rgba(23,35,28,0.055)]"
    >
      <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-[rgba(23,35,28,0.055)]" />
    </div>
  );
}
