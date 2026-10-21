---
name: portfolio-update
description: Update divyansh-rai.vercel.app content. Use for changes to Divyansh's profile, headline, about text, experience, skills, achievements or resume; for adding or editing projects, certificates or learning pages; for tailoring the site to a target role; and for SEO or marketing upkeep.
---

# Portfolio update

All site content is data in MongoDB Atlas (database `portfolio`); copy changes need no code change.

1. Read `docs/agents/README.md`: where each piece of content lives, the three write paths (sync API, admin panel, Atlas connector) and the ground rules.
2. Pick the playbook for the job:
   - profile, job, skills, achievements, resume → `docs/agents/update-profile.md`
   - projects, certificates, learning pages, contributions → `docs/agents/update-portfolio.md`
   - "make the site fit role X" → `docs/agents/tailor-for-role.md`
   - search ranking, sharing, outreach → `docs/agents/seo-marketing.md`
3. Take every claim from `docs/agents/profile-facts.md` (or a source the owner gives you; add it there). Write the copy to `docs/agents/content-style.md`.
4. Dry-run and show the before/after, apply only after the owner approves, verify on the live site, and add an entry with the old values to `docs/agents/changelog.md`.
