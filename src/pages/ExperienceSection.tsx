import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Briefcase, CircleCheckBig, CircleDot } from 'lucide-react'
import SectionItem from '../component/SectionItem'
import type { Experience, ExperienceSection as ExperienceSectionName } from '@shared/schemas'
import { seedExperience } from '@shared/seed-data'
import { useApi } from '@/lib/api'

const sections: { id: ExperienceSectionName; icon: typeof GraduationCap }[] = [
  { id: 'Academic', icon: GraduationCap },
  { id: 'Professional', icon: Briefcase },
  { id: 'Offers', icon: CircleCheckBig },
  { id: 'Participations', icon: CircleDot },
]

export default function ExperienceSection() {
  const [activeSection, setActiveSection] = useState<ExperienceSectionName>('Academic')
  const { data, loading, error } = useApi<Experience[]>('/experience', [])
  const entries = error ? seedExperience.map((e, i) => ({ ...e, id: `seed-${i}` })) : data
  const visible = sections.filter((s) => loading || entries.some((e) => e.section === s.id))

  const renderSectionContent = () => {
    if (loading) return <div className="h-40 rounded bg-gray-100 animate-pulse" />
    return entries
      .filter((e) => e.section === activeSection)
      .map((e) => (
        <SectionItem key={e.id} title={e.title} description={e.description} institution={e.institution} dateRange={e.dateRange} />
      ))
  }

  return (
    <motion.div 
      className="flex items-center justify-center bg-gradient-to-br from-white to-gray-50 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-black px-4 py-8 sm:p-8 font-sans max-w-4xl w-full">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold mb-2 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Experience
        </motion.h2>
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          My journey in the academic & professional front
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap justify-center mb-8 gap-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {visible.map((section) => (
            <motion.button
              type="button"
              key={section.id}
              className={`flex items-center cursor-pointer px-4 py-2 rounded-full transition-colors ${
                activeSection === section.id ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <section.icon className="w-5 h-5 mr-2" />
              <span>{section.id}</span>
            </motion.button>
          ))}
        </motion.div>
        
        <motion.div 
          className="relative border-l-2 border-black pl-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}