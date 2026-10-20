import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Link } from 'react-router-dom'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '@shared/schemas'
import { useApi } from '@/lib/api'
import { uniqueSorted } from '@/lib/content'

const ANY = 'Any topic'

// Only the image and title are links: nesting the external <a> links inside a
// card-wide <Link> was invalid HTML.
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card className="w-full shadow-lg bg-white border-0 overflow-hidden transition-transform transform hover:scale-105 flex flex-col h-full">
      <Link to={`/projects/${project.id}`} className="relative overflow-hidden rounded-md" tabIndex={-1}>
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} Banner`}
            loading="lazy"
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-teal-100" />
        )}
      </Link>
      <CardContent className="p-3 flex-grow">
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-lg font-semibold mt-1 hover:underline">{project.title}</h3>
        </Link>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tech) => (
            <span key={tech} className="text-xs px-2 p-1 rounded-xl bg-blue-100">
              {tech}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 line-clamp-4">
          {project.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Live demo" className="text-blue-600 hover:text-blue-800">
            <ExternalLink size={20} />
          </a>
        ) : <span />}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="text-blue-600 hover:text-blue-800">
            <Github size={20} />
          </a>
        )}
      </CardFooter>
    </Card>
  )
}

const ShimmerCard: React.FC = () => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-white to-gray-100 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
    </div>
  )
}

export default function ProjectsSection() {
  const { data: projects, loading, error } = useApi<Project[]>('/projects', [])
  const [activeTag, setActiveTag] = useState(ANY)
  const [activeSubtag, setActiveSubtag] = useState<string | null>(null)

  const allTags = [ANY, ...uniqueSorted(projects.flatMap((p) => p.tags))]
  const subtagsForTag = activeTag === ANY ? [] : uniqueSorted(projects.filter((p) => p.tags.includes(activeTag)).flatMap((p) => p.subtags))

  const filteredProjects = activeSubtag
    ? projects.filter(project => project.subtags.includes(activeSubtag))
    : activeTag === ANY
      ? projects
      : projects.filter(project => project.tags.includes(activeTag))

  return (
    <div className="py-12 px-4 sm:px-8 bg-gradient-to-br from-white to-gray-50 font-mono">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            Explore my Projects
        </motion.h2>
        <motion.p 
          className="text-gray-600 mb-10 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Discover my diverse range of projects, each showcasing my skills and expertise in various technologies.
        </motion.p>
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTag === tag 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => {
                setActiveTag(tag)
                setActiveSubtag(null)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag}
            </motion.button>
          ))}
        </motion.div>

        {subtagsForTag.length > 0 && (
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {subtagsForTag.map((subtag) => (
              <motion.button
                key={subtag}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeSubtag === subtag 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSubtag(activeSubtag === subtag ? null : subtag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {subtag}
              </motion.button>
            ))}
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`shimmer-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShimmerCard />
                </motion.div>
              ))
            ) : (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
        {!loading && filteredProjects.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {error ? 'Could not load projects right now. Please try again later.' : 'No projects in this category yet.'}
          </p>
        )}
      </div>
    </div>
  )
}