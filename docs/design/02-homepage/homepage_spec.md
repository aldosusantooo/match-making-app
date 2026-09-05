# Homepage redesign · implementation spec

Status: approved (2026-09-04). Scope: the homepage (`src/app/page.tsx`) plus the three small features the homepage promises (see §7). Session screen, matchmaking, data model: untouched except where §7 says.

Reference files (this folder):
- `homepage_prototype.html` — the approved page as working HTML/CSS/JS. **Source of truth** for layout, sizes, colours, copy and motion. Open it in a browser and scroll; the animations only show live. It reads the mark from `../brand/svg/bisai-mark.svg`.
- `homepage-desktop.png`, `homepage-mobile.png` — static renders at 1440 and 390.
- `hero-phone.png` — the hero device mockup including the dark frame, exported at 3× (1092 × 1941 → render at 364 × 647 CSS px), transparent background, no drop shadow (add it in CSS: `filter: drop-shadow(0 40px 80px rgba(0,0,0,.35))`). Ship this as a static image; do not rebuild the phone in React.
- `../brand/BRAND.md` — name, mark, colours, type, locked copy. Wins on any brand question.
- `../brand/svg/hanzi-bisai.svg` — 比赛 outlined to a path (uses `currentColor`), for the footer eyebrow. Don't load a CJK web font for two characters.

---

## 1. What changes, in one paragraph

The homepage stops being a bare form. It becomes a single centred column (max 640px, identical on mobile and desktop) with: a frosted sticky nav and a scroll-progress line, a two-line hero headline, a one-sentence lead, three trust chips on one line, the create-session form in a card (with "Sesi kamu" chips for returning hosts and a day-aware default session name), a tilted static phone mockup with three floating state cards (desktop only), a scroll-revealed statement, three "Cara pakai" cards that stack over each other as you scroll, a green CTA block, and a footer with the wordmark. All copy is Indonesian. The page uses native scroll and IntersectionObserver; no animation library.

## 2. Layout and rhythm

- Content column: `width: min(640px, calc(100% - 40px))`, centred. **Same on every breakpoint.** The nav is the one exception (`min(1120px, …)`).
- Vertical rhythm: hero `44px 0 40px` (72px top from 960px up); statement `96px 0 40px`; steps `40px 0 120px`; CTA `20px 0 90px`; footer `34px 0 40px`.
- Cards: radius 22–24px, border `1px rgba(23,35,28,.06)`, shadow `0 1px 2px rgba(23,35,28,.05), 0 24px 50px -30px rgba(23,35,28,.35)`.
- Tokens: reuse the app's Tailwind theme from pass 1 (`--bg`, `--ink`, `--muted`, `--faint`, `--line`, `--green`, `--green-soft`, `--live`, `--live-soft`, `--live-text`, court gradients, avatar palette). Add only `--mint: #B8F1CC` if not already present.
- Motion easing everywhere: `cubic-bezier(.22,1,.36,1)`.

## 3. Sections, top to bottom

### 3.1 Progress line
Fixed, top 0, height 2px, `--green`, width = scroll progress. An 8px `--live` dot with a 4px `rgba(245,158,11,.25)` ring rides the right end. `z-index` above the nav.

### 3.2 Nav (sticky)
`position: sticky; top: 0`, background `rgba(246,247,243,.78)` with `backdrop-filter: blur(14px)`, bottom border `1px rgba(23,35,28,.06)`, height 60px.
Left: mark (24px, radius 7) + "Bisai" (Space Grotesk 15/700, green). Centre (≥960px only): links "Cara pakai" → `#cara`, "Kenapa Bisai" → `#kenapa`, "Tentang" → `#footer`, 14px muted. Right: primary button "Mulai sesi" (small: 9px 14px, 13px) → `#form`.
Reuse `AppHeader`'s mark; do not reuse its menu.

