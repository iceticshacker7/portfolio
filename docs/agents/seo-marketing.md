# SEO and marketing

## What the site already does (built Oct 2026)

- **Prerendered HTML per page:** `scripts/prerender.ts` runs after `vite build`. Every static route and every project and learning page gets its own `<title>`, description, canonical URL, Open Graph and Twitter tags, schema.org JSON-LD (Person, WebSite, CreativeWork/Article, BreadcrumbList) and readable text, so crawlers and link previews don't depend on JavaScript.
- **Sitemap and robots:** `sitemap.xml` is generated at build time. `robots.txt` blocks `/admin`, `/login` and `/api/`.
- **Clean URLs:** `/projects/<slug>` and `/learning/<slug>`. Old id URLs still resolve.
- **Social card:** `public/og-image.png` (1200×630). Project pages use their cover image.
- **Client-side updates:** `useSeo` (`src/lib/seo.ts`) keeps tags right during in-app navigation. Settings live in `shared/seo.ts`.
- **Vercel Web Analytics:** wired in (`@vercel/analytics`). It also has to be enabled in the Vercel dashboard: Project → Analytics → Enable.

## One-time setup (owner)

The site's address is **https://divyansh-rai.vercel.app** (`SITE_URL` in `shared/seo.ts`). divyanshrai.co isn't owned right now; see "Moving to a custom domain" below.

1. **Google Search Console:** Add property → **URL prefix** → `https://divyansh-rai.vercel.app/`. (A `vercel.app` address can't use DNS verification.) Choose the **HTML tag** method and copy the `content="…"` value. In Vercel → Project → Settings → Environment Variables, add `GOOGLE_SITE_VERIFICATION` = that value (Production), redeploy, then click Verify. Submit `https://divyansh-rai.vercel.app/sitemap.xml`, and use URL Inspection → Request indexing on `/` and the 3 featured projects.
2. **Bing Webmaster Tools:** import from Search Console (one click).
3. **Firebase Auth:** add `divyansh-rai.vercel.app` under Authentication → Settings → Authorized domains, or admin Google sign-in fails on this address.
4. **Link the site everywhere** (backlinks are the strongest ranking signal for a name query):
   - LinkedIn: Contact info → Website, Featured section, headline.
   - GitHub: profile README and the website field; each project repo's "About" link pointing to `/projects/<slug>`.
   - Kaggle, LeetCode and Codeforces profile website fields.
   - Hugging Face Space README for the Olympics dashboard.
   - Email signature and resume header.

## Moving to a custom domain later

1. Buy the domain and add it in Vercel → Project → Domains. Set the DNS records Vercel shows.
2. Change `SITE_URL` in `shared/seo.ts` and the `og:image` URL in `index.html`, then deploy.
3. In Vercel, set `divyansh-rai.vercel.app` to redirect (308) to the new domain, so existing links and rankings carry over.
4. Add the new domain in Search Console (DNS verification works there) and in Firebase authorized domains, then resubmit the sitemap.

## Ongoing checklist (agent, monthly or after a content change)

- [ ] `npm run build` prints `prerender: wrote N pages`, with N = 7 + projects + learning files.
- [ ] Spot-check `dist/projects/<slug>.html`: title, description and `og:image` are set and the description isn't truncated mid-word.
- [ ] Every project has a cover image, a description of ≤ 220 chars and ≥ 1 link.
- [ ] No two pages share a title or description.
- [ ] Search Console → Pages: no new "Not indexed" errors for real pages. Core Web Vitals are green.
- [ ] Vercel Analytics: note the top referrers and pages in `changelog.md` monthly. Use them to decide what to write next.

## Marketing plan (using the site to build a public profile)

1. **Case studies over lists.** Each featured project should read as problem → approach → result → lessons, with a demo GIF or video. Recruiters skim; the description and keyPoints carry the page.
2. **Publish learning notes regularly.** Add one learning page or blog-style case study a month on what's being learned at work or in side projects (e.g. LLM retrieval, evaluation). Each one is a new indexed page that targets long-tail searches, and a reason to post on LinkedIn.
3. **Cross-post with a link back.** Post a short LinkedIn summary and link to the full page on the site. Optionally cross-post to Medium or Dev.to with the canonical URL set to the site.
4. **Make the call to action obvious.** "Get in touch" opens the contact form, which emails via EmailJS. Keep the resume link current (`profile.resumeUrl`) so the About section shows "View my full resume".
5. **Social proof:** add a "Top Contributions" entry for each merged open-source PR or community talk, and keep the achievement cards linked to proof.
6. **Name consistency:** use "Divyansh Rai" with the same photo and headline on every platform, so search engines connect the profiles. The Person JSON-LD's `sameAs` lists the social URLs from `profile.socials`; add new profiles there.
