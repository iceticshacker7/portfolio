import React from 'react'
import { motion } from 'framer-motion'
import type { SkillCategory as Skill } from '@shared/schemas'
import { useSkills } from '@/lib/useSkills'
import { SkillIconView } from '@/lib/icons'

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
        <SkillIconView icon={skill.icon} className="w-6 h-6" />
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
  const { skills: skillsData, loading } = useSkills()
  return (
    <div className="px-4 py-8 sm:p-8 bg-gradient-to-br from-white to-gray-50 font-mono">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl sm:text-4xl text-black font-bold mb-2 text-center"
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
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />)
            : skillsData.map((skill, index) => (
                <SkillCategory key={skill.id} skill={skill} index={index} />
              ))}
        </div>
      </div>
    </div>
  )
}