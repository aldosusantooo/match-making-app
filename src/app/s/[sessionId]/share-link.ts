/**
 * "Bagikan link" from the header menu. The private link is the only way back
 * into a session from another device, but hosts found a sheet popping up to
 * say so intrusive, so sharing is one tap with no screen of its own.
 *
 * Returns "copied" when the host needs telling it worked; the phone's share
 * menu and the prompt fallback are their own feedback.
 */
export async function shareSessionLink(
  title: string,
): Promise<"shared" | "copied" | "cancelled" | "manual"> {
  // Path only, so a `?new=1` or UTM tag still in the address bar never
  // travels with the link.
  const url = `${location.origin}${location.pathname}`;

  // Phones get their own share menu (Instagram, WhatsApp, Copy…). Laptops
  // copy straight away: their share menus are a detour on the way to pasting.
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // Some in-app browsers expose share() and then refuse it. Copy instead.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // The clipboard can be refused too (permissions, in-app browsers). A
    // prompt with the link preselected is plain but works everywhere.
    window.prompt("Salin link sesi ini:", url);
    return "manual";
  }
}
