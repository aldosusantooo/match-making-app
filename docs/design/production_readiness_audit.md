# Badminton session app: production-readiness audit

Audited 2026-09-04 against https://match-making-app-production.up.railway.app/ by walking the full host flow (create session, add 6 players, house rules, create match, swap, record result, edit player, 404s) at mobile and desktop widths, plus inspecting head tags, fonts, headers, and storage.

## A. Things that read as "AI-built / unfinished" (fix first, highest impact per hour)

1. **Default Next.js favicon.** `/favicon.ico` is the 25.9 KB create-next-app icon. No apple-touch-icon, no manifest, no theme-color. On a phone, Add to Home Screen shows a generic icon. For a phone-first tool this is the first thing a host sees.
2. **Default Next.js 404 page** ("404 | This page could not be found"). A wrong or expired session link shows the same. Needs a branded not-found page with a "Start a new session" CTA and a specific "This session link isn't valid" message.
3. **No product name.** Title tag, header, and H2 all say "Badminton session", which is a description. Name it, add a small wordmark or mark in the header band, use the name in the title tag ("Friday open play · <Name>").
4. **Railway subdomain URL.** `match-making-app-production.up.railway.app` is the single cheapest credibility fix. Buy a short domain.
5. **No Open Graph / Twitter meta.** Hosts will paste this into WhatsApp groups. Right now the preview is a bare URL. Add og:title, og:description, og:image (1200x630), and a per-session title.
6. **The "court lines" background motif reads as a rendering glitch.** The faint rectangle and center line run behind and through content: through the intro sentence, form labels, and the New match sheet. Either make it unmistakably a court (confined to the header band or empty areas, correct proportions) or remove it.
7. **Three font families and mono uppercase labels everywhere.** Inter + Space Grotesk + IBM Plex Mono. Tracked uppercase mono for PLAYERS, YOUR NAME, START SESSION, House rules, WHO WON?, Collapse players is the strongest "dev dashboard" tell. Keep two families; use mono only for numbers (scores, match number, timers).
8. **Native unstyled `<select>` elements** for Skill, Gender, and Swap. They render differently on every OS and break the design. Replace with segmented controls or chips (Beginner / Intermediate / Advanced / Unknown; M / F / –) and a proper player-picker sheet for swap.
9. **Swap control glyph.** The swap is a `<select>` with `appearance:none`; the icon before "swap" renders like a broken character. Use a real icon button that opens a picker.
10. **Desktop layout.** A 384px column pinned in a blank 1440px page, header band left-aligned with no framing. Either center it in a phone-shaped frame on a subtle background, or give desktop a two-column layout (players left, matches right). Hosts will sometimes run this from a laptop at the venue.
11. **Inconsistent wording and casing.** "Skill: unknown" (add form) vs "Unknown" (edit form). "Dewi & Agus" (match title) vs "Dewi, Agus won" (result line). "Match 01 result" vs "MATCH 01". Buttons uppercase via CSS but "House rules" not. Pick one convention per element type.
12. **Empty states are one gray sentence in a dashed box.** Use the first-visit empty state to teach the flow: Add players → Create match → Record result, with an inline "Add first player" action.
13. **Zero motion.** Sheets appear instantly, rows pop in, status changes snap. 150–200 ms transitions on sheet open, row add, and Active toggle are a strong "real app" signal.
14. **Flat visual hierarchy.** Everything is the same weight and card style. The on-court match should be the hero (larger, two sides side by side with a VS, elapsed time), finished matches should compress to one line.
15. **Only one state color.** Dark green + off-white. Add one accent for live/on court (e.g. amber) and one for winner so status is readable from across the hall.
16. **Copy voice is mixed.** Casual ("No one's on court yet") next to system ("Not enough available players — need 4, have 2"). Pick one voice. Also remove em dashes from UI strings; they read as AI-written.
17. **Single tiny icon.** One shuttlecock glyph next to ON COURT, nothing else. Either commit to a small consistent icon set or drop icons entirely.

## B. Functional gaps that make it feel non-production (pilot blockers)

18. **No way back to your session.** Home page has no recent sessions, nothing in localStorage, no cookie. Close the tab and the session is gone unless the host bookmarked it. Fix: store session IDs locally and show "Your sessions" on the home page; add a "Copy link / Share to WhatsApp" button in the session header; show the link once right after creation.
19. **No pending or loading states, and inputs get dropped.** Adding five players in quick succession silently lost two because the form closes and re-renders after each server action with no disabled state or spinner. Need optimistic UI (or at least disable + spinner) and keep the Add form open for bulk entry. Hosts add 12–20 players at the start of a session.
20. **Stale error banner.** "Not enough available players — need 4, have 2" stayed on screen after the match ended and all six players were free. Clear errors on any state change.
21. **Create match is enabled when it cannot succeed** (0 players, or fewer than 4 free). Disable it and show the reason inline ("Need 2 more free players") instead of failing after the tap.
22. **Layout shift in the result sheet.** Tapping "+ Add score" pushes the winner options down; I tapped the wrong winner because of it. Reserve the space or place the score input below without moving the winner buttons.
23. **Static score placeholder "21 – 18"** regardless of which side won. Blank it, or mirror it to the selected winner.
24. **"Balanced by skill" tag shows when every player is Unknown.** It's not true. Show "Skill unknown · balanced by rotation" or hide the tag.
25. **Player list hides the fairness data.** No matches played, no wait time, no "next up" order, even though the brief lists matches played as a home-screen field. The host cannot see fairness working, which is the whole reason to use this over a whiteboard. Show "2 played · waiting 12 min" per row and sort by next-up.
26. **No player removal**, only Mark inactive. A typo'd name lives forever.
27. **No undo or edit for a saved result.** A wrong tap permanently skews the ELO. Add "Edit result" on FINAL cards for the last few matches.
28. **No post-creation orientation.** After Start session you land on an empty screen with no "here's your link, here's what to do next" moment.
29. **No match timestamps or elapsed time.** Hosts decide when to call a game by time. Show "On court · 14 min".
30. **No session end.** Add "End session" that produces a shareable summary (matches played, wins per player) for the WhatsApp group. This is also the growth loop.
31. **Private link is the only auth, and it's read-write.** Fine for pilot, but anyone with the URL can edit. Cheap improvement: separate host URL from a read-only view URL that players can open to see who's on and who's next.
32. **Verify multi-court rendering.** Only one concurrent match was tested. Confirm 2–3 on-court cards read clearly, newest on top, and that finished matches don't push live ones off screen.

