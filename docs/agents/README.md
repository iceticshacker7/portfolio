# Agent playbooks

Markdown instructions for agents (Claude Code sessions, the LKH sync agent, scheduled tasks) that keep divyanshrai.in current. A person can follow them too. Start here, then open the playbook for the job.

| File | Use it to |
|---|---|
| [profile-facts.md](profile-facts.md) | Look up a fact about Divyansh before writing anything. **This is the only source of claims.** |
| [content-style.md](content-style.md) | Write or rewrite copy: voice, length, what's allowed. |
| [update-profile.md](update-profile.md) | Change the headline, about text, skills, experience, achievements or resume. |
| [update-portfolio.md](update-portfolio.md) | Add or edit a project, certificate or learning page. |
| [tailor-for-role.md](tailor-for-role.md) | Re-rank and reframe the site for a target role. |
| [seo-marketing.md](seo-marketing.md) | Keep search ranking and sharing working, and plan outreach. |
| [changelog.md](changelog.md) | Record every content change, including the text it replaced. |

## Ground rules (apply to every playbook)

1. **Facts come from `profile-facts.md`, the resume, or LKH. Nothing else.** Never invent metrics, employers, dates, titles or results. If a fact is missing, ask the owner, or leave it out.
2. **Dry run first, then show the diff.** Whatever path you write through, show the owner what will change before writing to production. The sync API has `dryRun: true` for this.
3. **Log it.** Add an entry to `changelog.md` with the date, what changed, and the old text. That is how changes get undone.
4. **Never put secrets in the repo, docs, commits or chat.** Tokens live in Vercel env vars and LKH's `.env`.
5. **Copy edits need no code change.** All content lives in MongoDB. Change code only for a new field or feature, and in that case follow `CLAUDE.md`.

## Where content lives and how to write it

All site content is in MongoDB Atlas, database `portfolio`. Shapes and limits are in `shared/schemas.ts`.

| Collection | Holds | Shown on |
|---|---|---|
| `profile` (single doc `_id: "main"`) | name, headline, focusAreas, keySkills, about{title, paragraphs, expertise, ctaTitle, ctaText}, socials, resumeUrl, footerTagline | home hero, About, footer, SEO |
| `projects` | title, slug, description, tags, keyPoints, image, links, featured, order, sections[] | `/projects`, `/projects/<slug>`, home (featured) |
| `certificates` | title, instituteName, date, image, credentialUrl, tags, featured | `/certificates`, home (featured) |
| `directories` | learning tree (folders/files), file → learningItem{title, keywords, content[]} | `/learnings`, `/learning/<slug>` |
| `skills` | categories of skills, icon, featured | `/resume`, home (featured) |
| `experience` | section (Academic/Professional/Offers/Participations), title, institution, dateRange | `/experience` |
| `achievements` | short text + icon + link | home highlight cards (keep 4) |
| `contributions` | title, keyPoints, link | home "Top Contributions" |

Ways to write, in order of preference:

1. **Sync API** (best for agents): `POST https://divyanshrai.in/api/sync` with `Authorization: Bearer $SYNC_TOKEN`. It's validated all-or-nothing and logged in `sync_log`. Payload format: [`docs/lkh-sync.md`](../lkh-sync.md). CLI: `SYNC_URL=https://divyanshrai.in npm run sync:push -- payload.json --dry`. Note: `profile` in a sync payload **replaces** the whole profile, so export first (`npm run sync:push -- --export`), edit the export, then send it back.
2. **Admin panel** at `/admin` (Google sign-in, allow-listed email). Best for the owner's quick edits and file uploads.
3. **MongoDB Atlas connector** (Claude sessions with the MongoDB MCP server): `update-many` on the collections above. Use `$set` on specific fields, never replace whole documents.

Changes appear on the site right away. Search-engine pages (prerendered HTML and `sitemap.xml`) refresh on the next Vercel deploy. After changing a slug, title or description, trigger a redeploy (push to `main`, or redeploy in Vercel) so crawlers see it.
