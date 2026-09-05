# Session screen visual redesign · implementation spec

Status: approved direction (2026-09-04). Scope is the **session home screen only** (`/s/[id]`). This is a visual re-layout, not a rebrand and not a workflow change. Matchmaking, data model, server actions, and the create-match / result sheets keep working exactly as they do today.

Reference files (same folder):
- `target_mockup.html` — the target screen as static HTML/CSS. **Source of truth for every value** (colours, radii, sizes, spacing). Open it in a browser at 390px wide.
- `target_mockup.png` — render of the above.
- `court-variations.png` — the four court directions considered; **B (two blocks)** was chosen for the live card.
- `finished-rows.png` — finished-match rows, collapsed and expanded.
- `production_readiness_audit.md` — the wider audit this comes from; only Section A / visual items are in scope here.
- `brand/BRAND.md` + `brand/svg`, `brand/icons`, `brand/favicon.ico`, `brand/og-image.png` — the locked brand kit. The header mark, favicon, manifest icons and OG image come from here unchanged.

---

## 1. What changes, in one paragraph

The dark green header band goes away; the header becomes light with a small mark + app name top-left and a menu button top-right. The session name becomes the anchor at 30px. The live match is drawn as a court: two green halves split by a white net, players placed on it as coloured initial avatars. The player list becomes a "Waiting" roster with the same avatars, a tier dot, matches played, and wait time. Finished matches collapse to 56px rows (avatar pair + names per side, score in the middle, WON tag) with tap-to-expand. Buttons move to sentence case; mono is used only for numbers and section eyebrows. The decorative court-lines background is removed.

## 2. Screen order (top to bottom)

1. App header: mark + name (left), menu button (right). "House rules" moves into the menu.
2. Session title block: session name (30px) + meta line "Fri 4 Sep · **8 players** · 4 matches played".
3. Section "ON COURT" with right label "Court N". One `LiveMatchCard` per in-progress match, stacked, newest first.
4. Section "WAITING · N" with right label "Next up". `RosterRow` for every active player **not currently playing**, sorted by the same order the matchmaker would pick them (fewest matches played, then longest wait). Inactive/resting players at the bottom at 55% opacity.
5. Hint line under the roster: "Next match ready: **Sari, Agus, Tono + 1 more**" or "Need **2 more free players** for the next match". Replaces the current error banner.
6. Section "FINISHED · N" with right label "Show all". Up to 3 `FinishedMatchRow`s, newest first, then a "Show N more" footer that expands the list in place.
7. Sticky bottom CTA "Create match" (16px, sentence case). Disabled (50% opacity) when fewer than 4 free players; the hint line carries the reason.

Empty states: no players → roster card shows "Add your first player" as a button-style row. No live match → the ON COURT section is hidden entirely (not an empty box). No finished matches → FINISHED section hidden.

## 3. Design tokens

```css
/* surfaces */
--bg:        #F6F7F3;   /* page */
--surface:   #FFFFFF;   /* cards */
--line:      #E3E7E1;   /* dividers, secondary button border */
--ink:       #17231C;   /* primary text */
--muted:     #6B7A70;   /* secondary text */
--faint:     #9AA5A0;   /* tertiary (match numbers) */

/* brand */
--green:      #06603F;  /* primary button, brand mark, links */
--green-soft: #E6F0EA;  /* WON tag bg, selected states */

/* court (live card) */
--court-a-1: #3B9B66; --court-a-2: #2C8455;  /* side A gradient 160deg */
--court-b-1: #2F8B5B; --court-b-2: #22704A;  /* side B gradient 200deg */

/* live accent (the only new colour) */
--live:      #F59E0B;  --live-soft: #FFF4DC;  --live-text: #8A5A00;

/* tier dots */
--tier-beginner: #3A86FF; --tier-intermediate: #F59E0B; --tier-advanced: #E05252; --tier-unknown: #9AA5A0;

/* avatar palette, assigned per player (see §5) */
--a1:#E76F51; --a2:#7B61FF; --a3:#2A9D8F; --a4:#3A86FF; --a5:#D62867; --a6:#F4A261; --a7:#5B8C5A; --a8:#7A8F84;

/* radii */
--r-card: 20px; --r-list: 16px; --r-court: 16px; --r-btn: 12px; --r-btn-sm: 10px; --r-icon: 10px;

/* shadows */
--sh-card: 0 1px 2px rgba(23,35,28,.06), 0 14px 34px -14px rgba(23,35,28,.22);
--sh-list: 0 1px 2px rgba(23,35,28,.05);
--sh-avatar: 0 8px 18px -6px rgba(0,0,0,.45);
--sh-cta:  0 10px 24px -8px rgba(6,96,63,.5);
```

