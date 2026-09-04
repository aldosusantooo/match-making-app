# Bisai · brand sheet

Locked 2026-09-04. This is the single source for name, mark, colours, type, and copy. Anything in the app or on the homepage that disagrees with this file is wrong.

## Name

- Product name: **Bisai**. One word, capital B, never "Bi Sai", "BiSai" or "BISAI" in running text.
- Origin: 比赛 (bǐsài), Mandarin for "match / competition". Simplified characters only.
- The hanzi appears in two places: inside the mark (比) and in the wordmark eyebrow (比赛 · OPEN PLAY). Nowhere else in the UI.
- Code constant: `APP_NAME = "Bisai"`. Domain target: bisai.id (fallback bisai.app).

## The mark

比 is two figures side by side. A thin vertical line through the middle turns it into two players on two court halves, the same shape as the live match card. An amber dot top-right is the shuttlecock and the live colour.

Construction (1024 grid, `svg/bisai-mark.svg` is the master):
- Tile: 1024 × 1024, corner radius 226 (22%), fill `#06603F`.
- Net: 22.5 × 860 rounded rect, centred at x = 512, y from 82 to 942, white at 35% opacity.
- Glyph: 比 from Noto Sans SC Black, outlined to a path (no font dependency), 676 units tall, baseline at y = 737, white.
- Dot: circle r = 92 at (880, 144), `#F59E0B`.

Files:
- `svg/bisai-mark.svg` — primary, rounded tile. Use for app icon, favicon, header, OG image.
- `svg/bisai-mark-square.svg` — same, no radius. Use only where the platform masks its own corners (Android adaptive / maskable).
- `svg/bisai-mark-light.svg` — cream tile, green glyph. For light-background print and stickers.
- `svg/bisai-mark-mono-green.svg`, `svg/bisai-mark-mono-white.svg` — one colour, no tile. For watermarks, embroidery, engraving.
- `icons/icon-{1024,512,192,180,167,152,120,96,64,48,32,16}.png`, `icons/icon-512-maskable.png`, `favicon.ico` (16/32/48).
- `og-image.png` (1200 × 630), `wordmark-on-light.png`, `wordmark-on-green.png`.

Rules:
- Minimum size 16px. The dot stays a dot at every size; it never becomes a drawn shuttlecock.
- Clear space around the mark: one quarter of its width on every side.
- Never recolour the tile, rotate the mark, add a drop shadow inside the tile, or place the mark on a busy photo without the tile.
- Header mark in the app is 22px, radius 7, sitting left of the wordmark "Bisai" in Space Grotesk 13/700 green.

## Wordmark

"Bisai" in Space Grotesk Bold, letter-spacing -0.03em, with the eyebrow "比赛 · OPEN PLAY" beneath in Noto Sans SC Bold (hanzi) / Space Grotesk (Latin), letter-spacing 0.28em, at ~28% of the name's size. Eyebrow colour: `#06603F` on light, `#B8F1CC` on green. Mark sits left of the name at the name's cap height, gap ≈ 0.35 × name size.

## Colour

| Token | Hex | Use |
|---|---|---|
| Forest | `#06603F` | Tile, primary buttons, brand text, links |
| Cream | `#F6F7F3` | Page background |
| Ink | `#17231C` | Primary text |
| Muted | `#6B7A70` | Secondary text |
| Line | `#E3E7E1` | Dividers, secondary button border |
| Mint | `#B8F1CC` | Eyebrow text on green, dark-mode accents |
| Amber | `#F59E0B` | The dot, live state, timers. Nothing else. |
| Court A / B | `#3B9B66→#2C8455` / `#2F8B5B→#22704A` | Live card halves only |

Never introduce red. Amber is the only warm colour in the system.

## Type

- Display: Space Grotesk 700 (session names, card titles, wordmark).
- Body / UI: Inter 400–600. Buttons sentence case, 15–16px, weight 600.
- Numbers and eyebrows: IBM Plex Mono 500–600. Mono is never used on a button or a sentence.
- Hanzi: Noto Sans SC 700/900 (only 比 and 比赛 are ever set).

## Voice and copy

Indonesian first, English second. Short, host-to-host, no exclamation marks, no emoji in UI. Sentence case everywhere.

- Hero line (homepage H1 and OG image headline): **Ribet pakai AI, Badmin pakai Bisai.** The AI/Bisai rhyme is the joke; "AI" appears nowhere else on the page.
- Description (meta description, og:description, homepage hero subline, store listing): **Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main. Tanpa login, tanpa install.**
- Trust chips: **Tanpa login · Tanpa install · Jalan dari HP**
- Eyebrow under the wordmark: **比赛 · OPEN PLAY** (the only place hanzi appears outside the mark).
- There is no separate slogan under the logo. Don't invent one.
- Avoid: "smart", "powered by", "revolutionary", em dashes, and "AI" anywhere except the hero line.

## Do / don't

Do: use the mark as the favicon and home-screen icon unchanged; pair the name with the eyebrow when there is room; let amber mean "live".
Don't: write the name as 比赛 alone in Latin-script contexts; use the mark in red or black tiles; add badminton clip-art next to it; set UI labels in uppercase mono.
