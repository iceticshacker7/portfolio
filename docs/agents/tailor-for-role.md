# Playbook: tailor the site for a target role

The site has one public version at a time, so tailor it to the role family being applied to now, not to a single job posting. Use the resume and cover letter for per-posting tailoring.

## Inputs

- A target-role brief, from LKH or the owner. Example: "ML Engineer – LLM/RAG, India or remote; keywords: PyTorch, LangChain, vector DBs, MLOps".

## Steps

1. **Score every project** against the brief, 0–3 each on: matching skills, matching domain, and strength of outcome. Set `featured: true` on the top 3 and set `order` by score.
2. **Skills:** feature the 3 most relevant `skills` categories. Reorder `profile.keySkills` so the brief's keywords Divyansh actually has come first. Never add skills that aren't in `profile-facts.md`.
3. **Headline and focus areas:** headline ≤ 60 chars, leading with the role family (e.g. "ML Engineer | LLM applications | Systems Engineer @TCS"). Reorder `focusAreas` to match.
4. **About:** rewrite paragraph 2 to lead with the most relevant project, and paragraph 3's last sentence to name the role family.
5. **Achievements:** keep the 4 that best support the role.
6. **SEO:** if the role family changes, update `DEFAULT_DESCRIPTION`, the home title in `staticPages` and `PERSON.knowsAbout` in `shared/seo.ts`, then deploy.
7. Dry run, show the before/after, apply, verify, then log it in `changelog.md` with the brief that drove it.

## Guardrails

- Rephrase and reorder only. Every claim must already be in `profile-facts.md`.
- Don't hide the TCS role or education. Recruiters look for them.
- Keep project titles and slugs stable; change descriptions and order instead.
