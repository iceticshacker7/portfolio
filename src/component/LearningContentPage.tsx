import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DirectoryItem, LearningItem } from '@shared/schemas'
import { useApi } from '@/lib/api'
import { learningPath } from '@/lib/content'
import { ContentBlockView } from './ContentBlockView'
import { useSeo } from '@/lib/seo'
import { excerpt } from '@shared/seo'

const LearningContent: React.FC<{ item: LearningItem; fallbackTitle: string }> = ({ item, fallbackTitle }) => {
  return (
    <div className="space-y-8">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-foreground"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {item.title || fallbackTitle}
      </motion.h2>
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {item.keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-block bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm font-semibold"
          >
            {keyword}
          </span>
        ))}
      </motion.div>
      {item.content.map((block, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.5 }}
        >
          <ContentBlockView block={block} zoomableImages />
        </motion.div>
      ))}
    </div>
  )
}

export default function LearningContentPage() {
  const { id } = useParams<{ id: string }>()
  const { data: directoryItem, loading } = useApi<DirectoryItem | null>(id ? `/directories/${encodeURIComponent(id)}` : null, null)
  // The full list is small and gives us the folder path for the breadcrumbs.
  const { data: allItems } = useApi<DirectoryItem[]>('/directories', [])
  const firstText = directoryItem?.learningItem?.content.find((b) => b.type === 'text')?.content || ''
  const navigate = useNavigate()
  // Old links used database ids; move them to the readable URL so search engines see one address.
  useEffect(() => {
    if (directoryItem?.slug && id && id !== directoryItem.slug) navigate(learningPath(directoryItem), { replace: true })
  }, [directoryItem, id, navigate])
  useSeo(directoryItem ? { title: directoryItem.learningItem?.title || directoryItem.name, description: excerpt(firstText || directoryItem.name), path: learningPath(directoryItem), type: 'article' } : null)

  const ancestors: DirectoryItem[] = []
  const byId = new Map(allItems.map((d) => [d.id, d]))
  for (let p = directoryItem?.parentId ? byId.get(directoryItem.parentId) : undefined; p && ancestors.length < 20; p = p.parentId ? byId.get(p.parentId) : undefined) {
    ancestors.unshift(p)
  }
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Learning', path: '/learnings' },
    ...ancestors.map((a) => ({ name: a.name, path: `/learnings?folder=${a.id}` })),
    ...(directoryItem ? [{ name: directoryItem.name, path: learningPath(directoryItem) }] : []),
  ]

  return (
    <motion.div
      className="min-h-screen font-sans py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <nav className="flex mb-4 overflow-x-auto" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path} className="inline-flex items-center whitespace-nowrap">
                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/70" />}
                <Link
                  to={crumb.path}
                  className={`inline-flex items-center text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? 'text-muted-foreground cursor-default'
                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                  }`}
                >
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <Button className="mb-4" asChild>
          <Link to="/learnings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Journey
          </Link>
        </Button>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-64 flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : directoryItem && directoryItem.learningItem ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg py-8 sm:p-8"
            >
              <LearningContent item={directoryItem.learningItem} fallbackTitle={directoryItem.name} />
            </motion.div>
          ) : (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-6 text-center"
            >
              <p className="text-muted-foreground">Learning item not found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
