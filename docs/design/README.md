# docs/design

Design source of truth for Bisai. Each numbered folder is one implementation pass: a spec, the reference mockups, and the Claude Code prompt that was used. `brand/` is shared by all passes.

| Folder | What | Status |
|---|---|---|
| `brand/` | Name, mark, colours, type, locked copy (`BRAND.md`); SVG masters, PNG icons, favicon, OG image, wordmarks, `hanzi-bisai.svg` | Locked |
| `01-session-screen/` | Session home screen (`/s/[id]`) visual redesign: spec, target mockup, court and finished-row explorations, prompt | Shipped |
| `02-homepage/` | Homepage redesign + link moment, Sesi kamu, result toast: spec, working prototype, renders, hero phone PNG, prompt | Ready to implement |
| `production_readiness_audit.md` | The original audit (Sep 2026) both passes come from; remaining items are the backlog | Reference |

Rules of the road:
- `BRAND.md` wins on any brand question. A pass spec wins on layout for its screen. The prototype/mockup HTML wins on exact values.
- Copy in specs is locked as written. Change it in the spec first, then in code.
- New pass → new numbered folder with `*_spec.md`, reference files, and `claude_code_prompt_*.md`. Don't edit a shipped pass's spec except to mark deviations.

Backlog (from the audit, not yet scheduled): create-match and result sheet restyle, tablet two-column layout, player removal, undo/edit result server-side, optimistic add-player, custom domain (bisai.id), analytics + error monitoring, EN toggle.
