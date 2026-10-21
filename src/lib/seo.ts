import { useEffect } from "react";
import { absoluteUrl, DEFAULT_IMAGE, fullTitle, SITE_NAME, staticPages, type PageMeta } from "@shared/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps <title>, description, canonical and social tags in sync with the current page.
 * The build-time prerender writes the same tags into static HTML for crawlers and link
 * previews; this hook keeps them right during client-side navigation.
 */
export function useSeo(meta: PageMeta | null) {
  const key = meta ? JSON.stringify(meta) : "";
  useEffect(() => {
    if (!meta) return;
    const title = fullTitle(meta.title);
    const url = absoluteUrl(meta.path);
    const image = absoluteUrl(meta.image || DEFAULT_IMAGE);
    document.title = title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noindex ? "noindex" : "index, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:type", meta.type || "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", image);
    setCanonical(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Meta for a fixed route, defined once in shared/seo.ts. */
export function useStaticSeo(path: string) {
  useSeo(staticPages.find((p) => p.path === path) ?? null);
}
