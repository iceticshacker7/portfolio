import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs  } from 'firebase/firestore'
import { db } from '../firebase'  // Adjust Firebase import path
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronDown, File, Folder, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent,  CardFooter, CardHeader} from "@/components/ui/card"
import { Link } from 'react-router-dom'

// ... (keep all interfaces and other components unchanged)
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

interface DirectoryItem {
  id: string
  name: string
  type: 'folder' | 'file'
  parentId: string | null
  children?: DirectoryItem[]
  learningItem?: LearningItem
}
const ShimmerCard: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </CardFooter>
    </Card>
  )
}
// const ZoomableContent: React.FC<{ content: string; type: 'image' | 'gif' | 'html' }> = ({ content, type }) => {
//   return (
//     <TransformWrapper
//       initialScale={1}
//       initialPositionX={0}
//       initialPositionY={0}
//     >
//       {({ zoomIn, zoomOut, resetTransform }) => (
//         <React.Fragment>
//           <div className="tools mb-2">
//             <Button onClick={() => zoomIn()} className="mr-2">
//               <ZoomIn className="h-4 w-4 mr-2" />
//               Zoom In
//             </Button>
//             <Button onClick={() => zoomOut()} className="mr-2">
//               <ZoomOut className="h-4 w-4 mr-2" />
//               Zoom Out
//             </Button>
//             <Button onClick={() => resetTransform()}>
//               <Move className="h-4 w-4 mr-2" />
//               Reset
//             </Button>
//           </div>
//           <TransformComponent
//             contentClass="w-full h-full"
//           >
//             {type === 'html' ? (
//               <iframe
//                 src={content}
//                 title="HTML Content"
//                 className="w-full h-full rounded-lg"
//                 style={{ pointerEvents: 'auto' }}
//               />
//             ) : (
//               <img src={content} alt="Learning content" className="max-w-full h-auto" />
//             )}
//           </TransformComponent>
//         </React.Fragment>
//       )}
//     </TransformWrapper>
//   )
// }

// const HTMLContent: React.FC<{ content: string }> = ({ content }) => {
//   const [isExpanded, setIsExpanded] = useState(false)

//   return (
//     <div className="w-full">
//       <iframe
//         src={content}
//         title="HTML Content"
//         className={`w-full rounded-lg mb-4 ${isExpanded ? 'h-screen' : 'h-[500px]'}`}
//       />
//       <div className="flex justify-end space-x-2">
//         <Button onClick={() => setIsExpanded(!isExpanded)}>
//           <Expand className="h-4 w-4 mr-2" />
//           {isExpanded ? 'Collapse' : 'Expand'}
//         </Button>
//         <Button onClick={() => window.open(content, '_blank')}>
//           <ExternalLink className="h-4 w-4 mr-2" />
//           View on New Page
//         </Button>
//       </div>
//     </div>
//   )
// }

// export const LearningContent: React.FC<{ item: LearningItem }> = ({ item }) => {
//   return (
//     <div className="space-y-6">
//       <motion.h2 
//         className="text-3xl font-bold"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         {item.title}
//       </motion.h2>
//       <motion.div 
//         className="flex flex-wrap gap-2"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2, duration: 0.5 }}
//       >
//         {item.keywords.map((keyword, index) => (
//           <span
//             key={index}
//             className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold"
//           >
//             {keyword}
//           </span>
//         ))}
//       </motion.div>
//       {item.content.map((content, index) => (
//         <motion.div
//           key={index}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 * index, duration: 0.5 }}
//         >
//           {content.type === 'text' && (
//             <p className="text-gray-700 leading-relaxed">{content.content}</p>
//           )}
//           {content.type === 'code' && (
//             <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
//               <code className={`language-${content.language}`}>{content.content}</code>
//             </pre>
//           )}
//           {(content.type === 'image' || content.type === 'gif') && (
//             <ZoomableContent content={content.content} type={content.type} />
//           )}
//           {content.type === 'html' && (
//             content.category ? (
//               <HTMLContent content={content.content} />
//             ) : (
//               <iframe
//                 src={content.content}
//                 title="HTML Content"
//                 className="w-full h-[500px] rounded-lg mb-4"
//               />
//             )
//           )}
//           {content.type === 'notebook' && (
//             <div className="bg-gray-100 p-4 rounded-lg">
//               <h4 className="text-lg font-semibold mb-2">Jupyter Notebook Output</h4>
//               <pre className="whitespace-pre-wrap overflow-x-auto">{content.content}</pre>
//             </div>
//           )}
//         </motion.div>
//       ))}
//     </div>
//   )
// }

const DirectoryView: React.FC<{ items: DirectoryItem[], onSelect: (item: DirectoryItem) => void }> = ({ items, onSelect }) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border p-4">
      {items.map((item) => (
        <DirectoryItemView key={item.id} item={item} onSelect={onSelect} depth={0} />
      ))}
    </ScrollArea>
  )
}

