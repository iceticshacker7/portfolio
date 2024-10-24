'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Code, Globe, Database, BookOpen, BookPlus, Library, Server, School, Bot } from 'lucide-react'

interface Skill {
  name: string
  icon: React.ReactNode
  skills: string[]
}

const skillsData: Skill[] = [
  {
    name: 'Programming Languages',
    icon: <Code className="w-6 h-6" />,
    skills: ['C', 'C++', 'Python', 'JavaScript'],
  },
  {
    name: 'Web-Technologies',
    icon: <Globe className="w-6 h-6" />,
    skills: ['HTML5', 'CSS', 'Tailwind CSS', 'React.js', 'Express.js', 'Node.js'],
  },
  {
    name: 'Databases',
    icon: <Database className="w-6 h-6" />,
    skills: ['MongoDB', 'SQL/MySQL'],
  },
  {
    name: 'AI & Data Science',
    icon: <Library className="w-6 h-6" />,
    skills: ['Scikit-Learn', 'Tensorflow', 'OpenCV', 'NLP', 'Pytorch', 'numpy', 'pandas', 'matplotlib','seaborn','Tableau'],
  },
  {
    name: 'Subjects',
    icon: <BookOpen className="w-6 h-6" />,
    skills: ['Machine Learning', 'Deep Learning',  'Computer Vision', 'Statistics & Probability','Natural Language Processing (NLP)'],
  },
  {
    name: 'Academic',
    icon: <School className="w-6 h-6" />,
    skills: ['Data Structures and Algorithms (DSA)', 'Test Driven Development (TDD)', 'Object-Oriented Programming (OOP)', 'Database Management Systems'],
  },
  {
    name: 'Services',
    icon: <Server className="w-6 h-6" />,
    skills: ['AWS (RDS, EC2)', 'Oracle Cloud', 'Google Qwik-Labs',  'Vercel','Firebase'],
  },
  {
    name: 'Gen-AI Tools',
    icon: <Bot className="w-6 h-6" />,
    skills: ['GPT', 'Claude', 'Hugging Face',  'v0.dev','Copilot','Gemini'],
  },
  {
    name: 'Miscellaneous',
    icon: <BookPlus className="w-6 h-6" />,
    skills: [ 'Visual Studio', 'GitHub', 'PuTTY', 'VM-Oracle', 'Linux'],
  },
]

const SkillCategory: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => {
  return (
    <motion.div 
      className=" rounded-lg  p-6 flex flex-col items-center transform transition-all hover:scale-105"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div 
        className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white mb-4"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {skill.icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-4 text-center">{skill.name}</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {skill.skills.map((item, index) => (
          <motion.span 
            key={index} 
            className="bg-gradient-to-br from-teal-50 to-blue-50 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

export default function SkillsTree() {
  return (
    <div className="p-8 bg-gradient-to-br from-white to-gray-50 font-mono">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl text-black font-bold mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Skills
        </motion.h2>
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          My Expertise and Skillset
        </motion.p>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillsData.map((skill, index) => (
            <SkillCategory key={index} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}