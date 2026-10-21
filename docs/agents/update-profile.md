# Playbook: update the profile

Use this playbook when something about Divyansh changes: a new job or title, a new skill, an achievement, a new resume, or new target roles.

## Inputs

- What changed, and its source (resume, LKH note, or the owner's message). Add the fact to `profile-facts.md` first.

## Steps

1. **Read what's live.** Use `npm run sync:push -- --export` with `SYNC_URL` and `SYNC_TOKEN` set, or Atlas `find` on `profile`, `experience`, `skills` and `achievements`.
2. **Decide what to touch.** Common cases:

   | Change | Records |
   |---|---|
   | New job or title | `experience` (section `Professional`; add or update the entry, set the dateRange end on the old one), `profile.headline`, `profile.footerTagline`, `about.paragraphs[0]`, and `PERSON.jobTitle`/`worksFor` in `shared/seo.ts` (a code change, needs a deploy) |
   | New offer or internship | `experience` section `Offers` or `Professional` |
   | New skill or tool | the matching `skills` category; `profile.keySkills` only if it's top-10 for the target role |
   | New achievement | replace the weakest of the 4 `achievements`; keep each one linked to proof |
   | New resume | upload in Admin → Profile (or commit to `public/resume.pdf`) and set `profile.resumeUrl`; then re-check every fact in `profile-facts.md` against it |
   | New target role | follow `tailor-for-role.md` |

3. **Write the copy** to `content-style.md`. Keep lengths within the table there.
4. **Dry run.** With the sync API, send `dryRun: true`; `profile` replaces the whole document, so send the full exported profile with your edits. With Atlas, prepare `$set` on only the changed fields. Show the owner a before/after.
5. **Apply** once the owner approves.
6. **Verify.** Load https://divyansh-rai.vercel.app, then the home hero, About and `/experience`. Check light and dark mode, and mobile if layout could change.
7. **Log it** in `changelog.md`, with the old values.
8. If the headline, description or job title changed, **redeploy** so the prerendered SEO pages and the OG card pick it up. If the change is big (new job), regenerate `public/og-image.png` (1200×630; name, headline and photo).

## Example sync payload (new job)

```json
{
  "source": "agent:update-profile",
  "dryRun": true,
  "upsert": {
    "experience": [
      { "id": "lkh-job-acme-2027", "section": "Professional", "title": "Machine Learning Engineer", "description": "LLM retrieval and evaluation", "institution": "Acme AI, India", "dateRange": "March 2027 - Present", "order": 1 }
    ]
  }
}
```