Typography (fonts already loaded via next/font: Inter, Space Grotesk, IBM Plex Mono):

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Session name | Space Grotesk | 30px / 700, line-height 1.05, letter-spacing -0.01em | the only large element |
| Card title ("Match 05") | Space Grotesk | 17px / 700 | |
| Brand name | Space Grotesk | 13px / 700, colour green | |
| Body / names | Inter | 15px / 600 (names), 13px / 400 (meta) | |
| Buttons | Inter | 15px / 600 primary & secondary; 16px / 600 sticky CTA; 13px / 600 in expanded row | sentence case, no letter-spacing |
| Section eyebrow ("ON COURT") | IBM Plex Mono | 12px / 600, uppercase, letter-spacing .10em, colour muted | |
| Side labels on court | IBM Plex Mono | 10px / 600, uppercase, .14em, rgba(255,255,255,.7) | |
| Numbers: timer, score, "2 played", "waiting 12m", match number | IBM Plex Mono | 14px/600 timer; 13px/600 score; 12px/500–600 roster meta; 10px/500 match no. | **mono is only for numbers and eyebrows** |
| Avatar initials | Space Grotesk | 14px / 700 (44px avatar), 13px (34px), 11px (28px) | |

Spacing: page gutter 16px for cards, 20px for text; section header margin 20px top / 10px bottom; card inner padding 16px horizontal, 14px top; court inset 12px inside the card.

## 4. Components

### 4.1 `AppHeader`
Light background (page bg). Left: the Bisai mark (`brand/svg/bisai-mark.svg`) at 22px, then "Bisai" in Space Grotesk 13/700 green. Right: 34px icon button (`--surface`, 1px `--line`, radius 10) with a hamburger icon. Menu contains: House rules, Share link, End session (whatever exists today; add nothing new).

App name: **Bisai** (locked). Read it from a single constant `APP_NAME = "Bisai"`. The mark is `docs/design/brand/svg/bisai-mark.svg` rendered at 22px, radius 7; do not redraw it in CSS. Everything about the name, mark, colours and copy lives in `docs/design/brand/BRAND.md`; that file wins over this one on brand questions.

### 4.2 `SessionTitle`
`h1` session name, then meta line in 13px muted with player count in ink/600.

### 4.3 `SectionHeader`
Flex row, baseline aligned: eyebrow (mono 12/600 uppercase muted) left, optional action text (13/600 green) right.

### 4.4 `LiveMatchCard` (direction B)
- Card: `--surface`, radius 20, `--sh-card`, 1px border rgba(23,35,28,.05).
- Header row: "Match NN" (17/700) + "Started HH:MM" (12 muted) left; **live pill** right: `--live-soft` bg, radius 999, padding 6px 10px 6px 9px, 8px `--live` dot with `0 0 0 4px rgba(245,158,11,.22)` ring, then elapsed time mm:ss in mono 14/600 `--live-text`. Timer ticks client-side every second from `match.startedAt`. Add a slow 2s opacity pulse on the dot (CSS animation, respect `prefers-reduced-motion`).
- Court: 150px tall, radius 16, `overflow:hidden`, CSS grid `1fr 6px 1fr`. Left half gradient 160deg `--court-a-1 → --court-a-2`; right half 200deg `--court-b-1 → --court-b-2`; each half has a radial highlight `radial-gradient(120px 90px at 30% 20%, rgba(255,255,255,.18), transparent 70%)`. Middle column is the net: white, with 14px white circles overflowing top and bottom (posts). "SIDE A" / "SIDE B" labels top-left / top-right inside the halves.
- Players: absolutely positioned within each half, `transform: translate(-50%,-50%)`. Doubles positions: front player at (36%, 44%) and back player at (70%, 72%) on side A; mirrored (30%, 44%) and (64%, 72%) on side B. Singles: one player centred (50%, 55%). Each player = 44px `PlayerAvatar` with 3px white border + `--sh-avatar`, name below in Inter 12/600 white on `rgba(0,0,0,.22)` pill (padding 2px 8px, radius 7).
- Footer: two buttons, gap 10. "Swap" secondary (surface, 1.5px `--line`, ink), "Record result" primary (green, white). Both radius 12, padding 13px 0, Inter 15/600. They call the **existing** swap and result flows.

### 4.5 `PlayerAvatar`
Circle, background = the player's assigned colour, initials centred in white Space Grotesk 700. Sizes: 44 (court), 34 (roster), 28 (finished row). See §5 for colour and initials rules.

### 4.6 `RosterRow`
List container: `--surface`, radius 16, `--sh-list`, 1px border rgba(23,35,28,.05); rows separated by 1px `--line`. Row: padding 11px 14px, flex, gap 12. Left 34px avatar. Middle: name (15/600) over a 12px muted line with a 7px tier dot + tier label ("Advanced", "Intermediate", "Beginner", "Unknown"); append " · resting" when inactive. Right, right-aligned mono: "N played" (12/600 ink) over "waiting 12m" (12/500 muted); inactive players show "—" for wait.
Tapping a row opens the existing inline edit (rename, tier, gender, active toggle). Keep that behaviour; only restyle the edit form to use the same tokens (inputs 46px, radius 12, 1px `--line`; replace native selects with a chip row for tier and a 3-segment control for gender if it can be done in under an hour, otherwise leave selects for phase 2).

