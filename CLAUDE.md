# CLAUDE.md

Context for AI-assisted sessions on this repo. Keep it current when the architecture changes.

## What this is
Divyansh Rai's portfolio: a React + Vite + Tailwind SPA with an admin panel, a single Vercel serverless API (`api/index.ts` → `server/router.ts`) and MongoDB Atlas (data + GridFS files). It was migrated off Firebase (Firestore/Storage/Auth) in Oct 2026; `scripts/migrate-from-firebase.ts` copies the old data.

## Commands
- `npm run dev`: API (tsx, :3001) + Vite (:5173, proxies `/api`). Needs `.env` (see `.env.example`).
- `npm run build`: `tsc -b` (client) + `tsc -p tsconfig.server.json` (api/server/shared/scripts) + `vite build` + `tsx scripts/prerender.ts`.
- `npm run lint`: must stay at 0 errors.
- `npm run seed` / `npm run migrate:firebase -- --dry`.
- There's no test suite; verify UI changes in a browser (Playwright/Chromium is available in cloud sessions).

## Conventions
- **Data shapes live in `shared/schemas.ts` (zod).** The API validates with them; the UI imports the inferred types. To add a field, add it there first. To add a whole collection, add it to `collections` and it gets CRUD at `/api/<name>` automatically.
- Server code is ESM with NodeNext resolution: relative imports need a `.js` extension (`../server/db.js`).
- Document `_id`s are strings (Firestore ids were preserved); the API exposes them as `id`.
- Admin writes go through `src/lib/api.ts` (sends `X-Requested-With: portfolio`, which the server requires). Wrap actions in `withToast` from `src/lib/notify.ts`.
- Small collections (skills, experience, achievements, contributions) share the config-driven editor in `src/services/SimpleCollectionPages.tsx`.
- Styling: use theme tokens (`bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`) instead of fixed grays so light/dark mode both work; accent colors need a `dark:` variant. Theme state lives in `src/lib/theme.tsx`; `public/theme-init.js` applies it before first paint.
- Top-level pages use `PageShell` + `PageHeader` (and `FilterPills`) from `src/component/PageHeader.tsx`; home sections use the local `Section` in `ProfileCard.tsx`. Show tags through `prettyTag()`.
- Content blocks (project sections, learning pages) render through `src/component/ContentBlockView.tsx`. Don't add `dangerouslySetInnerHTML`; HTML goes in sandboxed iframes.
- Vercel: keep the API as one function. `vercel.json` rewrites `/api/(.*)` → `/api`, because a `[...path]` file only matches one segment outside Next.js.

## Content updates (agents)
- Playbooks for profile/portfolio/SEO updates live in `docs/agents/` (start at `docs/agents/README.md`); the `portfolio-update` skill points there. Claims come only from `docs/agents/profile-facts.md`; log every content change with old values in `docs/agents/changelog.md`.
- SEO: `shared/seo.ts` (site settings, per-route meta, Person facts), `src/lib/seo.ts` (`useSeo`/`useStaticSeo`), `scripts/prerender.ts` (runs after `vite build`: per-page HTML with meta + JSON-LD, `app.html` SPA shell, `sitemap.xml`, `robots.txt`, and the optional `GOOGLE_SITE_VERIFICATION` meta tag on `/`; reads Mongo when `MONGODB_URI` is set). Projects and learning pages have slugs (`/projects/<slug>`, `/learning/<slug>`; ids still resolve). `vercel.json` uses `cleanUrls` and falls back to `/app`.

## LKH sync
- `POST /api/sync` / `GET /api/sync/export` (Bearer `SYNC_TOKEN`) bulk-upsert records by caller-chosen id; validated all-or-nothing; logged in `sync_log`. CLI: `npm run sync:push`. Design and payload format: `docs/lkh-sync.md`.

## Status / open items
- Atlas: project "Project 0", free cluster `portfolio` (AWS US_EAST_1), database `portfolio`. Firestore data (5 projects, 9 certificates, 18 learning items) and seed content were imported on 2026-10-21 via the MongoDB Atlas connector.
- Vercel project `portfolio` (team dev-rais-projects). The public address is **https://divyanshrai.in** (registered at Spaceship, Oct 2026; `SITE_URL` in `shared/seo.ts`); `www.divyanshrai.in` redirects to it. `divyansh-rai.vercel.app` is the Vercel alias; divyanshrai.co is a lapsed domain still listed on the project. DNS records and owner setup: `docs/agents/seo-marketing.md`. It has `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET` and `ADMIN_EMAILS`.
- Admin sign-in uses **Firebase Authentication with Google** (free on Spark): the browser signs in with the `VITE_APP_*` Firebase web config, and `POST /api/auth/firebase` verifies the ID token against Google's public keys (project id from `FIREBASE_PROJECT_ID` or `VITE_APP_PROJECT_ID`), checks `ADMIN_EMAILS`, then issues the site's own session cookie. New domains must be added under Firebase console → Authentication → Settings → Authorized domains. `GOOGLE_CLIENT_ID` (Google Identity Services) and `ADMIN_PASSWORD` remain optional alternatives.
- The 21 Firebase Storage files were recovered (Oct 2026, after a temporary Blaze upgrade) into `public/media/` (images converted to WebP) and the records re-linked to `/media/...`. `scripts/firebase-storage-missing.json` records the original paths. New uploads from the admin panel go to GridFS.
- Home-page "Top Contributions" is empty until entries are added in Admin → Contributions (the old placeholder ones were fake).
- The owner keeps agent notes and memories in a separate local project ("LKH"), which isn't on GitHub. Content from it can be added through the admin panel or the seed data.
- Open content items (Oct 2026): the resume isn't on the site yet (`profile.resumeUrl` empty); the Brane Enterprises offer entry (`seed-mvhrvz4a-6`) still needs deleting in Admin → Experience; Search Console/Bing verification and enabling Vercel Web Analytics are owner tasks (see `docs/agents/seo-marketing.md`).