const DirectoryItemView: React.FC<{ item: DirectoryItem; onSelect: (item: DirectoryItem) => void; depth: number }> = ({ item, onSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <motion.div 
      style={{ marginLeft: `${depth * 20}px` }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
    >
      {item.type === 'folder' ? (
        <div>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              toggleOpen()
              onSelect(item)
            }}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Folder className="h-4 w-4 inline-block mr-2 text-blue-500" />
          <span className="ml-1 text-sm font-medium">{item.name}</span>
          <AnimatePresence>
            {isOpen && item.children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.children.map((child) => (
                  <DirectoryItemView key={child.id} item={child} onSelect={onSelect} depth={depth + 1} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center py-1">
          <File className="h-4 w-4 text-gray-400 mr-2" />
          <Button 
            variant="link" 
            className="text-sm p-0 h-auto hover:text-blue-500 transition-colors" 
            onClick={() => onSelect(item)}
          >
            {item.name}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
const ItemCard: React.FC<{ item: DirectoryItem; onClick: () => void }> = ({ item, onClick }) => {
  const cardContent = (
    <Card className="w-full bg-gradient-to-r from-blue-100 to-purple-100 border-0 overflow-hidden cursor-pointer transition-transform transform hover:scale-105 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-md">
        {item.type === 'folder' ? (
          <div className="w-full h-32 bg-blue-200 flex items-center justify-center">
            <Folder size={48} className="text-blue-600" />
          </div>
        ) : (
          <div className="w-full h-32 bg-purple-200 flex items-center justify-center">
            <File size={48} className="text-purple-600" />
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-grow">
        <h3 className="text-lg font-semibold mt-1 hover:underline cursor-pointer">{item.name}</h3>
        {item.type === 'file' && item.learningItem && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.learningItem.keywords.slice(0, 3).map((keyword, index) => (
              <span key={index} className="text-xs text-blue-600">
                {keyword}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-4">
          {item.type === 'folder' 
            ? `This folder contains ${item.children?.length || 0} items.`
            : item.learningItem?.content[0].content.substring(0, 100) + '...'
          }
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {item.type === 'folder' ? (
          <span className="text-sm text-gray-500">{item.children?.length || 0} items</span>
        ) : (
          <ExternalLink size={20} className="text-blue-600 hover:text-blue-800" />
        )}
      </CardFooter>
    </Card>
  )

  return item.type === 'file' ? (
    <Link to={`/learning/${item.id}`}>
      {cardContent}
    </Link>
  ) : (
    <div onClick={onClick}>
      {cardContent}
    </div>
  )
}

const HierarchicalLearningTags: React.FC = () => {
  const [directories, setDirectories] = useState<DirectoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null)
  const [currentItems, setCurrentItems] = useState<DirectoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDirectories()
  }, [])

  useEffect(() => {
    const savedDirectory = localStorage.getItem('selectedDirectory')
    if (savedDirectory) {
      const parsedDirectory = JSON.parse(savedDirectory) as DirectoryItem
      setSelectedItem(parsedDirectory)
      handleItemSelection(parsedDirectory)
    }
  }, [])

  const fetchDirectories = async () => {
    const querySnapshot = await getDocs(collection(db, 'directories'))
    const fetchedDirectories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem))
    const structuredDirectories = buildDirectoryTree(fetchedDirectories)
    setDirectories(structuredDirectories)
    setCurrentItems(structuredDirectories)
  }

  const buildDirectoryTree = (items: DirectoryItem[]): DirectoryItem[] => {
    const itemMap = new Map<string, DirectoryItem>()
    items.forEach(item => itemMap.set(item.id, { ...item, children: [] }))
    
    const rootItems: DirectoryItem[] = []
    itemMap.forEach(item => {
      if (item.parentId === null) {
        rootItems.push(item)
      } else {
        const parent = itemMap.get(item.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(item)
        }
      }
    })
    
    return rootItems
  }

  const handleItemSelection = async (item: DirectoryItem) => {
    setSelectedItem(item)
    localStorage.setItem('selectedDirectory', JSON.stringify(item))
    setIsLoading(true)
    
    if (item.type === 'folder') {
      setCurrentItems(item.children || [])
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 font-mono py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          My Learning Journey
        </motion.h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            className="w-full lg:w-1/3 bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4">Topics</h2>
            <DirectoryView items={directories} onSelect={handleItemSelection} />
          </motion.div>
          <motion.div 
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Contents</h2>
              {selectedItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading ? (
                    Array(4).fill(0).map((_, index) => <ShimmerCard key={index} />)
                  ) : (
                    currentItems.map(item => (
                      <ItemCard key={item.id} item={item} onClick={() => handleItemSelection(item)} />
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Select a folder to view its contents.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HierarchicalLearningTags