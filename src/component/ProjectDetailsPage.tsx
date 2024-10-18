'use client'

import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  subtags: string[]
  image: string
  youtube: string
  notebookUrl: string
  githubUrl: string
  liveUrl: string
  sections: {
    title: string
    content: {
      type: 'text' | 'image' | 'gif' | 'notebook' | 'code' | 'html'
      content: string
      language?: string
    }[]
  }[]
}

const renderContent = (content: Project['sections'][0]['content'][0]) => {
  switch (content.language) {
    case 'code':
      return (
        <SyntaxHighlighter
          language={content.language || 'text'}
          style={vscDarkPlus}
          customStyle={{ background: 'transparent', padding: '1rem', borderRadius: '0.5rem' }}
        >
          {content.content}
        </SyntaxHighlighter>
      )
    case 'markdown':
      return (
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="text-black-700 leading-relaxed mb-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({ node, ...props }) => <li className="mb-2" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:underline" {...props} />
            ),
            code: ({ node,  className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              return   match ? (
                <SyntaxHighlighter
                language={match[1]}
                customStyle={{ padding: '1rem', borderRadius: '0.5rem' }}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
                  {children}
                </code>
              )
            },
          }}
          className="markdown-content"
        >
          {content.content}
        </ReactMarkdown>
      )
    default:
      return <p className="text-gray-700 leading-relaxed">{content.content}</p>
  }
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [projectData, setProjectData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return
      try {
        const projectRef = doc(db, 'projects', id)
        const projectSnap = await getDoc(projectRef)

        if (projectSnap.exists()) {
          setProjectData({ id: projectSnap.id, ...projectSnap.data() } as Project)
        } else {
          console.log('Project not found')
        }
      } catch (error) {
        console.error('Error fetching project data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!projectData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl">Project not found</div>
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="mr-2" size={20} />
          Back to Projects
        </Link>

        <motion.h1
          className="text-4xl font-bold mb-4 text-gray-900"
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
          {[...new Set([...projectData.tags, ...projectData.subtags])].map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.img
          src={projectData.image}
          alt={projectData.title}
          className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Demo</h2>
            {projectData.youtube ? (
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${projectData.youtube}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-md"
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
              {projectData.notebookUrl && (
                <a href={projectData.notebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ExternalLink className="mr-2" size={20} />
                  View Jupyter Notebook
                </a>
              )}
              {projectData.githubUrl && (
                <a href={projectData.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                  <Github className="mr-2" size={20} />
                  GitHub Repository
                </a>
              )}
              {projectData.liveUrl && (
                <a href={projectData.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ExternalLink className="mr-2" size={20} />
                  Live Demo
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {projectData.sections && projectData.sections.map((section, index) => (
          <motion.section
            key={index}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>
            {section.content.map((content, contentIndex) => {
              switch (content.type) {
                case 'text':
                case 'code':
                  return (
                    <div key={contentIndex} className="mb-4">
                      {renderContent(content)}
                    </div>
                  )
                case 'image':
                case 'gif':
                  return <img key={contentIndex} src={content.content} alt={`Content ${contentIndex + 1}`} className="w-full rounded-lg shadow-md mb-4" />
                case 'notebook':
                  return (
                    <div key={contentIndex} className="bg-gray-100 p-4 rounded-lg mb-4">
                      <h4 className="text-lg font-semibold mb-2">Jupyter Notebook Output</h4>
                      <pre className="whitespace-pre-wrap overflow-x-auto">{content.content}</pre>
                    </div>
                  )
                case 'html':
                  return (
                    <div key={contentIndex} className="mb-4">
                      <iframe
                        srcDoc={content.content}
                        title={`HTML Content ${contentIndex + 1}`}
                        className="w-full h-[500px] rounded-lg border"
                        sandbox="allow-scripts"
                      />
                    </div>
                  )
                default:
                  return null
              }
            })}
          </motion.section>
        ))}
      </div>
    </div>
  )
}