### 3.3 Hero
Background layer (`aria-hidden`, `pointer-events: none`): two SVG court-line layers (`stroke #06603F`, opacity .13 and .12, 1.5px) 1600px wide centred, moving at parallax speeds 0.18 and 0.32 (see §5), plus a radial glow `radial-gradient(closest-side, rgba(6,96,63,.10), transparent 70%)` 900 × 520 centred at the top. Copy the two `<svg>`s from the prototype verbatim. **This replaces `CourtTexture` on the homepage; delete `CourtTexture` and `HeaderBand` if nothing else imports them.**

Content, in order:
1. `h1`: "Ribet pakai AI," on line one (ink), "Mending pakai Bisai." on line two (green, `display: block`). Space Grotesk 700, `clamp(38px, 7.5vw, 64px)` (56px from 960px), line-height 1.02, letter-spacing -0.03em. No eyebrow pill above it.
2. Lead: **"Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main."** 16.5px, line-height 1.55, muted. This is a new constant `APP_LEAD`; `APP_DESCRIPTION` (with "Tanpa login, tanpa install.") stays for meta/OG.
3. Trust chips, **one line, no wrap**: ✓ Tanpa login · ✓ Tanpa install · ✓ Jalan dari HP. Chip: white, 1px `--line`, radius 999, padding 6px 10px, Inter 12/500, check icon 12px green. Container `flex-wrap: nowrap; overflow: hidden`.
4. Form card (see 3.4).
5. Phone mockup (see 3.5).

Reveal order (staggered fade-up, §5): h1 → lead → chips → form → mockup.

