# Portfolio

Personal portfolio for Divyansh Rai: projects, certificates, learning notes, skills and experience, all editable from a built-in admin panel.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind (shadcn/ui components)
- **Backend:** a single Vercel serverless function (`api/index.ts`) backed by **MongoDB Atlas**
- **Files:** images, certificates, notebooks and resumes are stored in MongoDB GridFS and served from `/api/files/...`
- **Auth:** Google Sign-In (and/or an admin password), limited to the emails in `ADMIN_EMAILS`

## Running locally

```bash
npm install
cp .env.example .env      # fill in MONGODB_URI, SESSION_SECRET, ADMIN_EMAILS, ADMIN_PASSWORD
npm run seed              # loads the default profile, skills, experience and achievements
npm run dev               # API on :3001, site on http://localhost:5173 (proxies /api)
```

No Atlas cluster yet? Any MongoDB works for development, e.g. `docker run -p 27017:27017 mongo:7` with `MONGODB_URI=mongodb://127.0.0.1:27017`.

Sign in at `/login` (there's also an "Admin" link in the footer) and manage everything under `/admin`.

| Script | What it does |
| --- | --- |
| `npm run dev` | API + Vite dev server together |
| `npm run build` | Type-checks client and server, then builds to `dist/` |
| `npm run lint` | ESLint |
| `npm run seed` | Fills empty collections with the default content (`-- --force` overwrites) |
| `npm run migrate:firebase` | One-time copy of Firestore data + Storage files into MongoDB (`-- --dry` to preview) |

## Deploying to Vercel

1. Create a free **MongoDB Atlas** M0 cluster, create a database user, and under *Network Access* allow `0.0.0.0/0` (Vercel's IPs aren't fixed). Copy the connection string.
2. *(For Google sign-in)* In Google Cloud Console → APIs & Services → Credentials, create an **OAuth client ID** of type *Web application* and add your site URL (e.g. `https://your-site.vercel.app`) and `http://localhost:5173` as **Authorized JavaScript origins**. The Firebase project already has a Google Cloud project you can reuse.
3. Import the repo in Vercel (framework: Vite). Add the variables from `.env.example` under *Settings → Environment Variables*: at minimum `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAILS`, and `GOOGLE_CLIENT_ID` and/or `ADMIN_PASSWORD`.
4. Deploy, then run `npm run seed` locally against the Atlas URI (or fill everything in through `/admin`).

### Moving data off Firebase

Put the old `VITE_APP_*` Firebase web config and `MONGODB_URI` in `.env`, then:

```bash
npm run migrate:firebase -- --dry   # shows what would be copied
npm run migrate:firebase
```

It copies `projects`, `certificates` and `directories` (keeping their ids, so old `/projects/<id>` links keep working), downloads every Firebase Storage file those documents reference into GridFS, and rewrites the URLs. Re-running it updates documents instead of duplicating them. If Firestore reads are blocked by billing, re-enable the project on the free Spark plan first. Reads within the free quota cost nothing.

## Project layout

```
api/index.ts          Vercel entry point (all /api/* requests)
server/               router, auth (sessions, Google token check, rate limit), MongoDB/GridFS
shared/schemas.ts     zod schemas: the single source of truth for data shapes, used by API + UI
shared/seed-data.ts   default content (also the fallback if the API is unreachable)
scripts/              seed + Firebase migration
src/pages, src/component   public pages
src/services/         login + admin panel
src/lib/              API client, auth/profile context, helpers
```

## Security notes

- Every write requires a signed, HttpOnly, `SameSite=Strict` session cookie **and** an `X-Requested-With` header (CSRF protection). Sessions are re-checked against `ADMIN_EMAILS` on every request.
- All input is validated with zod; stored URLs must be `http(s)://` or `/path`, which blocks `javascript:` links.
- Uploads are limited to images, PDF, HTML and notebooks (max 4 MB). Uploaded HTML is served with `Content-Security-Policy: sandbox`, and inline HTML blocks render in sandboxed iframes.
- Login and the contact form are rate-limited per IP. The contact form also has a honeypot field.
- `vercel.json` sets CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` and related headers.
