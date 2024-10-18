import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ExternalLink, Github } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  subtags: string[]
  image: string
  liveUrl: string
  githubUrl: string
}

const allTags = ['Any topic', 'Machine Learning', 'Data Visualization', 'Full-Stack_Development', 'Computer Vision', 'Python', 'Data Analysis', 'R']

const subtags = {
  'Machine Learning': ['Python', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Neural Networks', 'SVM', 'Random Forest'],
  'Data Visualization': ['Matplotlib', 'D3.js', 'Plotly', 'Seaborn'],
  'Full-Stack_Development': ['React', 'Node.js',"GitHub"],
  'Computer Vision': ['OpenCV', 'TensorFlow', 'PyTorch'],
  'Python': ['Numpy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
  'Data Analysis': ['R', 'Python', 'SQL', 'Tableau'],
  'R': ['ggplot2', 'dplyr', 'tidyr', 'caret']
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="w-full bg-gradient-to-r from-blue-100 to-purple-100 border-0 overflow-hidden cursor-pointer transition-transform transform hover:scale-105 flex flex-col h-full">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={project.image}
            alt={`${project.title} Banner`}
            className="w-full h-32 object-cover"
          />
        </div>
        <CardContent className="p-3 flex-grow">
          <h3 className="text-lg font-semibold mt-1 hover:underline cursor-pointer">{project.title}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tech, index) => (
              <span key={index} className="text-xs text-blue-600">
                {tech}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 line-clamp-4">
            {project.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            <ExternalLink size={20} />
          </a>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            <Github size={20} />
          </a>
        </CardFooter>
      </Card>
    </Link>
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
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('Any topic')
  const [activeSubtag, setActiveSubtag] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'))
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]
        setProjects(projectsData)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = activeSubtag
    ? projects.filter(project => project.subtags.includes(activeSubtag))
    : activeTag === 'Any topic'
      ? projects
      : projects.filter(project => project.tags.includes(activeTag))

  return (
    <div className="py-12 px-8 bg-gradient-to-b from-white to-gray-100 font-mono">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore my projects.
        </motion.h2>

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

        {activeTag !== 'Any topic' && subtags[activeTag as keyof typeof subtags] && (
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {subtags[activeTag as keyof typeof subtags].map((subtag) => (
              <motion.button
                key={subtag}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeSubtag === subtag 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSubtag(subtag)}
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
      </div>
    </div>
  )
}