### 4.7 `FinishedMatchRow`
Grid `1fr 34px 1fr`, padding 10px 12px, 1px `--line` between rows. Left team: 28px avatar stack (second avatar overlaps by -9px, 2px white borders) then team names "Sari & Agus" (13/600, ellipsis). Right team mirrored (row-reverse, right-aligned). Middle: score "21–17" (mono 13/600 ink) or "—" (mono 13/500 muted) over match number "M04" (mono 10/500 faint, .08em). Winning side gets a **WON** tag: absolute, top of the row, mono 9/600 .12em green on `--green-soft`, radius 0 0 6px 6px, padding 2px 6px, on the left edge for side A / right edge for side B. Losing side: names in muted, avatars at 55% opacity.
Tap → expands in place (only one open at a time): row background `#FAFBF8`, then a centred 12px muted line "19:41 – 19:58 · 17 min · no score entered" (or the score), then two buttons: "Add score" (secondary, 13/600, radius 10) and "Edit result" (primary). Both open the **existing** result sheet for that match, pre-selected. If editing a finished result isn't supported by the server yet, render "Edit result" disabled with a tooltip "coming soon" rather than hiding it.
Footer row "Show N more" (13/600 green, centred, 12px padding) when more than 3 finished matches; tapping reveals the rest in place and changes to "Show less".

### 4.8 Sticky CTA
Fixed to the bottom of the viewport within the 390–430px column: 16px gutters, radius 14, green, white 16/600 text, `--sh-cta`, 15px vertical padding, 22px from the bottom (respect `env(safe-area-inset-bottom)`). Page content gets 90px bottom padding so nothing hides behind it.

## 5. Avatar colour and initials

- Colour: assign from the 8-colour palette on player creation, `palette[playerIndexInSession % 8]`, and **persist it on the player row** (`avatarColor` or an index) so it never changes during the session. If schema changes are undesirable, derive deterministically from a stable hash of `player.id` instead; the requirement is stability, not persistence.
- Initials: first two letters of the first word, uppercased ("Rizky" → "RZ" is fine; "Dewi" → "DE"). If two players in the session collide, the later one uses first letter of first word + first letter of second word, falling back to first + third letter.
- Tier dot colours per §3; "Unknown" is grey.

## 6. Remove / stop doing

- The dark green header band and its 3px bottom rule.
- The decorative court-lines background (`.absolute.inset-3.border...` and the centre line div).
- Uppercase + letter-spaced mono on buttons and pills ("START SESSION", "WHO WON?", "+ Add", "Collapse players").
- The "6 active · 4 playing ›" summary bar: the Waiting roster replaces it.
- The persistent red/amber error banner above Create match: the hint line replaces it and it must clear on any state change.
- "Balanced by skill" tag when every player's tier is Unknown (show "Balanced by rotation" instead). This lives in the create-match sheet; do it only if trivial.

## 6b. Brand plumbing (in scope, small)

- Replace `/favicon.ico` with `brand/favicon.ico`; add `apple-touch-icon` (icon-180), `icon-192`, `icon-512`, `icon-512-maskable` via `app/manifest.ts` (name "Bisai", short_name "Bisai", theme_color `#06603F`, background_color `#F6F7F3`, display `standalone`).
- `<meta name="theme-color" content="#06603F">`.
- Default metadata: title template `%s · Bisai`, description "Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main. Tanpa login, tanpa install.", `og:image` = `brand/og-image.png`. Session pages set title to the session name.
- Remove the old shuttlecock/racket SVG glyph and any remaining "Badminton session" strings.

## 7. Out of scope (phase 2)

Create-match sheet and result sheet restyle, home/landing page, custom domain, 404 page, desktop two-column layout, undo/edit result server logic, player removal, optimistic add-player UI. Don't touch them in this pass except where §4 explicitly calls the existing flows.

## 8. Acceptance checklist

- [ ] At 390px the screen matches `target_mockup.png` in structure, order, sizes, and colours (allow ±2px).
- [ ] No mono uppercase text remains on any button.
- [ ] Live timer ticks; pill pulses; both stop under `prefers-reduced-motion`.
- [ ] Two simultaneous matches render as two stacked cards, each labelled Court 1 / Court 2.
- [ ] Roster is sorted by next-up order; playing players are absent from it; resting players are last and dimmed.
- [ ] Finished list shows 3 rows max with "Show N more"; one row expands at a time.
- [ ] Hint line updates immediately after a result is saved (the "need 4, have 2" staleness bug is gone).
- [ ] Create match button is disabled, not erroring, when fewer than 4 free players.
- [ ] Avatar colours and initials are identical between court, roster, and finished rows for the same player.
- [ ] Lighthouse accessibility ≥ 90 on the session page; all icon-only buttons have `aria-label`.
- [ ] No console errors; `npm run build` passes.
