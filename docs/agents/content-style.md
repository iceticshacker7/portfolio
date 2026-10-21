# Content style

How copy on divyansh-rai.vercel.app should read. The goal: a recruiter or hiring manager understands in 10 seconds what Divyansh does, what Divyansh has built and why it's credible.

## Voice

- First person, plain and confident ("I built…", "I led…"). No hype: avoid "passionate", "cutting-edge", "extraordinary", "exceeding expectations", "pushing boundaries", "innovative".
- Specific beats general. "A real-time drowsiness detector using OpenCV and a CNN" beats "AI solutions for safety".
- Numbers only if they're in `profile-facts.md`. Round down, never up ("830+" for 831).
- Present outcomes and scope: what it does, what it's built with, what it achieved.
- Status words like "Declined", "Revoked" or "Rejected" don't belong on the site. Describe offers neutrally ("Full-time offer"), or leave the entry out.
- Indian English and US English are both fine; be consistent within a page. Use the Oxford comma sparingly.

## Lengths (fit the layout)

| Field | Target |
|---|---|
| profile.headline | ≤ 60 chars, "Role A \| Role B @Company" |
| focusAreas | 4–6 items, ≤ 32 chars each |
| keySkills | 8–12 comma-separated tools |
| about.paragraphs | 3 paragraphs × 1–3 sentences: (1) who/where now, (2) what I build, with 2–3 project examples, (3) proof points + what I'm looking for |
| about.expertise | 5 items, "Area (tool, tool)" |
| achievements | exactly 4, ≤ 55 chars each, each with a link that proves it |
| project.description | 1–2 sentences, ≤ 220 chars: what it is + key tech. Used as the meta description and card text. |
| project.keyPoints | 3–5 bullets, each an outcome or capability |
| project.title | Title Case, no ALL CAPS, ≤ 50 chars |
| certificate.title | the issuer's official course name |

## Tags

Use the existing tags (`Machine Learning`, `Data Analysis`, `Web Development`, …) so filters stay small. Put tools in `subtags`. Tags are shown through `prettyTag()`, so store them in their natural form.

## Featured

- Projects: feature the 3 most relevant to the current target role (see `tailor-for-role.md`).
- Certificates: feature 3 (currently AWS ML ×2 and Google Cloud).
- Skills: feature the 3 categories closest to the target role.
