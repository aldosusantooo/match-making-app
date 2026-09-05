# Prompt for Claude Code · pass 2, homepage

Paste everything below the line into Claude Code, from the repo root. `docs/design/` has already been reorganised (`brand/`, `01-session-screen/`, `02-homepage/`); nothing in `src/` changed.

---

Redesign the homepage (`src/app/page.tsx`) of this Next.js + Tailwind + Prisma app to match the approved spec, and add the three small features the homepage promises. The session screen redesign (pass 1) is done and deployed; build on its components and tokens, don't restyle it.

Read these first, in order, before touching code:
1. `docs/design/02-homepage/homepage_spec.md` — sections, copy, motion, the three features (§7), acceptance checklist (§9).
2. `docs/design/02-homepage/homepage_prototype.html` — the approved page as working HTML/CSS/JS. Open it in a browser and scroll; treat its values as the source of truth where the spec and your instinct disagree. Look at `homepage-desktop.png` and `homepage-mobile.png` next to it.
3. `docs/design/brand/BRAND.md` — name, mark, colours, locked copy.
4. `docs/design/README.md` — what lives where.

Then, before writing any code, explore the codebase and tell me:
- how the pass-1 tokens are defined (Tailwind theme / CSS variables) and which ones the prototype uses that don't exist yet (I expect only `--mint`);
- which existing components you'll reuse for the step visuals (`PlayerAvatar`, `RosterRow`/roster styling, the court block from `LiveMatchCard`, `FinishedMatchRow`) and whether they can render static data without a session context;
- where `createSession` redirects and how `SessionView` receives the session, so you can add the `?new=1` link sheet and the localStorage write (§7.1, §7.2);
- what `submitResult` returns today and whether player ratings before/after are available to the client, so you can decide whether the toast says "rating naik" (§7.3);
- whether `HeaderBand` and `CourtTexture` have any consumer other than the homepage.

Wait for my confirmation on that summary, then implement in this order, committing after each step so I can review the diff:
1. Constants and metadata: add `APP_LEAD`, set `lang="id"`, homepage title "Bisai · Atur giliran mabar badminton". Copy `docs/design/02-homepage/hero-phone.png` to `public/hero-phone.png` and `docs/design/brand/svg/hanzi-bisai.svg` to `public/hanzi-bisai.svg`.
2. Homepage skeleton: single 640px column, sticky frosted nav with progress line, hero (h1, lead, chips), form card, static phone image, statement, three step cards, CTA, footer. Static first, no motion yet. Remove `HeaderBand` and `CourtTexture` from the homepage (delete the components if unused elsewhere).
3. Motion: one client component that ports the prototype's `<script>` (progress, reveal, words, parallax) with `prefers-reduced-motion` and `?static=1` handling. Stacking cards are CSS `position: sticky`. No animation libraries.
4. Form behaviour: day-aware default session name after hydration, pending state on the button.
5. §7.2 link moment: `createSession` redirects with `?new=1`; "Sesi kamu siap" bottom sheet with Salin link / Bagikan ke WhatsApp / Nanti saja; strip the query with `router.replace`; add "Bagikan link" to the `AppHeader` menu.
6. §7.1 Sesi kamu: localStorage write on the session page, `getSessionSummaries` server action, chips in the form card after hydration, nothing rendered when empty.
7. §7.3 result toast after `submitResult`.
8. Sweep: no English strings on the homepage, no uppercase mono labels, alt text on the hero image, `aria-label` on icon-only controls.

Constraints:
- The phone in the hero is the static `hero-phone.png` via `next/image` with `priority` and explicit width/height. Do not rebuild it in React.
- Floating cards around the phone are real DOM, shown from 960px only.
- Don't add dependencies. The 比赛 in the footer is `hanzi-bisai.svg`, not a CJK web font.
- Don't touch the matchmaking engine or the Prisma schema. `getSessionSummaries` is a read-only action.
- Keep `APP_DESCRIPTION` for meta/OG; the hero uses `APP_LEAD`.

When done, run `npm run build` and `npm test`, open the homepage at 390px and 1440px, take screenshots (also with `?static=1`), walk through creating a session → link sheet → back to homepage → Sesi kamu chip, and go through the acceptance checklist in spec §9 item by item, telling me which pass and which don't.
