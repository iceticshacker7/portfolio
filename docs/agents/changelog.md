# Content changelog

Newest first. Record every content change with the old value, so it can be undone. Format: date · who/what · records · change.

## 2026-10-22 · Claude Code session · new domain divyanshrai.in

- Site address changed from `https://divyansh-rai.vercel.app` (used 2026-10-21 after divyanshrai.co lapsed) to `https://divyanshrai.in`: `SITE_URL`, `index.html` og:image, the address on `public/og-image.png`, and all docs.
- Vercel project domains added: `divyanshrai.in`, `www.divyanshrai.in` (308 → apex).

## 2026-10-21 · Claude Code session · professional copy and SEO pass

Applied to Atlas `portfolio` and mirrored in `shared/seed-data.ts`.

**profile**
- `focusAreas`: was ["Machine Learning Algorithms", "Deep Learning Frameworks", "Computer Vision Techniques", "Mathematical Foundations", "Natural Language Processing"].
- `keySkills`: was "Tensorflow, Pytorch, Scikit-Learn, Langchain, OpenCV, NLTK".
- `about.title`: was "Why Choose Me?". Now "Building practical machine learning products".
- `about.paragraphs`: was two generic paragraphs ("As a passionate and innovative technologist…", "My commitment to continuous learning…"). Now three factual ones (see seed-data).
- `about.expertise`: was ["Full-stack Development", "Data Engineering & Analysis", "Machine Learning & AI", "Team Collaboration", "Rapid Prototyping"].
- `about.ctaTitle`/`ctaText`: was "Ready to Collaborate?" / "I'm always excited to take on new challenges… create something extraordinary."
- `headline`: "ML Graduate" changed to "AI/ML Graduate" (earlier the same day).

**projects** (slugs added to all)
- `4n50AsqPb0TYw59A1n3V` title was "OLYMPICS Dashboard". Description rewritten. Featured.
- `E4Hfoewl1x8qpUfSZTBG` title was "The College Coding Club". Description rewritten.
- `ZnUSHveWO9nFueXR6MEn`, `ook4RRXJ0ZicmeMGSxBt`: descriptions shortened. Both featured.
- `sE3wneuGIoK9bZNjTp7Z`: description was a truncated sentence ("In today's data-driven world… To address the complexities of car sales data,").

**directories**: slugs added to the 6 learning files.

**certificates**
- `dAuqTTOb7sSjYpNYqRZO` title was "Certificate of Completion".
- Featured: `sl9x1J2OOQ8a14jERteo`, `2o5cak5b0Q04j11d6CHK`, `3PpUnaLVywI5fvKtmzyI`.

**achievements** (texts were):
- "Proficient Algorithm Learner"
- "Researched AI Topics"
- "Earned ML Certificates"
- "Trained LLM from scratch" (removed: no project on the site supports it)

**experience**
- TCS offer: was "Full-time | Status: Accepted", "@ TCS, India".
- Prodesk: was "Full-time | Status: Declined", "@ Prodesk IT, India".
- IIT Bombay: was title "Got Awarded NLP research Intership", "Internship | Status: Declined", order 4.
- TCS trainee: institution was "@ TCSL, India".
- **To remove** (removed locally and from seed; the Atlas delete timed out through the connector, so delete it in Admin → Experience): `seed-mvhrvz4a-6` `{ section: "Offers", title: "Software Development Engineer", description: "Internship + PPO | Status: Revoked", institution: "@ Brane Enterprises, India", dateRange: "14 September 2023", order: 3 }`.
