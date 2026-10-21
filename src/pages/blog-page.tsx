import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from 'react-router-dom'
import type { DirectoryItem, Project } from '@shared/schemas'
import { useApi } from '@/lib/api'
import { ExternalLink, BookOpen, Search, Tag } from 'lucide-react'
import { Input } from "@/components/ui/input"
import PageHeader, { PageShell } from '@/component/PageHeader'
import { learningPath, prettyTag, projectPath } from '@/lib/content'
import { useStaticSeo } from '@/lib/seo'

interface BlogItem {
  id: string
  slug?: string
  title: string
  description?: string
  tags?: string[]
  keywords?: string[]
  type: 'learning' | 'project'
}

const BlogCard: React.FC<{ item: BlogItem }> = ({ item }) => {
  return (
    <Link className="block h-full" to={item.type === 'learning' ? learningPath(item) : projectPath(item)}>
      <Card className="w-full h-full flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30">
        <CardContent className="p-6 flex-1">
          <div className="flex items-center mb-4">
            {item.type === 'project' ? (
              <ExternalLink size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
            ) : (
              <BookOpen size={20} className="text-green-600 mr-2" />
            )}
            <h3 className="text-xl font-semibold hover:underline">{item.title}</h3>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
          )}
          {(item.tags || item.keywords) && (
            <div className="flex flex-wrap gap-2">
              {item.tags && item.tags.map((tag, index) => (
                <span key={`tag-${index}`} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
                  {prettyTag(tag)}
                </span>
              ))}
              {item.keywords && item.keywords.map((keyword, index) => (
                <span key={`keyword-${index}`} className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200">
                  {prettyTag(keyword)}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground capitalize">{item.type}</span>
          <Tag size={16} className="text-muted-foreground/70" />
        </CardFooter>
      </Card>
    </Link>
  )
}

const ShimmerCard: React.FC = () => {
  return (
    <div className="w-full h-48 bg-card border border-border rounded-xl overflow-hidden relative mb-4 animate-pulse">
      <div className="h-full w-full">
        <div className="h-4 bg-secondary rounded w-3/4 mb-4 mx-4 mt-4"></div>
        <div className="h-4 bg-secondary rounded w-1/2 mb-4 mx-4"></div>
        <div className="h-4 bg-secondary rounded w-1/4 mx-4"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-muted"></div>
    </div>
  )
}

export default function BlogsPage() {
  useStaticSeo('/blogs')
  const projects = useApi<Project[]>('/projects', [])
  const directories = useApi<DirectoryItem[]>('/directories', [])
  const loading = projects.loading || directories.loading
  const [filter, setFilter] = useState<'all' | 'project' | 'learning'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const blogItems: BlogItem[] = [
    ...projects.data.map((p) => ({ id: p.id, slug: p.slug, title: p.title, description: p.description, tags: p.tags, type: 'project' as const })),
    ...directories.data
      .filter((d) => d.type === 'file' && d.learningItem)
      .map((d) => ({ id: d.id, slug: d.slug, title: d.learningItem!.title || d.name, keywords: d.learningItem!.keywords, type: 'learning' as const })),
  ]

  const filteredBlogItems = blogItems.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter
    const matchesSearch = searchTerm === '' || 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())))
    return matchesFilter && matchesSearch
  })

  return (
    <PageShell>
      <PageHeader eyebrow="Writing" title="Blog" subtitle="Project case studies and learning notes in one place." />
      <div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select onValueChange={(value) => setFilter(value as 'all' | 'project' | 'learning')}>
              <SelectTrigger className="w-full rounded-full border-input focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="learning">Learnings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-input focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70" size={18} />
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`shimmer-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShimmerCard />
                </motion.div>
              ))
            ) : (
              filteredBlogItems.map((item) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BlogCard item={item} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
        {!loading && filteredBlogItems.length === 0 && (
          <motion.p
            className="text-center text-muted-foreground mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No posts found. Try adjusting your filters or search term.
          </motion.p>
        )}
      </div>
    </PageShell>
  )
}