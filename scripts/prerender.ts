// Runs after `vite build`. Writes a static HTML file per public URL with the right
// <title>, description, canonical, Open Graph/Twitter tags, schema.org JSON-LD and a
// text version of the page, plus sitemap.xml. Crawlers and link-preview bots (LinkedIn,
// WhatsApp, X) don't run JavaScript, so without this every URL looked like the empty shell.
//
// React replaces the #root contents on load, so visitors see the normal app. The
// prerendered text is visually hidden (sr-only) to avoid a flash before the app mounts.
//
// Data comes from MongoDB when MONGODB_URI is set (Vercel builds); otherwise only the
// static routes are written, so local builds work offline.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Certificate, DirectoryItem, Profile, Project, SkillCategory } from "../shared/schemas.js";
import { seedProfile } from "../shared/seed-data.js";
import { absoluteUrl, DEFAULT_IMAGE, excerpt, fullTitle, PERSON, SITE_NAME, SITE_URL, staticPages, type PageMeta } from "../shared/seo.js";

const DIST = "dist";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const projectPath = (p: { id: string; slug?: string }) => `/projects/${p.slug || p.id}`;
const learningPath = (d: { id: string; slug?: string }) => `/learning/${d.slug || d.id}`;

interface Data {
  profile: Profile;
  projects: Project[];
  certificates: Certificate[];
  learnings: DirectoryItem[];
  skills: SkillCategory[];
  updated: Record<string, Date | undefined>;
  /** The uploaded profile photo, when it lives in GridFS (used for profile.jpg). */
  photo?: Buffer;
}

/** Reads an avatar uploaded through the admin panel (/api/files/<id>/...) from GridFS. */
async function readUploadedPhoto(avatar: string | undefined): Promise<Buffer | undefined> {
  const id = avatar?.match(/^\/api\/files\/([0-9a-f]{24})/)?.[1];
  if (!id) return undefined;
  const { getBucket } = await import("../server/db.js");
  const { ObjectId } = await import("mongodb");
  const chunks: Buffer[] = [];
  for await (const chunk of (await getBucket()).openDownloadStream(new ObjectId(id))) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function loadData(): Promise<Data> {
  const empty: Data = { profile: seedProfile, projects: [], certificates: [], learnings: [], skills: [], updated: {} };
  if (!process.env.MONGODB_URI) {
    console.warn("prerender: MONGODB_URI not set, writing static routes only");
    return empty;
  }
  try {
    const { getDb, getClient } = await import("../server/db.js");
    const db = await getDb();
    const all = async <T>(name: string) =>
      (await db.collection<{ _id: string; updatedAt?: Date }>(name).find().sort({ order: 1, createdAt: 1 }).toArray()).map(
        ({ _id, ...rest }) => ({ id: _id, ...rest }) as unknown as T & { updatedAt?: Date },
      );
    const profileDoc = await db.collection<{ _id: string; avatar?: string }>("profile").findOne({ _id: "main" });
    const photo = await readUploadedPhoto(profileDoc?.avatar).catch(() => undefined);
    const [projects, certificates, directories, skills] = await Promise.all([
      all<Project>("projects"),
      all<Certificate>("certificates"),
      all<DirectoryItem>("directories"),
      all<SkillCategory>("skills"),
    ]);
    await (await getClient()).close();
    const updated: Record<string, Date | undefined> = {};
    for (const p of projects) updated[projectPath(p)] = p.updatedAt;
    const learnings = directories.filter((d) => d.type === "file" && d.learningItem);
    for (const d of learnings) updated[learningPath(d)] = (d as { updatedAt?: Date }).updatedAt;
    return { profile: { ...seedProfile, ...(profileDoc as unknown as Profile) }, projects, certificates, learnings, skills, updated, photo };
  } catch (e) {
    console.warn(`prerender: could not read MongoDB (${(e as Error).message}); writing static routes only`);
    return empty;
  }
}

function personLd(profile: Profile) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.name,
    url: SITE_URL,
    image: absoluteUrl(PERSON.image),
    jobTitle: PERSON.jobTitle,
    description: profile.headline,
    worksFor: { "@type": "Organization", name: PERSON.worksFor },
    alumniOf: { "@type": "CollegeOrUniversity", name: PERSON.alumniOf },
    knowsAbout: PERSON.knowsAbout,
    sameAs: profile.socials.filter((s) => s.platform !== "email" && /^https?:/.test(s.url)).map((s) => s.url),
  };
}

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

