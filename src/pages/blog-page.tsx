'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ExternalLink, BookOpen, Search, Tag } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface DirectoryItem {
  id: string
  name: string
  type: 'folder' | 'file'
  parentId: string | null
  children?: DirectoryItem[]
  learningItem?: LearningItem
}

interface LearningItem {
  id: string
  title: string
  keywords: string[]
  content: {
    type: 'text' | 'image' | 'gif' | 'notebook' | 'code' | 'html'
    category: boolean
    content: string
    language?: string
  }[]
}

interface BlogItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  keywords?: string[]
  type: 'learning' | 'project'
}

const BlogCard: React.FC<{ item: BlogItem }> = ({ item }) => {
  return (
    <Link to={item.type === 'learning' ? `/learning/${item.id}` : `/projects/${item.id}`}>
      <Card className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            {item.type === 'project' ? (
              <ExternalLink size={20} className="text-blue-600 mr-2" />
            ) : (
              <BookOpen size={20} className="text-green-600 mr-2" />
            )}
            <h3 className="text-xl font-semibold hover:underline">{item.title}</h3>
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
          )}
          {(item.tags || item.keywords) && (
            <div className="flex flex-wrap gap-2">
              {item.tags && item.tags.map((tag, index) => (
                <span key={`tag-${index}`} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
              {item.keywords && item.keywords.map((keyword, index) => (
                <span key={`keyword-${index}`} className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 capitalize">{item.type}</span>
          <Tag size={16} className="text-gray-400" />
        </CardFooter>
      </Card>
    </Link>
  )
}

const ShimmerCard: React.FC = () => {
  return (
    <div className="w-full h-48 bg-white border border-gray-200 rounded-xl overflow-hidden relative mb-4 animate-pulse">
      <div className="h-full w-full">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 mx-4 mt-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 mx-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mx-4"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-100"></div>
    </div>
  )
}

const buildDirectoryTree = (items: DirectoryItem[]): DirectoryItem[] => {
  const itemMap = new Map<string, DirectoryItem>();
  const rootItems: DirectoryItem[] = [];

  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  itemMap.forEach(item => {
    if (item.parentId === null) {
      rootItems.push(item);
    } else {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
      }
    }
  });

  return rootItems;
};

export default function BlogsPage() {
  const [blogItems, setBlogItems] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'project' | 'learning'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchBlogItems = async () => {
      try {
        setLoading(true)
        const projectsSnapshot = await getDocs(collection(db, 'projects'))
        const directoriesSnapshot = await getDocs(collection(db, 'directories'))

        const projectItems = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'project'
        })) as BlogItem[]

        const fetchedDirectories = directoriesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as DirectoryItem)
        );
        const structuredDirectories = buildDirectoryTree(fetchedDirectories);

        const learningItems: BlogItem[] = [];
        const extractLearningItems = (items: DirectoryItem[]) => {
          items.forEach(item => {
            if (item.type === 'file' && item.learningItem) {
              learningItems.push({
                id: item.id,
                title: item.learningItem.title,
                keywords: item.learningItem.keywords,
                type: 'learning'
              });
            }
            if (item.children) {
              extractLearningItems(item.children);
            }
          });
        };
        extractLearningItems(structuredDirectories);

        setBlogItems([...projectItems, ...learningItems])
      } catch (error) {
        console.error('Error fetching blog items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogItems()
  }, [])

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold mb-2 text-center text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore my Blog
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Discover my projects and learning journey through these posts.
        </motion.p>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select onValueChange={(value) => setFilter(value as 'all' | 'project' | 'learning')}>
              <SelectTrigger className="w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
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
              className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
            className="text-center text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No posts found. Try adjusting your filters or search term.
          </motion.p>
        )}
      </div>
    </div>
  )
}