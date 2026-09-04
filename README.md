# Bisai

Host runs a live open-play session from their phone: adds players, creates matches, enters results. Rotation-fair matchmaking with optional skill balancing. See [docs/badminton_app_implementation_brief.md](docs/badminton_app_implementation_brief.md) and [docs/session_flow_wireframe.html](docs/session_flow_wireframe.html).

## Stack

Next.js (App Router) + Tailwind, Prisma 7 (driver adapter, `prisma.config.ts`), Postgres on Railway.

## Local development

```bash
npm install
docker start badminton-pg 2>/dev/null || docker run -d --name badminton-pg \
  -e POSTGRES_PASSWORD=badminton -e POSTGRES_DB=badminton -p 5433:5432 postgres:16-alpine
npx prisma migrate dev
npm run dev
```

`.env` points at the local container (`postgresql://postgres:badminton@localhost:5433/badminton`).

## Deploy to Railway

1. Create a Railway project with a Postgres service and a service from this repo.
2. Set `DATABASE_URL` on the app service to the Postgres connection string.
3. Build command: `npm run build` (runs `prisma generate` first). Start: `npm start`.
4. Pre-deploy/release command: `npm run db:deploy` (`prisma migrate deploy`).

## Matchmaking engine

Pure functions in `src/lib/engine/` — no DB or framework imports, fully covered by tests:

- `matchmaking.ts` — eligible pool, fairness sort (matches played, then last played, random tie-break), side combos, gender-rule filter, combo scoring (skill 3 : variety 1), no-repeat rule, `generateMatchDraft` orchestrator
- `elo.ts` — tier-seeded ratings (800/1000/1200/1000), team-average ELO, per-player K (40 first 5 matches, then 20)
- `result.ts` — `applyMatchResult`: counters, last-played stamp, rating updates

```bash
npm test
```

Notes on decisions the brief left open:

- `Player.gender` (`male`/`female`/`unspecified`) was added to the schema — the `same_gender_only` rule can't be enforced without it. `unspecified` fails the strict rule rather than silently passing.
- Pair-history counts include pending matches as well as completed ones.
- ELO K-factor uses each player's `matchesPlayed` *before* the match is counted, so the 5th match still gets K=40.

## App structure

- `src/app/page.tsx` — host registration (name + session name → private session link)
- `src/app/s/[sessionId]/` — session home, draft modal, score entry, options sheet (the 5 wireframe screens)
- `src/app/actions.ts` — server actions: create session, add/edit player, generate/confirm match draft, submit result, update settings
- `src/lib/mappers.ts` — Prisma ↔ engine/DTO mapping

## Remaining

Deploy to Railway (needs a Railway account/project), then run the full flow on the real URL and hand to a host.