## C. Production hygiene

33. **PWA basics**: manifest.json, apple-touch-icon, theme-color matching the header green, `display: standalone`. Cheapest "feels like a real app" upgrade for a phone-first tool.
34. **Bad-signal handling.** Sports halls have poor reception. Show "Saving…" and a clear failure toast with retry instead of silent loss.
35. **Accessibility basics.** Sheets lack `role="dialog"` and `aria-modal`, no focus trapping, Active pill has no `aria-pressed`. Add labels and focus management.
36. **Active pill looks like a badge, not a toggle.** Nothing signals it's tappable. Use a switch or an explicit Active / Resting segmented toggle.
37. **Hidden gestures.** Row tap edits, pill tap toggles; neither is signposted. Add a chevron or edit affordance.
38. **Touch targets.** "House rules", "+ Add", "swap", "Collapse players" are ~24–28 px tall. Minimum 44 px.
39. **Security headers.** No CSP, X-Frame-Options, Referrer-Policy (server: railway-hikari). Add via `next.config` headers.
40. **Footer / feedback channel.** A small "Feedback" link (WhatsApp or form) and a version string. Pilot hosts need somewhere to report problems.
41. **Privacy line.** You store names and gender. One sentence on what's stored and for how long, plus a "Delete session" action.
42. **Date and locale.** Header shows "Sep 4" only; add weekday and start time. Consider a Bahasa Indonesia toggle for the target hosts.
43. **Analytics and error monitoring** (Plausible/PostHog + Sentry) so you can tell whether pilot hosts actually use it and where it breaks.
44. **Header content.** "Sep 4 · 6 players" is thin. Add matches played and courts running so the band earns its space.

## Suggested order

Week 1 (perception, ~1–2 days): 1, 2, 3, 4, 5, 7, 8, 13, 33.
Week 1 (pilot blockers): 18, 19, 20, 21, 22, 25, 27.
Week 2: everything else in B, then C.

---

# Visual benchmark (added 2026-09-04)

Compared against two direct competitors with live UIs: PB Queue (pbqueue.com) and PickleQ (pickleq.app), both open-play queue managers for pickleball. Ranked by visual impact.

1. **The court is the hero, not a text line.** PB Queue draws the actual court and places players on it as colored initial avatars, with a live green dot and a ticking timer. Ours shows "Rizky & Sari vs Dewi & Agus" in 15px text. Turn the decorative court-lines motif into the functional match card: a court rectangle, two players per side, net line in the middle, timer top-right.
2. **Type scale.** Competitors anchor each screen with one big element (session name ~36–40px, bold) and keep metadata small. Ours runs everything between 11px and 18px so nothing leads the eye. Session name 28–32px in Space Grotesk, meta 13px, section labels 12px.
3. **Identity: mark + wordmark.** Both competitors have a logo in the top-left and a name. Ours has neither. A shuttlecock-derived mark in the green, a name, favicon, and OG image all come from the same asset.
4. **Per-player color and avatars.** Colored initial circles make a roster scannable from across a hall and make the court card readable at a glance. Ours is plain text rows.
5. **Buttons and controls.** Competitors: sentence case, 16px semibold, generous radius, clear primary/secondary. Ours: 12px uppercase tracked mono on every button, which reads as a terminal. Reserve mono for numbers (score, timer, match number).
6. **Live and state signals.** Green pulsing dot + elapsed timer on live courts, colored tier dot + abbreviation (INT / ADV) + "3 games" at the row end, "resting" in muted text. Ours has a static ON COURT label and "· Unknown".
7. **Depth and layering.** Soft shadows, cards on a tinted surface, toasts that slide in ("Balanced matchup ready"). Ours is flat 1px borders plus a faint motif that reads as a glitch.
8. **Motion.** Timer ticking, toasts, sheet transitions, row fades. Ours has none.
9. **Native selects replaced by chips and pickers.** Tier as a chip row, gender as a segmented control, swap as a bottom-sheet list with avatars.
10. **Landing page separate from the app.** Both competitors sell the product in three seconds with a device mockup, a one-line promise, and "No sign-up · Works offline" trust chips. Our home page is the create form.
11. **Header band.** Ours is a heavy dark-green block with an 18px title. Competitors keep the header on the light surface with big type and let the primary button carry the color.
12. **Tablet/desktop layout.** PB Queue is designed for a tablet on a bench: courts side by side, roster below. Ours is a 384px phone column.
13. **Empty states.** Dashed "+ Add court" box with a big label vs our small gray sentence.
14. **Consistent icon set.** Pencil, clock, plus, chevron from one family. Ours has a single shuttlecock glyph.
15. **Texture and photography.** PickleQ uses a real court photo hero; PB Queue a subtle grid on dark sections. Matters for the landing page, optional inside the app.

Keep: the forest green + cream palette is distinctive (competitors are blue/navy and bright green). Add an amber or coral live accent and tier colors; don't change the base.