function head(meta: PageMeta, jsonLd: object[]) {
  const title = esc(fullTitle(meta.title));
  const desc = esc(meta.description);
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image || DEFAULT_IMAGE);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLd }).replace(/</g, "\\u003c");
  return `<title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="robots" content="${meta.noindex ? "noindex" : "index, follow, max-image-preview:large"}" />
    ${meta.path === "/" && process.env.GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${esc(process.env.GOOGLE_SITE_VERIFICATION)}" />` : ""}
    <link rel="canonical" href="${url}" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${meta.type || "website"}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${ld}</script>`;
}

const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "");
const link = (path: string, text: string) => `<a href="${esc(path)}">${esc(text)}</a>`;

function render(template: string, meta: PageMeta, jsonLd: object[], body: string) {
  return template
    .replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, head(meta, jsonLd))
    .replace('<div id="root"></div>', `<div id="root"><div class="sr-only">${body}</div></div>`);
}

function write(path: string, html: string) {
  const file = path === "/" ? join(DIST, "index.html") : join(DIST, `${path.replace(/^\//, "")}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const data = await loadData();
const { profile } = data;
const template = readFileSync(join(DIST, "index.html"), "utf8");
// Untouched SPA shell for any URL without a prerendered page (vercel.json falls back to it).
writeFileSync(join(DIST, "app.html"), template);

const person = personLd(profile);
const site = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#person` } };
const nav = `<nav>${staticPages.slice(1).map((p) => link(p.path, p.title)).join(" · ")}</nav>`;
const pages: { meta: PageMeta; lastmod?: Date }[] = [];

for (const meta of staticPages) {
  let body = "";
  const crumbs = meta.path === "/" ? [] : [breadcrumbs([{ name: SITE_NAME, path: "/" }, { name: meta.title, path: meta.path }])];
  if (meta.path === "/") {
    body = `<h1>${esc(profile.name)}</h1><p>${esc(profile.headline)}</p>${list(profile.focusAreas.map(esc))}
      <h2>Featured projects</h2>${list(data.projects.slice(0, 6).map((p) => `${link(projectPath(p), p.title)}: ${esc(excerpt(p.description, 140))}`))}
      <h2>About</h2>${profile.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}`;
  } else if (meta.path === "/projects") {
    body = `<h1>Projects</h1>${list(data.projects.map((p) => `${link(projectPath(p), p.title)}: ${esc(excerpt(p.description, 160))}`))}`;
  } else if (meta.path === "/certificates") {
    body = `<h1>Certificates</h1>${list(data.certificates.map((c) => `${esc(c.title)} (${esc(c.instituteName)}${c.date ? `, ${esc(c.date)}` : ""})`))}`;
  } else if (meta.path === "/resume") {
    body = `<h1>Skills</h1>${data.skills.map((s) => `<h2>${esc(s.name)}</h2>${list(s.skills.map(esc))}`).join("")}`;
  } else if (meta.path === "/learnings" || meta.path === "/blogs") {
    body = `<h1>${esc(meta.title)}</h1>${list(data.learnings.map((d) => link(learningPath(d), d.learningItem?.title || d.name)))}`;
  } else {
    body = `<h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p>`;
  }
  write(meta.path, render(template, meta, meta.path === "/" ? [person, site] : [person, ...crumbs], nav + body));
  pages.push({ meta });
}

for (const p of data.projects) {
  const meta: PageMeta = { path: projectPath(p), title: p.title, description: excerpt(p.description || p.title), type: "article" };
  const text = p.sections.flatMap((s) => [s.title ? `<h2>${esc(s.title)}</h2>` : "", ...s.content.filter((b) => b.type === "text").map((b) => `<p>${esc(excerpt(b.content, 600))}</p>`)]).join("");
  const ld = {
    "@type": "CreativeWork",
    name: p.title,
    description: meta.description,
    url: absoluteUrl(meta.path),
    author: { "@id": `${SITE_URL}/#person` },
    keywords: [...p.tags, ...p.subtags].join(", "),
    ...(p.image ? { image: absoluteUrl(p.image) } : {}),
    ...(p.githubUrl ? { codeRepository: p.githubUrl } : {}),
  };
  const body = `${nav}<h1>${esc(p.title)}</h1><p>${esc(p.description)}</p>${list([...p.tags, ...p.subtags].map(esc))}${text}
    ${p.githubUrl ? link(p.githubUrl, "Source code") : ""} ${p.liveUrl ? link(p.liveUrl, "Live demo") : ""}`;
  write(meta.path, render(template, meta, [person, ld, breadcrumbs([{ name: SITE_NAME, path: "/" }, { name: "Projects", path: "/projects" }, { name: p.title, path: meta.path }])], body));
  pages.push({ meta, lastmod: data.updated[meta.path] });
}

for (const d of data.learnings) {
  const item = d.learningItem!;
  const firstText = item.content.find((b) => b.type === "text")?.content || d.name;
  const meta: PageMeta = { path: learningPath(d), title: item.title || d.name, description: excerpt(firstText), type: "article" };
  const ld = {
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url: absoluteUrl(meta.path),
    author: { "@id": `${SITE_URL}/#person` },
    keywords: item.keywords.join(", "),
  };
  const body = `${nav}<h1>${esc(meta.title)}</h1>${item.content.filter((b) => b.type === "text").map((b) => `<p>${esc(excerpt(b.content, 800))}</p>`).join("")}`;
  write(meta.path, render(template, meta, [person, ld, breadcrumbs([{ name: SITE_NAME, path: "/" }, { name: "Learning", path: "/learnings" }, { name: meta.title, path: meta.path }])], body));
  pages.push({ meta, lastmod: data.updated[meta.path] });
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(({ meta, lastmod }) => `  <url><loc>${absoluteUrl(meta.path)}</loc><lastmod>${lastmod ? new Date(lastmod).toISOString().slice(0, 10) : today}</lastmod><priority>${meta.path === "/" ? "1.0" : meta.type === "article" ? "0.7" : "0.8"}</priority></url>`)
  .join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemap);
writeFileSync(
  join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
copyFileSync(join(DIST, "app.html"), join(DIST, "404.html"));

// profile.jpg follows the uploaded profile photo; without one, the committed file in public/ stays.
let iconNote = "";
if (data.photo) {
  try {
    const { writeProfilePhoto } = await import("./favicons.js");
    await writeProfilePhoto(data.photo, DIST);
    iconNote = " + profile.jpg";
  } catch (e) {
    console.warn(`prerender: could not build profile.jpg (${(e as Error).message}); keeping the default`);
  }
}
console.log(`prerender: wrote ${pages.length} pages + sitemap.xml + robots.txt${iconNote}`);
