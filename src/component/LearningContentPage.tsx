import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'  // Adjust Firebase import path
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Expand, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

const ZoomableContent: React.FC<{ content: string; type: 'image' | 'gif' | 'html' }> = ({ content, type }) => {
  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <React.Fragment>
          <div className="tools mb-2">
            <Button onClick={() => zoomIn()} className="mr-2">
              Zoom In
            </Button>
            <Button onClick={() => zoomOut()} className="mr-2">
              Zoom Out
            </Button>
            <Button onClick={() => resetTransform()}>
              Reset
            </Button>
          </div>
          <TransformComponent
            contentClass="w-full h-full"
          >
            {type === 'html' ? (
              <iframe
                src={content}
                title="HTML Content"
                className="w-full h-full rounded-lg"
                style={{ pointerEvents: 'auto' }}
              />
            ) : (
              <img src={content} alt="Learning content" className="max-w-full h-auto" />
            )}
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>
  )
}
const renderContent = (content: LearningItem['content'][0]) => {
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
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
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
const HTMLContent: React.FC<{ content: string,category : boolean }> = ({ content,category }) => {
  const openInNewPage = () => {
    window.open(content, '_blank')
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between">
        <Dialog>
          <DialogTrigger asChild >
            <Button>
              <Expand className="h-4 w-4 mr-2 " />
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-7xl h-[90vh]">
            <iframe
              src={content}
              title="HTML Content"
              className="w-full h-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
        {category==true && <Button onClick={openInNewPage}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Page
        </Button>}
      </div>
      <iframe
        src={content}
        title="HTML Content"
        className="w-full rounded-lg mb-4 h-[600px]"
      />
    </div>
  )
}

const LearningContent: React.FC<{ item: LearningItem }> = ({ item }) => {
  return (
    <div className="space-y-8">
      <motion.h2 
        className="text-4xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {item.title}
      </motion.h2>
      <motion.div 
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {item.keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold"
          >
            {keyword}
          </span>
        ))}
      </motion.div>
      {item.content.map((content, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.5 }}
          className="rounded-lg p-6"
        >
          {content.type === 'text' && (
            <p className="text-gray-700 leading-relaxed text-lg">{content.content}</p>
          )}
           {(content.type === 'code' || content.language === 'markdown') && renderContent(content)}
          {(content.type === 'image' || content.type === 'gif') && (
            <ZoomableContent content={content.content} type={content.type} />
          )}
          
          {content.type === 'html' && (
            <HTMLContent content={content.content} category= {content.category} />
          )}
          {content.type === 'notebook' && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Jupyter Notebook Output</h4>
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default function LearningContentPage() {
  const { id } = useParams<{ id: string }>()
  const [directoryItem, setDirectoryItem] = useState<DirectoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([])

  useEffect(() => {
    if (id) {
      fetchDirectoryItem(id)
    }
  }, [id])

  const fetchDirectoryItem = async (itemId: string) => {
    try {
      const docRef = doc(db, 'directories', itemId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as DirectoryItem
        setDirectoryItem(data)
        setBreadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Learning', path: '/learnings' },
          { name: data.name, path: `/learning/${itemId}` }
        ])
      } else {
        console.log('No such document!')
      }
    } catch (error) {
      console.error('Error fetching directory item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      className="min-h-screen  font-sans py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <Link
                  to={crumb.path}
                  className={`inline-flex items-center text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-500 cursor-default'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <Link to="/learnings">
          <Button className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Journey
          </Button>
        </Link>
        <AnimatePresence>
          {isLoading ? (
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
              className="rounded-lg p-8"
            >
              <LearningContent item={directoryItem.learningItem} />
            </motion.div>
          ) : (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-6 text-center"
            >
              <p className="text-gray-500">Learning item not found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}