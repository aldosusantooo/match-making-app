/**
 * Brand constants. `docs/design/brand/BRAND.md` is the source of truth for
 * every string in here; change it there first.
 */

/** Product name. One word, capital B — never "BISAI" or "Bi Sai". */
export const APP_NAME = "Bisai";

/** Locked copy: meta description, og:description and the homepage subline. */
export const APP_DESCRIPTION =
  "Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main. Tanpa login, tanpa install.";

/** Forest green — the tile, primary buttons, brand text. */
export const BRAND_COLOR = "#06603F";

/** Cream — the page background. */
export const BRAND_BACKGROUND = "#F6F7F3";

/**
 * Locked copy: the homepage hero subline. Shorter than `APP_DESCRIPTION` —
 * it drops "Tanpa login, tanpa install." because the trust chips directly
 * beneath it already say exactly that.
 */
export const APP_LEAD =
  "Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main.";

/** Homepage `<title>`. Absolute: it leads with the name, so the root
 *  template's "%s · Bisai" suffix would read backwards. */
export const HOME_TITLE = "Bisai · Atur giliran mabar badminton";
