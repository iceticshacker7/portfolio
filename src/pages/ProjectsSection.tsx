import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '@shared/schemas'
import { useApi } from '@/lib/api'
import { prettyTag, projectPath, uniqueSorted } from '@/lib/content'
import PageHeader, { FilterPills, PageShell } from '@/component/PageHeader'
import { useStaticSeo } from '@/lib/seo'

const ANY = 'All'

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30">
      <Link to={projectPath(project)} className="block aspect-[16/10] overflow-hidden bg-muted" tabIndex={-1} aria-hidden="true">
        {project.image ? (
          <img src={project.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.map((t) => (
            <span key={t} className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {prettyTag(t)}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-foreground">
          <Link to={projectPath(project)} className="hover:text-blue-600 dark:hover:text-blue-400">
            {project.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-medium">
          <Link to={projectPath(project)} className="text-blue-600 dark:text-blue-400 hover:underline">
            Read case study
          </Link>
          <div className="flex items-center gap-3 text-muted-foreground">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Live demo" className="hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ProjectsSection() {
  useStaticSeo('/projects')
  const { data: projects, loading, error } = useApi<Project[]>('/projects', [])
  const [activeTag, setActiveTag] = useState(ANY)
  const [activeSubtag, setActiveSubtag] = useState<string | null>(null)

  const allTags = [ANY, ...uniqueSorted(projects.flatMap((p) => p.tags))]
  const subtagsForTag = activeTag === ANY ? [] : uniqueSorted(projects.filter((p) => p.tags.includes(activeTag)).flatMap((p) => p.subtags))

  const filteredProjects = activeSubtag
    ? projects.filter((project) => project.tags.includes(activeTag) && project.subtags.includes(activeSubtag))
    : activeTag === ANY
      ? projects
      : projects.filter((project) => project.tags.includes(activeTag))

  return (
    <PageShell>
      <PageHeader eyebrow="Portfolio" title="Projects" subtitle="Things I've built across machine learning, computer vision, data analysis and full-stack development." />

      <div className="space-y-3 mb-10">
        <FilterPills
          options={allTags}
          active={activeTag}
          format={prettyTag}
          onChange={(t) => {
            setActiveTag(t)
            setActiveSubtag(null)
          }}
        />
        {subtagsForTag.length > 0 && (
          <FilterPills size="sm" options={subtagsForTag} active={activeSubtag} onChange={(t) => setActiveSubtag(activeSubtag === t ? null : t)} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <div key={`shimmer-${index}`} className="h-80 rounded-2xl bg-muted animate-pulse" />)
            : filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
      {!loading && filteredProjects.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          {error ? 'Could not load projects right now. Please try again later.' : 'No projects in this category yet.'}
        </p>
      )}
    </PageShell>
  )
}
