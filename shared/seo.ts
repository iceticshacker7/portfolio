// SEO settings shared by the browser (per-page <head> updates) and the build-time
// prerender script, so both always produce the same titles, descriptions and URLs.

// The site's public address, used for canonical URLs, the sitemap and social cards.
// divyanshrai.co isn't pointing at Vercel right now, so the Vercel production domain is
// the canonical one. When a custom domain works, change this line and redeploy.
export const SITE_URL = "https://divyansh-rai.vercel.app";
export const SITE_NAME = "Divyansh Rai";
export const DEFAULT_IMAGE = "/og-image.png";
export const DEFAULT_DESCRIPTION =
  "Divyansh Rai is an AI/ML graduate and Systems Engineer at TCS. Machine learning, computer vision and data projects, certifications, and learning notes.";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

export const fullTitle = (title: string) => (title === SITE_NAME || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

export const absoluteUrl = (pathOrUrl: string) => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`);

/** Plain-text excerpt for meta descriptions: strips markdown and trims to ~155 characters. */
export function excerpt(text: string, max = 155): string {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, " ")
    .replace(/(^|\s)-{2,}(?=\s|$)/g, " ")
    .replace(/[#*_>`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : max).trim()}…`;
}

/** Static routes with their meta; dynamic routes (projects, learnings) are added from the database. */
export const staticPages: PageMeta[] = [
  { path: "/", title: `${SITE_NAME} | AI/ML Graduate & Systems Engineer`, description: DEFAULT_DESCRIPTION, type: "profile" },
  { path: "/projects", title: "Projects", description: "Machine learning, computer vision, data analysis and full-stack projects by Divyansh Rai, with write-ups, code and live demos." },
  { path: "/experience", title: "Experience", description: "Education, work at TCS, offers and competitions: Divyansh Rai's academic and professional journey." },
  { path: "/resume", title: "Skills", description: "Programming languages, ML frameworks, cloud platforms and tools Divyansh Rai works with." },
  { path: "/certificates", title: "Certificates", description: "Verified certifications from Google Cloud, AWS, IBM, Cisco, Udacity and more." },
  { path: "/learnings", title: "Learning Journey", description: "Notes on feature engineering, machine learning pipelines, data handling and algorithms." },
  { path: "/blogs", title: "Blog", description: "Project case studies and learning notes by Divyansh Rai." },
];

/** Facts used for schema.org Person markup (helps Google connect name searches to this site). */
export const PERSON = {
  jobTitle: "Systems Engineer",
  worksFor: "Tata Consultancy Services",
  alumniOf: "Gyan Ganga Institute of Technology & Sciences",
  image: "/profile.jpg",
  knowsAbout: ["Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing", "Data Analysis", "Python", "TensorFlow", "PyTorch"],
};
