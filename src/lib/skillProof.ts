import type { Certificate, DirectoryItem, Project } from '@shared/schemas'
import { learningPath, projectPath } from './content'

// Links each skill to the work that demonstrates it. A project, learning page or
// certificate counts as proof when the skill (or an alias) appears in its explicit tags
// (project tags/subtags, learning keywords, certificate tags) or in its text. Edit a
// project's "Subtags" in the admin panel to link it to a skill explicitly.

export interface ProofItem {
  kind: 'project' | 'learning' | 'certificate'
  title: string
  href: string
  external?: boolean
  /** True when the link came from an explicit tag rather than a mention in the text. */
  tagged: boolean
}

/** Extra spellings for skills whose names differ from how write-ups mention them. */
const ALIASES: Record<string, string[]> = {
  'scikit-learn': ['sklearn', 'scikit learn'],
  'natural language processing (nlp)': ['nlp', 'natural language processing'],
  nlp: ['natural language processing'],
  'openai api (gpt)': ['gpt', 'openai', 'chatgpt'],
  gpt: ['openai', 'chatgpt'],
  'hugging face': ['huggingface', 'transformers'],
  'react.js': ['react'],
  'node.js': ['node', 'nodejs'],
  'express.js': ['express'],
  'sql / mysql': ['sql', 'mysql'],
  'sql/mysql': ['sql', 'mysql'],
  'git & github': ['github', 'git'],
  'data structures & algorithms': ['dsa', 'data structures', 'algorithms'],
  'data structures and algorithms (dsa)': ['dsa', 'data structures', 'algorithms'],
  'deep learning': ['cnn', 'neural network'],
  'computer vision': ['opencv'],
  'feature engineering': ['featureengineering'],
  'aws (ec2, rds)': ['aws', 'amazon web services'],
  'google cloud': ['gcp', 'google cloud'],
  'c/c++': ['c++', 'c/c++'],
}

const norm = (s: string) => s.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()

function termsFor(skill: string): string[] {
  const n = norm(skill)
  const base = [n, n.replace(/\.js$/, ''), n.replace(/\s*\(.*\)$/, '')]
  return [...new Set([...base, ...(ALIASES[n] ?? [])].map(norm).filter(Boolean))]
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Whole-word match that also works for names like "C++" or "Node.js". */
function mentions(text: string, term: string) {
  return new RegExp(`(^|[^a-z0-9+#])${escapeRe(term)}(?=$|[^a-z0-9+#])`).test(text)
}

interface Candidate extends Omit<ProofItem, 'tagged'> {
  tags: string[]
  text: string
}

export function buildProofIndex(projects: Project[], learnings: DirectoryItem[], certificates: Certificate[]) {
  const candidates: Candidate[] = [
    ...projects.map((p) => ({
      kind: 'project' as const,
      title: p.title,
      href: projectPath(p),
      tags: [...p.tags, ...p.subtags].map(norm),
      text: norm(
        [p.title, p.description, ...p.keyPoints, ...p.sections.flatMap((s) => [s.title, ...s.content.filter((b) => b.type === 'text').map((b) => b.content)])].join(' '),
      ),
    })),
    ...learnings
      .filter((d) => d.type === 'file' && d.learningItem)
      .map((d) => ({
        kind: 'learning' as const,
        title: d.learningItem!.title || d.name,
        href: learningPath(d),
        tags: d.learningItem!.keywords.map(norm),
        text: norm([d.name, d.learningItem!.title, ...d.learningItem!.content.filter((b) => b.type === 'text').map((b) => b.content)].join(' ')),
      })),
    ...certificates.map((c) => ({
      kind: 'certificate' as const,
      title: c.title,
      href: c.credentialUrl || '/certificates',
      external: Boolean(c.credentialUrl),
      tags: c.tags.map(norm),
      text: norm([c.title, c.instituteName, c.description].join(' ')),
    })),
  ]

  const cache = new Map<string, ProofItem[]>()
  return (skill: string): ProofItem[] => {
    const key = norm(skill)
    const hit = cache.get(key)
    if (hit) return hit
    const terms = termsFor(skill)
    // One- and two-letter names ("C", "R") are too ambiguous to find in prose: tags only.
    const textTerms = terms.filter((t) => t.replace(/[^a-z]/g, '').length > 2)
    const order = { project: 0, learning: 1, certificate: 2 }
    const result = candidates
      .map((c): ProofItem | null => {
        const tagged = terms.some((t) => c.tags.includes(t))
        const found = tagged || textTerms.some((t) => mentions(c.text, t))
        return found ? { kind: c.kind, title: c.title, href: c.href, external: c.external, tagged } : null
      })
      .filter((x): x is ProofItem => x !== null)
      .sort((a, b) => order[a.kind] - order[b.kind] || Number(b.tagged) - Number(a.tagged))
    cache.set(key, result)
    return result
  }
}
