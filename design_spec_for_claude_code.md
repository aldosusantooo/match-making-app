# Court Line — visual design spec (v2)

For implementing the visual design on top of the existing Next.js + Tailwind + Prisma app. Reference alongside the 4 screen mockup HTML files.

## Colors

Add to `tailwind.config.js` under `theme.extend.colors`:

```js
colors: {
  bg: '#F6F7F3',
  surface: '#FFFFFF',
  ink: '#17231C',
  muted: '#6B7568',
  primary: { DEFAULT: '#1E6B4A', bg: '#E1EFE7' },
  secondary: { DEFAULT: '#29527E', bg: '#E4EBF1' },
  line: '#DDE3DA',
  warn: { DEFAULT: '#9C5C12', bg: '#FBEEDA' },
  band: { text: '#F5F8F5', sub: 'rgba(245,248,245,.72)' },
}
```

Usage: `primary` = active status, primary buttons, live/on-court indicator. `secondary` = reasoning tags, secondary buttons (Reshuffle, swap). `warn` = the gender-rule banner only — nothing else.

## Typography

Google Fonts import: `Space+Grotesk:wght@600;700`, `IBM+Plex+Mono:wght@500;600;700`, `Inter:wght@400;500;600;700`

Add to `tailwind.config.js` under `theme.extend.fontFamily`:
```js
fontFamily: {
  display: ['"Space Grotesk"', 'sans-serif'],
  sans: ['Inter', 'sans-serif'],
  mono: ['"IBM Plex Mono"', 'monospace'],
}
```

Roles — don't mix these up:
- **Space Grotesk (display)**: screen/modal titles only (`h2` in the header band)
- **Inter (sans)**: all body copy, player names, descriptions
- **IBM Plex Mono (mono)**: every button label, section labels (PLAYERS / MATCHES), status labels (ON COURT), tags, score digits, match numbers — always uppercase, `letter-spacing: 0.05em` for buttons/labels

## Shape

- Header band: no radius, sits flush at the top of the screen/modal
- "Record" cards (the live match card): `border-radius: 4px`, `border-left: 4px solid` primary — no border on the other 3 sides
- Containers (list boxes, side boxes, form fields): `border-radius: 8px`, full 1px border in `line`
- Buttons: `border-radius: 8px`
- Pills/tags/badges: full round (`border-radius: 9999px` or `20px`)

Don't apply the left-accent treatment to containers — it's reserved for cards that represent one specific match/record, so it stays meaningful.

## Signature components

**Header band** — every screen and modal opens with a solid `primary` band containing the title (display font, `band.text` color) and, where relevant, a subtitle (`band.sub` color) and a right-aligned action. A 3px `rgba(255,255,255,.16)` line caps the bottom edge.

**Court texture** — a decorative, non-interactive layer behind body content: an inset border (`1.5px solid rgba(23,35,28,.055)`) plus a vertical center line at 50% width, same color. Purely atmospheric, `pointer-events: none`, `z-index: 0` (content sits at `z-index: 1`).

**Net-line divider** — used once, between Side A / Side B on the create-match screen: a dashed/ticked horizontal rule (`repeating-linear-gradient`) on either side of a small "VS" label in `secondary`.

**Shuttlecock icon** — replaces plain dots for live/on-court status. SVG, five lines fanning from a small filled circle:
```html
<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
  <path d="M12 14 L6 4 M12 14 L9 2.5 M12 14 L12 1.5 M12 14 L15 2.5 M12 14 L18 4"
        stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="12" cy="16.2" r="2.6" fill="currentColor"/>
</svg>
```
Color it `primary`, animate a soft pulse via `filter: drop-shadow(...)` on a 1.8s loop.

**Racket icon** — next to the "swap" action on the create-match screen: an ellipse (head) + short line (handle), `currentColor`, 1.8px stroke.

## Copy reference

Use these exact strings — several were deliberately changed from earlier drafts:

| Context | Copy |
|---|---|
| Empty match list | "No one's on court yet" |
| Live match status | "On court" |
| Live match action | "Who won?" |
| Options entry point / panel title | "House rules" |
| Gender-rule banner | "Not enough players to keep sides same-gender." |
| Gender-rule banner, allow button | "Go mixed" |
| Create-match, secondary button | "Reshuffle" |
| Create-match, primary button | "Start match" |
| Rotation footnote | "Fair rotation always comes first — this just decides how sides get split." |

Everything else (player names, "Create match," "Save result," win-row labels, "Done," reasoning tags) is unchanged from the wireframe.

## Reference files

`screen1_session_home_v2.html` through `screen4_house_rules_v2.html` — static HTML, pixel/color/spacing reference only, not meant to be lifted as code.
