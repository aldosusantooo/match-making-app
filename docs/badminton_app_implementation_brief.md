# Badminton session app — implementation brief

## Goal
Ship a working pilot this week. Host runs a live open-play session from their phone: adds players, creates matches, enters results. App handles rotation-fair matchmaking with optional skill balancing. Deploy to a real URL, hand to a real host, gather feedback. Adoption and speed to pilot matter more than feature completeness.

## Stack
- Next.js (App Router) + Tailwind
- Prisma ORM
- Postgres, hosted on Railway
- Deployed on Railway

## Data model

**Host**
- id, name, contact, created_at

**Session** (belongs to Host)
- id, host_id, name/date, status (active / closed)
- settings: gender_rule (mixed / same_gender_only / singles_only), skill_matchmaking_enabled (bool, default true)

**Player** (belongs to Session)
- id, session_id, name
- skill_tier (beginner / intermediate / advanced / unknown)
- rating (seeded from tier, updates after each match if skill matchmaking is on)
- status (active / inactive)
- matches_played (counter), last_played_at (drives fairness sort)

**Match** (belongs to Session)
- id, session_id, match_number, status (pending / completed)
- created_at, completed_at

**MatchPlayer** (join table: Match ↔ Player)
- match_id, player_id, side (A / B)

**MatchResult** (belongs to Match)
- match_id, winning_side, score (optional)

No separate pair-history table. Times-partnered / times-opposed are computed on the fly from past Matches + MatchPlayers each time a new match is generated — cheap at pilot session sizes, avoids a second data source to keep in sync.

ELO seeding: Beginner 800 / Intermediate 1000 / Advanced 1200 / Unknown 1000. K-factor is per-player: 40 for a player's first 5 matches, then 20.

## Matchmaking engine — build this first, as pure functions, before any UI

1. **Build eligible pool:** players where `status == active` AND not currently in a match with `status == pending`.
2. **Check enough players:** need 4 for doubles / 2 for singles. If eligible pool is short, return an error.
3. **Sort by fairness:** `matches_played ASC, last_played_at ASC` (never-played sorts first). Ties at the cutoff broken randomly.
4. **Select who plays:** top N from the sorted pool.
5. **Generate valid side combinations:** for 4 players there are exactly 3 possible splits (AB|CD, AC|BD, AD|BC). Filter out any that violate `gender_rule`. If zero valid combos remain, return a conflict with options `["allow mixed for this match", "cancel"]` — don't silently break the rule or hard-fail with no path forward. Singles skips this step (side assignment is fixed for 2 players).
6. **Score each valid combo:**
   - `skill_score = -abs(avg_rating(side A) - avg_rating(side B))`, only if skill_matchmaking_enabled
   - `freshness_score = -(times_partnered(A1,A2) + times_partnered(B1,B2) + times_opposed(A1,B1) + times_opposed(A1,B2) + times_opposed(A2,B1) + times_opposed(A2,B2))`
   - `combo.score = W_SKILL * skill_score + W_VARIETY * freshness_score` (start weighting skill ~3:1 over variety, tune after watching real matches)
   - Hard rule: exclude any combo identical to the immediately preceding match, unless it's the only valid combo left
   - Pick the highest-scoring combo
7. **Present as draft**, host can override any player before confirming. On confirm, persist the Match as `pending` with final MatchPlayer rows.
8. **On result submission:** mark Match `completed`, increment `matches_played` and update `last_played_at` for all players in the match. If skill matchmaking is on, run the ELO update.
9. **ELO update** (per side, applied to both members equally):
   ```
   team_A = avg(rating of side A)
   team_B = avg(rating of side B)
   expected_A = 1 / (1 + 10^((team_B - team_A) / 400))
   expected_B = 1 - expected_A
   actual_A = 1 if side A won else 0
   actual_B = 1 - actual_A
   K = 40 if player.matches_played < 5 else 20   # per player, not per match
   delta = K * (actual - expected)
   player.rating += delta
   ```

## Build order
1. Prisma schema, migrate to Railway Postgres
2. Matchmaking engine as pure, tested functions — validate against fake player data before touching UI
3. API routes: create session, add/edit player, create match draft, confirm match, submit result
4. UI — the 5 screens (see wireframe file)
5. Deploy to Railway, run the full flow yourself with fake data
6. Hand to a real host

## UX principles
- Progressive disclosure: main screen stays minimal (player list + Create match button); gender rule and skill-matchmaking toggle live behind a collapsed Options panel
- Once the first match is created, the player list collapses into a summary bar so matches become the primary visible content
- Host registration: name only, returns a private session link — no password, no email verification

## Screens
Five screens, structure only (no visual style set): Session home, Create match (draft), Session home with a match live, Score entry, Options panel (bottom sheet). Full layout reference is in the accompanying wireframe HTML file.

## Cut from pilot
Court numbers, self-check-in, a queue view, fixed partners, player identity persisting across sessions.
