# Prompt for Claude Code

Copy everything below the line into Claude Code, run from the repo root. Put the reference files in `docs/design/` first (spec, target_mockup.html, target_mockup.png, court-variations.png, finished-rows.png).

---

Redesign the session home screen (`/s/[id]`) of this Next.js + Tailwind + Prisma app to match the approved visual spec. This is a visual re-layout only; matchmaking, data model, server actions, and the create-match and result sheets must keep working as they do today.

Read these first, in order, before touching code:
1. `docs/design/session_screen_visual_spec.md` — the full spec: screen order, tokens, every component, what to remove, acceptance checklist.
2. `docs/design/target_mockup.html` — static HTML/CSS of the target screen. Treat its values as the source of truth when the spec and your instinct disagree. Open the PNG next to it (`target_mockup.png`) so you know what it should look like.
3. Skim `docs/design/court-variations.png` and `docs/design/finished-rows.png` for context on the live card (direction B) and the finished rows.

Then, before writing any code, explore the codebase and tell me:
- the file(s) that render the session page, the player list, the match cards, and the create/result sheets;
- how fonts are loaded (next/font) and where Tailwind theme tokens live;
- which of these fields already exist on the models and which need deriving: matches played per player, wait time (last match ended / player activated timestamp), match `startedAt` / `endedAt`, score, winner;
- whether a stable per-player avatar colour can be derived from `player.id` without a schema change, or whether you recommend adding an `avatarColor` column (spec §5 allows either; prefer no migration if the hash is stable).

Wait for my confirmation on that summary, then implement in this order, committing after each step so I can review the diff:
1. Tokens: add the colours, radii, shadows, and font roles from spec §3 to the Tailwind config / CSS variables. Remove the decorative court-lines background and the green header band.
2. `AppHeader`, `SessionTitle`, `SectionHeader`, `PlayerAvatar` (with the colour + initials rules from §5).
3. `LiveMatchCard` (direction B): two-block court, net, positioned avatars, live pill with a client-side ticking timer, Swap and Record result buttons wired to the existing flows. Handle singles (one player per side) and 2+ concurrent matches.
4. `RosterRow` + Waiting section: sorted by next-up order, resting players last and dimmed, existing inline edit preserved. Hint line under it replaces the old error banner and must recompute on every state change.
5. `FinishedMatchRow`: collapsed rows with WON tag and score, tap-to-expand (one at a time), "Show N more". Add score / Edit result open the existing result sheet; if editing a saved result isn't supported server-side, render Edit result disabled with "coming soon".
6. Sticky Create match CTA, disabled (not erroring) when fewer than 4 free players.
7. Sweep: no uppercase letter-spaced mono on any button; mono only on numbers and section eyebrows; sentence case everywhere.

Constraints:
- Keep the existing `APP_NAME`-style constant for the brand name; use "Rally" as a placeholder value.
- Respect `prefers-reduced-motion` for the pulse and the timer animation.
- All icon-only buttons need `aria-label`.
- Don't restyle the create-match or result sheets beyond what is needed to open them from the new buttons (that's phase 2).
- Don't add dependencies for icons; inline the 3–4 SVGs needed.

When done, run `npm run build`, open the session page at 390px and at 430px wide with at least 8 players, 1 live match, and 4 finished matches, take screenshots, and go through the acceptance checklist in spec §8 item by item, telling me which pass and which don't.
