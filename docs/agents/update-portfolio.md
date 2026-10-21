# Playbook: add or update portfolio items

Use this playbook for projects, certificates, learning pages and contributions.

## Add a project

1. **Gather:** title, what it does, the stack, outcomes (with numbers only if they're real), GitHub, live demo, video and notebook links, and a cover image (16:10, ≥ 1200 px wide, WebP).
2. **Image:** upload it through Admin → Projects (stored in GridFS), or commit it to `public/media/projects/<slug>.webp` and use `/media/projects/<slug>.webp`.
3. **Record** (fields per `projectSchema` in `shared/schemas.ts`):
   - `title`: Title Case.
   - `slug`: lowercase-hyphenated; generated from the title if omitted. **Never change a published slug.**
   - `description`: 1–2 sentences, ≤ 220 chars. This doubles as the meta description.
   - `tags`: from the existing set. `subtags`: the tools.
   - `keyPoints`: 3–5 outcomes.
   - `sections`: the case study. Use `{ title, content: [{ type: "text", content: "<markdown>" }, { type: "image", content: "/media/..." }, …] }`. Write problem → approach → result → what I learned.
   - `featured`: see `tailor-for-role.md`. `order`: lower comes first.
4. **Write** via the sync API (`upsert.projects`, with an id like `lkh-<note-id>`), the Admin panel, or Atlas `insert-many` (string `_id`).
5. **Verify** `/projects`, `/projects/<slug>` and the home page if it's featured.
6. **Redeploy** so `/projects/<slug>` is prerendered and added to `sitemap.xml`.
7. **Log it** in `changelog.md`. Add the project's verified facts to `profile-facts.md`.

## Add a certificate

- **Record:** `title` (the official course name), `instituteName`, `date` (`YYYY-MM-DD`), `credentialUrl` (a public verification link; required), `image`, `tags` (e.g. `machine learning`, `cloud`), `featured`.
- **Image:** the certificate as an image, saved to `public/media/certificates/<name>.webp`. It's shown uncropped on a white mat, so any aspect ratio works.
- Update the certificate count in `achievements` if it mentions one, and the list in `profile-facts.md`.

## Add a learning page

- `directories` is a tree. A folder has `type: "folder"`. A file has `type: "file"`, `parentId: <folder id>` and `learningItem: { title, keywords, content: [blocks] }`.
- Block types: `text` (markdown), `code` (with `language`), `image`, `youtube`, `link`, `file`, `html` (rendered in a sandboxed iframe). Never rely on raw HTML in markdown.
- The slug is generated from the title. Pages live at `/learning/<slug>`.

## Add a contribution (home "Top Contributions")

- `{ title, keyPoints: [..], link }`. Use it only for real open-source or community contributions, with a link to the PR, issue or post. The section stays hidden while it's empty.

## Update or remove

- To update: `$set` specific fields, or upsert the same id through sync.
- To remove: Admin panel delete, or `delete` in the sync payload (records you created through sync only). Copy the full record into `changelog.md` first, so it can be restored.
