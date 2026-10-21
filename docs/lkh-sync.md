# Syncing LKH → portfolio

Goal: when something changes in LKH (the personal career dashboard and agent memory), the portfolio updates by itself, with the content framed for the roles being applied to.

## How it fits together

```
LKH (local)                       portfolio (Vercel + Atlas)
───────────                       ──────────────────────────
notes / memory ──► sync agent ──► POST /api/sync  ──► MongoDB ──► divyansh-rai.vercel.app
                   (maps + tailors)  Bearer SYNC_TOKEN
                        ▲
                        └──────── GET /api/sync/export (what's live now)
```

1. **Source of truth stays in LKH.** The portfolio's admin panel still works for quick edits, but anything synced from LKH is overwritten on the next sync, so edit those records in LKH.
2. **A sync agent** (a script or a Claude Code session run on your machine) reads LKH, decides what belongs on the portfolio, rewrites it for the target roles, and pushes a payload.
3. **The API applies it all-or-nothing:** every record is validated against `shared/schemas.ts` before anything is written. Each sync is recorded in the `sync_log` collection.

## The API (built and tested)

Enable it by setting `SYNC_TOKEN` (32+ random characters) in Vercel and in LKH's environment.

`POST /api/sync` with `Authorization: Bearer <SYNC_TOKEN>`:

```json
{
  "source": "lkh",
  "dryRun": false,
  "profile": { "name": "Divyansh Rai", "headline": "…", "focusAreas": ["…"], "socials": [] },
  "upsert": {
    "projects":     [{ "id": "lkh-<note-id>", "title": "…", "description": "…", "tags": ["…"], "featured": true }],
    "skills":       [{ "id": "lkh-agentic", "name": "Agentic AI", "icon": "bot", "skills": ["MCP"] }],
    "experience":   [{ "id": "lkh-tcs", "section": "Professional", "title": "…", "institution": "…", "dateRange": "…" }],
    "certificates": [], "achievements": [], "contributions": [], "directories": []
  },
  "delete": { "projects": ["lkh-old-note"] }
}
```

- `id` is yours to choose (letters, digits, `_`, `-`, up to 64 characters). Use LKH's own note ids with a prefix such as `lkh-` so re-running a sync **updates** records instead of duplicating them, and so synced records stay distinct from ones added by hand.
- Field names and limits are exactly those in `shared/schemas.ts`. `profile`, when sent, replaces the whole profile document.
- `dryRun: true` validates and reports what would change without writing.

`GET /api/sync/export` returns everything that's live, including `lastSync`, so the agent can diff before pushing.

CLI wrapper: `SYNC_URL=https://divyansh-rai.vercel.app SYNC_TOKEN=… npm run sync:push -- payload.json [--dry]` and `npm run sync:push -- --export`.

## Role tailoring (the agentic part)

The tailoring happens on the LKH side, before the push, so the portfolio stays a plain renderer:

1. LKH keeps a short **target-role brief** (e.g. "ML Engineer, LLM/agents, India/remote") alongside the career notes.
2. The sync agent ranks projects, skills and learnings against that brief. It sets `featured` on the best matches (these appear on the home page) and assigns `order` so the strongest come first.
3. It rewrites the headline, focus areas, about text and project `keyPoints` for the brief. It only rephrases facts already in LKH; it never invents metrics or claims.
4. It pushes with `dryRun: true` first and shows you the diff, then pushes for real once you approve.

Run it on demand ("sync my portfolio for ML Engineer roles"), or on a schedule (cron or a scheduled task) so the site tracks LKH automatically.

## What's needed to finish

- **LKH's format:** where it lives (folder of markdown? a database? an app with an API?) and what the career dashboard entries look like. The mapper is written against that.
- **Run location:** the agent must run where LKH is (your machine), because LKH isn't on GitHub. A scheduled local job or a Claude Code session on your machine both work.
- **`SYNC_TOKEN`:** generate it, set it in Vercel (sensitive) and in LKH's `.env`.
