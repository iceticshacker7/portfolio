import type { DirectoryItem } from "@shared/schemas";

export function buildDirectoryTree(items: DirectoryItem[]): DirectoryItem[] {
  const map = new Map<string, DirectoryItem>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));
  const roots: DirectoryItem[] = [];
  map.forEach((item) => {
    const parent = item.parentId ? map.get(item.parentId) : undefined;
    // Items whose parent was deleted are shown at the root instead of vanishing.
    if (parent) parent.children!.push(item);
    else roots.push(item);
  });
  return roots;
}

/** Accepts a bare video id or any common YouTube URL form and returns the id. */
export function youtubeId(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function isUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value);
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

/** "Full-Stack_Development" → "Full Stack Development" for display; filters keep the raw value. */
export function prettyTag(tag: string) {
  return tag.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Public URLs prefer the readable slug and fall back to the id for older records. */
export const projectPath = (p: { id: string; slug?: string }) => `/projects/${p.slug || p.id}`;
export const learningPath = (d: { id: string; slug?: string }) => `/learning/${d.slug || d.id}`;
