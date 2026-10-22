import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, BookOpen, ExternalLink, FolderGit2 } from 'lucide-react'
import type { Certificate, DirectoryItem, Project, SkillCategory as Skill } from '@shared/schemas'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useApi } from '@/lib/api'
import { useSkills } from '@/lib/useSkills'
import { SkillIconView } from '@/lib/icons'
import { buildProofIndex, type ProofItem } from '@/lib/skillProof'
import PageHeader, { PageShell } from '@/component/PageHeader'
import { useStaticSeo } from '@/lib/seo'

type ProofLookup = (skill: string) => ProofItem[]

function SkillChip({ name, proof, onOpen }: { name: string; proof: ProofItem[]; onOpen: () => void }) {
  if (proof.length === 0) {
    return <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground/85">{name}</span>
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      title={`See where I've used ${name}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 px-3 py-1 text-sm text-foreground hover:border-blue-500/60 hover:bg-blue-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {name}
      <span className="rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold leading-4 text-white dark:bg-blue-500">{proof.length}</span>
    </button>
  )
}

function SkillCategory({ skill, index, proofFor, onOpen }: { skill: Skill; index: number; proofFor: ProofLookup; onOpen: (s: string) => void }) {
  return (
    <motion.section
      className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      aria-labelledby={`skill-cat-${skill.id}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <SkillIconView icon={skill.icon} className="w-5 h-5" />
        </span>
        <h2 id={`skill-cat-${skill.id}`} className="text-lg font-semibold text-foreground">{skill.name}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {skill.skills.map((item) => (
          <SkillChip key={item} name={item} proof={proofFor(item)} onOpen={() => onOpen(item)} />
        ))}
      </div>
    </motion.section>
  )
}

const groups: { kind: ProofItem['kind']; label: string; Icon: typeof FolderGit2 }[] = [
  { kind: 'project', label: 'Projects', Icon: FolderGit2 },
  { kind: 'learning', label: 'Learning notes', Icon: BookOpen },
  { kind: 'certificate', label: 'Certificates', Icon: Award },
]

function ProofList({ items }: { items: ProofItem[] }) {
  return (
    <div className="space-y-5">
      {groups.map(({ kind, label, Icon }) => {
        const list = items.filter((i) => i.kind === kind)
        if (list.length === 0) return null
        return (
          <div key={kind}>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon className="h-3.5 w-3.5" /> {label}
            </p>
            <ul className="space-y-2">
              {list.map((item) => (
                <li key={item.href + item.title}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-blue-500/50 hover:bg-muted/50"
                    >
                      {item.title} <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="block rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-blue-500/50 hover:bg-muted/50"
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default function SkillsTree() {
  useStaticSeo('/resume')
  const { skills: skillsData, loading } = useSkills()
  const { data: projects } = useApi<Project[]>('/projects', [])
  const { data: directories } = useApi<DirectoryItem[]>('/directories', [])
  const { data: certificates } = useApi<Certificate[]>('/certificates', [])
  const proofFor = useMemo(() => buildProofIndex(projects, directories, certificates), [projects, directories, certificates])

  // The open skill lives in the URL (?skill=…) so the home page can link straight to it.
  const [params, setParams] = useSearchParams()
  const selected = params.get('skill')
  const open = (skill: string) => setParams({ skill }, { replace: false })
  const close = () => setParams({}, { replace: true })
  const proof = selected ? proofFor(selected) : []

  return (
    <PageShell>
      <PageHeader
        eyebrow="Toolkit"
        title="Skills"
        subtitle="What I work with, grouped by area. Highlighted skills link to the projects, notes and certificates where I've used them."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)
          : skillsData.map((skill, index) => <SkillCategory key={skill.id} skill={skill} index={index} proofFor={proofFor} onOpen={open} />)}
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card">
          <DialogTitle className="pr-8 text-xl">{selected}</DialogTitle>
          <DialogDescription>
            {proof.length > 0 ? `Where I've used ${selected}:` : `No linked work for ${selected} yet.`}
          </DialogDescription>
          {proof.length > 0 && <ProofList items={proof} />}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
