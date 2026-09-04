/** "Fri 4 Sep" — used for the session meta line. */
export function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(iso))
    .replace(",", "");
}
