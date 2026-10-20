import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, ExternalLink, Github } from 'lucide-react'
import type { Project } from '@shared/schemas'
import { useApi } from '@/lib/api'
import { youtubeId } from '@/lib/content'
import { ContentBlockView } from './ContentBlockView'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projectData, loading } = useApi<Project | null>(id ? `/projects/${encodeURIComponent(id)}` : null, null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-xl">
        Project not found
        <Link to="/projects" className="text-base text-blue-600 hover:underline">Back to Projects</Link>
      </div>
    )
  }

  const videoId = youtubeId(projectData.youtube)
  const links = [
    { href: projectData.notebookUrl, label: 'View Jupyter Notebook', Icon: ExternalLink },
    { href: projectData.githubUrl, label: 'GitHub Repository', Icon: Github },
    { href: projectData.liveUrl, label: 'Live Demo', Icon: ExternalLink },
    { href: projectData.blogUrl, label: 'Blog Post', Icon: BookOpen },
  ].filter((l) => l.href)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="mr-2" size={20} />
          Back to Projects
        </Link>

        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {projectData.title}
        </motion.h1>

        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[...new Set([...projectData.tags, ...projectData.subtags])].map((tag) => (
            <span key={tag} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </motion.div>

        {projectData.image && (
          <motion.img
            src={projectData.image}
            alt={projectData.title}
            className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        )}

        {projectData.description && <p className="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-line">{projectData.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Demo</h2>
            {videoId ? (
              <iframe
                className="w-full aspect-video rounded-lg shadow-md"
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <p className="text-gray-600 italic">No demo video available</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Links</h2>
            <div className="space-y-4">
              {links.length === 0 && <p className="text-gray-600 italic">No links yet</p>}
              {links.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                  <Icon className="mr-2" size={20} />
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {projectData.sections.map((section, index) => (
          <motion.section
            key={index}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
          >
            {section.title && <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>}
            {section.content.map((block, contentIndex) => (
              <div key={contentIndex} className="mb-4">
                <ContentBlockView block={block} />
              </div>
            ))}
          </motion.section>
        ))}
      </div>
    </div>
  )
}
