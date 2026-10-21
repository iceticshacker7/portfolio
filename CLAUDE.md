# CLAUDE.md

Context for AI-assisted sessions on this repo. Keep it current when the architecture changes.

## What this is
Divyansh Rai's portfolio: a React + Vite + Tailwind SPA with an admin panel, a single Vercel serverless API (`api/index.ts` → `server/router.ts`) and MongoDB Atlas (data + GridFS files). It was migrated off Firebase (Firestore/Storage/Auth) in Oct 2026; `scripts/migrate-from-firebase.ts` copies the old data.

## Commands
- `npm run dev`: API (tsx, :3001) + Vite (:5173, proxies `/api`). Needs `.env` (see `.env.example`).
- `npm run build`: `tsc -b` (client) + `tsc -p tsconfig.server.json` (api/server/shared/scripts) + `vite build`.
- `npm run lint`: must stay at 0 errors.
- `npm run seed` / `npm run migrate:firebase -- --dry`.
- There's no test suite; verify UI changes in a browser (Playwright/Chromium is available in cloud sessions).

## Conventions
- **Data shapes live in `shared/schemas.ts` (zod).** The API validates with them; the UI imports the inferred types. To add a field, add it there first. To add a whole collection, add it to `collections` and it gets CRUD at `/api/<name>` automatically.
- Server code is ESM with NodeNext resolution: relative imports need a `.js` extension (`../server/db.js`).
- Document `_id`s are strings (Firestore ids were preserved); the API exposes them as `id`.
- Admin writes go through `src/lib/api.ts` (sends `X-Requested-With: portfolio`, which the server requires). Wrap actions in `withToast` from `src/lib/notify.ts`.
- Small collections (skills, experience, achievements, contributions) share the config-driven editor in `src/services/SimpleCollectionPages.tsx`.
- Content blocks (project sections, learning pages) render through `src/component/ContentBlockView.tsx`. Don't add `dangerouslySetInnerHTML`; HTML goes in sandboxed iframes.
- Vercel: keep the API as one function. `vercel.json` rewrites `/api/(.*)` → `/api`, because a `[...path]` file only matches one segment outside Next.js.

## Status / open items
- Not yet deployed with Atlas: needs `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID` (and/or `ADMIN_PASSWORD`) set in Vercel.
- Firebase migration hasn't been run against the real project yet (needs the old `VITE_APP_*` config).
- Home-page "Top Contributions" is empty until entries are added in Admin → Contributions (the old placeholder ones were fake).
- The owner keeps agent notes and memories in a separate local project ("LKH"), which isn't on GitHub. Content from it can be added through the admin panel or the seed data.