### 3.4 Form card (`id="form"`)
Padding 20px, margin-top 22px.
- Title "Buat sesi baru" (Space Grotesk 18/700).
- Hint "Kamu dapat link privat. Simpan di grup WhatsApp, buka lagi kapan saja." (13px muted).
- **Sesi kamu chips** (only when there are recent sessions; see §7.1): green-soft chips, 8px 12px, radius 10, Inter 13/600 green: `• Mabar Jumat · 8 pemain · live` where the mono part is 11px. Amber dot when the session is ACTIVE and was created in the last 8 hours. Tap → the session.
- Two fields side by side (grid 1fr 1fr, gap 12): "Nama kamu" (`name="hostName"`, placeholder "Aldo", `autocomplete="name"`), "Nama sesi" (`name="sessionName"`, **default value "Mabar {Hari}"** using the Indonesian weekday of the client's clock: Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu; set client-side after hydration so SSR doesn't bake in the server's day). Fields: height 48, 1.5px `--line`, radius 12, 16px text; focus: green border + `0 0 0 4px rgba(6,96,63,.12)`. Labels: Inter 12/600 muted.
- Button "Mulai sesi": full width, height 50, 16/600, radius 14, primary. Pending state: disabled + "Membuat sesi…". Keep `action={createSession}`.
- Fine print: "Gratis. Nama pemain cuma disimpan selama sesi berjalan." 12px faint, centred.
- Keep `required` on both fields. Remove all uppercase mono labels.

### 3.5 Phone mockup
`<Image src="/hero-phone.png" width={364} height={647} priority alt="Layar sesi Bisai: match yang sedang berjalan dan daftar pemain yang menunggu" />` with `filter: drop-shadow(0 40px 80px rgba(0,0,0,.35))`, centred, `transform: rotate(-3deg) translateY(6px)` from 960px (`rotate(-2deg)` below). Wrapper `position: relative; padding: 24px 10px 14px` (34px 0 20px from 960px).

Three floating cards, **≥960px only** (`display: none` below), absolute to the wrapper, white, radius 14, shadow `0 18px 40px -20px rgba(23,35,28,.35)`, padding 10px 12px, 12.5px text, each drifting at its own parallax speed:
- `left:-150px; top:60px`, speed -0.06: amber-soft 30px tile with an 8px amber dot; **"Match berikutnya siap"** / "Budi, Nina, Tono, Wira".
- `right:-170px; top:300px`, speed 0.05: two stacked 24px avatars (SA violet, AG blue); **"Sari & Agus menang"** / "21–17 · Match 04".
- `left:-160px; bottom:120px`, speed -0.04: green-soft tile with a check; **"Semua sudah main 2x"** / "Nunggu paling lama: 6 menit".
Build these as DOM (they're three divs), not as part of the image. Avatars use the existing `PlayerAvatar` styling.

### 3.6 Statement (`id="kenapa"`)
Pill eyebrow (green dot variant): "Kenapa Bisai". Then the paragraph in Space Grotesk 500, `clamp(26px, 4.6vw, 44px)`, line-height 1.18, letter-spacing -0.02em:

> Mabar itu harusnya soal main, bukan soal ngatur. Bisai ingat siapa yang sudah main, siapa yang nunggu paling lama, dan siapa yang belum pernah jadi partner. **Host tinggal tekan satu tombol.**

Every word is a `<span>`; words start at `rgba(23,35,28,.16)` and turn ink as scroll progress crosses them (§5). The bold sentence turns **green** instead of ink.

### 3.7 Cara pakai (`id="cara"`)
Header: `h2` "Cara pakai." (ink) + "Tiga langkah, satu malam." (faint, `display:block`), Space Grotesk 700 `clamp(30px, 5vw, 44px)`. Paragraph: "Nggak ada yang perlu didownload pemain. Mereka cukup lihat layar HP kamu, atau nunggu dipanggil." 16px muted.

Three cards in a grid with 18px gap, each `position: sticky` with `top: 84px / 100px / 116px` so they stack over each other. Card = text block (padding 30px 30px 10px) above a visual block (padding 18px 20px 24px, background `linear-gradient(180deg, rgba(6,96,63,.04), rgba(6,96,63,.09))`, min-height 260px, with an inset 1.5px court rectangle and centre line at `rgba(6,96,63,.10)`).

Text block: number badge (mono 11/600, `.12em`, green on green-soft, radius 999, 5px 10px), `h3` Space Grotesk 26/700, `p` 15px muted.

1. **01 · "Buat sesi, dapat link."** "Isi nama kamu dan nama sesi. Bisai kasih link privat yang bisa kamu tempel di grup WhatsApp, jadi sesi nggak hilang kalau tab ketutup." Visual: link card (mark 30px, `bisai.id/s/mabar-jumat-x7k` in mono 13 green, a 34px WhatsApp-green "WA" tile) plus a wrapping chip row: "Salin link", "Bagikan ke WhatsApp", "✓ Disimpan di Sesi kamu" (green).
2. **02 · "Tambah pemain, kasih level."** "Ketik nama, pilih level kalau tahu. Yang datang telat tinggal ditambah, yang istirahat tinggal di-nonaktifkan. Nggak perlu ulang dari awal." Visual: a roster card with Sari (Mahir, red dot), Agus (Menengah, amber), Budi (Belum tahu, grey), Wira (Belum tahu · istirahat, 55% opacity), each "0 main · baru gabung". Reuse `RosterRow` styling, static data.
3. **03 · "Tekan satu tombol, catat hasil."** "Bisai pilih empat orang yang paling lama nunggu, bagi jadi dua sisi yang seimbang, dan nggak ngulang pasangan yang sama. Selesai main, ketuk siapa yang menang." Visual: a small live court (reuse `LiveMatchCard`'s court block, static), a finished row (Sari & Agus MENANG 21–17 vs Rizky & Tono, M04), and an amber chip "↑ Rating Sari & Agus naik · pasangan berikutnya menyesuaikan".

Tier labels in Indonesian on this page: Pemula / Menengah / Mahir / Belum tahu. (The session screen keeps whatever it uses today; localisation of the app UI is a later pass.)

### 3.8 CTA
Card, background `--green`, white text, padding 34px 26px, centred, with an inset `rgba(255,255,255,.12)` court rectangle + centre line. `h2` "Mabar minggu ini, coba Bisai." (Space Grotesk 700 `clamp(28px, 5vw, 40px)`), `p` "Satu HP, satu link, semua kebagian main." (75% white), button "Buat sesi sekarang" (white bg, green text, height 50, radius 14) → `#form`.

### 3.9 Footer (`id="footer"`)
Top border `--line`. Left: mark 40px + "Bisai" (Space Grotesk 26/700) with the eyebrow beneath: `hanzi-bisai.svg` at 10px cap height + " · OPEN PLAY" (Space Grotesk 10/700, `.28em`), green. Right: links row (13px muted): "Kirim masukan via WhatsApp" (`https://wa.me/<NEXT_PUBLIC_FEEDBACK_WA>`), "Privasi" → `#privasi`, "Dibuat di Jakarta", and the version from `package.json` in mono 12. Below: `<p id="privasi">` "Nama pemain dan hasil match disimpan supaya sesi bisa dibuka lagi lewat link. Host bisa hapus sesi kapan saja." 12px faint. A ghosted 比赛 (`hanzi-bisai.svg`, ~220px tall, `rgba(6,96,63,.05)`) bleeds off the bottom-right; `overflow: hidden` on the footer.

## 4. Copy (locked; all strings as written)

| Where | String |
|---|---|
| `<title>` | Bisai · Atur giliran mabar badminton |
| `<html lang>` | **id** (change from "en" in `layout.tsx`) |
| H1 | Ribet pakai AI, / Mending pakai Bisai. |
| Lead (`APP_LEAD`) | Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main. |
| Meta/OG (`APP_DESCRIPTION`, unchanged) | Aplikasi buat host mabar badminton. Atur giliran main otomatis dan adil, semua kebagian main. Tanpa login, tanpa install. |
| Chips | Tanpa login · Tanpa install · Jalan dari HP |
| Nav | Cara pakai · Kenapa Bisai · Tentang · Mulai sesi |
| Form | Buat sesi baru · Kamu dapat link privat. Simpan di grup WhatsApp, buka lagi kapan saja. · Nama kamu · Nama sesi · Mulai sesi · Membuat sesi… · Gratis. Nama pemain cuma disimpan selama sesi berjalan. |
| Sesi kamu | Sesi kamu (label, only if the list has entries) |
| Statement, steps, CTA, footer | exactly as in §3.6–3.9 |

No exclamation marks, no emoji, no em dashes, sentence case.

## 5. Motion (all in one small client component, `useEffect`, native scroll)

- **Progress**: on scroll, `width = scrollTop / (scrollHeight - clientHeight)`.
- **Reveal**: elements with `.reveal` start `opacity:0; translateY(22px)`; an IntersectionObserver (threshold .15) adds `.in` once → `opacity:1; transform:none`, transition .8s ease. Stagger via `data-d="1..4"` → delay .08s × n. Unobserve after reveal.
- **Words**: for the statement, `t = clamp((0.8·vh − rect.top) / (rect.height + 0.3·vh), 0, 1)`; the first `round(t · n)` spans get `.on`.
- **Parallax**: elements with `data-speed` get `translateY(scrollY · speed)` in a passive scroll handler (rAF-throttled). The two SVG layers keep their `translateX(-50%)`.
- **Stacking**: pure CSS `position: sticky` on the three step cards. No JS.
- **Live dot** in the mockup card is part of the image; the floating cards have no animation of their own beyond parallax.
- `prefers-reduced-motion: reduce`: reveals visible immediately, words all `.on`, no parallax, `scroll-behavior: auto`. Also honour it when `?static=1` is in the URL (useful for screenshots).
- Do **not** add Lenis, Framer Motion or GSAP. The prototype's `<script>` is ~40 lines; port it.

## 6. Assets to add

- `public/hero-phone.png` ← `hero-phone.png` (this folder).
- `public/hanzi-bisai.svg` ← `../brand/svg/hanzi-bisai.svg` (or inline the two paths in a component; it's `currentColor`).
- Brand icons/OG already shipped in pass 1.

## 7. Features the homepage promises (in scope, small)

### 7.1 Sesi kamu (returning hosts)
- On the session page (client, in `SessionView` or a tiny sibling effect), write `{ id, name, createdAt }` to `localStorage["bisai.sessions"]` (array, newest first, max 5, dedupe by id) on mount.
- On the homepage, a client component reads the list, then calls a new server action `getSessionSummaries(ids: string[])` → `{ id, name, status, playerCount, createdAt }[]` (drops ids that no longer exist). Render up to 3 chips as in §3.4. If the list is empty, render nothing (no label, no gap).
- Never render the chips during SSR (localStorage isn't there); render after hydration to avoid a flash.

### 7.2 The link moment (post-creation)
- `createSession` redirects to `${sessionPath(id)}?new=1`.
- On the session page, when `new=1` is present, open a bottom sheet once: title "Sesi kamu siap", the full URL in a read-only field (mono), buttons **"Salin link"** (`navigator.clipboard.writeText`, then label flips to "Tersalin ✓" for 2s) and **"Bagikan ke WhatsApp"** (`https://wa.me/?text=` + encoded "Mabar {name} · {url}"), and a "Nanti saja" dismiss. Strip `?new=1` from the URL with `router.replace` after opening so a refresh doesn't reopen it.
- Add a permanent **"Bagikan link"** item to the `AppHeader` menu that opens the same sheet.
- Sheet styling: same tokens as the existing options sheet.

### 7.3 Result toast
- After `submitResult` resolves, show a toast bottom-centre above the sticky CTA for 4s: winners' two avatars + "**{A} & {B} menang** · Match {NN}". If the DTO exposes player ratings before and after, append "· rating naik" for the winners; if not, omit that phrase. Do not invent numbers.
- Toast: white, radius 14, shadow as the floating cards, slides up 12px + fades in (200ms), respects reduced motion. Dismiss on tap.

## 8. Cleanup

- Delete `HeaderBand` and `CourtTexture` components if the homepage was their last consumer.
- Remove the English strings from `page.tsx` ("Start a session and get a private link…", "Your name", "Session name", "Start session").
- Suggest (do not do without confirmation): move the stale root files `screen1_session_home_v2.html`, `screen2_create_match_v2.html`, `screen3_score_entry_v2.html`, `screen4_house_rules_v2.html`, `design_spec_for_claude_code.md` (which still calls the app "Court Line") into `docs/archive/`.

## 9. Acceptance checklist

- [ ] At 390px and at 1440px the page is a single centred column and matches `homepage-mobile.png` / `homepage-desktop.png` in order, sizes and colours (±2px). Floating cards appear only from 960px.
- [ ] No eyebrow pill above the H1; chips are on one line at 390px.
- [ ] Session name field defaults to today's Indonesian weekday ("Mabar Jumat" on a Friday) after hydration.
- [ ] Creating a session lands on the session page with the "Sesi kamu siap" sheet; Salin link copies; Bagikan opens wa.me with the URL; the sheet doesn't reopen on refresh; "Bagikan link" is in the header menu.
- [ ] Returning to the homepage shows the session under Sesi kamu with the right player count; deleting it from the DB removes the chip.
- [ ] Saving a result shows the toast with the winners' avatars.
- [ ] Progress line, reveals, word reveal, parallax and stacking cards all work; all are off under `prefers-reduced-motion` and with `?static=1`.
- [ ] `lang="id"`, title "Bisai · Atur giliran mabar badminton", `APP_LEAD` used on the hero, `APP_DESCRIPTION` still used for meta/OG.
- [ ] No English UI strings remain on the homepage; no uppercase mono labels on buttons or fields.
- [ ] Lighthouse: Performance ≥ 90 (hero image `priority`, no layout shift from the phone), Accessibility ≥ 90.
- [ ] `npm run build` and `npm test` pass; no console errors.
