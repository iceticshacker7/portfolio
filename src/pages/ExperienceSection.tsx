'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Briefcase, CircleCheckBig, CircleDot } from 'lucide-react'
import SectionItem from '../component/SectionItem'

const sections = [
  { id: 'Academic', icon: GraduationCap },
  { id: 'Professional', icon: Briefcase },
  { id: 'Offers', icon: CircleCheckBig },
  { id: 'Participations', icon: CircleDot },
]

export default function ExperienceSection() {
  const [activeSection, setActiveSection] = useState('Academic')

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'Academic':
        return (
          <>
            <SectionItem
              title="B.Tech - Artificial Intelligence & Machine Learning"
              description="Grade : 8.7"
              institution="Gyan Ganga Institute of Technology & Sciences, India"
              dateRange="2020 - 2024"
            />
            <SectionItem
              title="Class XII"
              description="Grade : 8.3"
              institution="Maths, Physics, Chemistry | CBSE"
              dateRange="2020"
            />
            <SectionItem
              title="Class X"
              description="Percentage : 84.4%"
              institution="Central Board of Secondary Education, India"
              dateRange="2018"
            />
          </>
        )
      case 'Professional':
        return (
          <>
            <SectionItem
              title="Systems Engineer Trainee"
              description="Trainings : Java | SQL | UNIX | UI Design"
              institution="@ TCSL, India"
              dateRange="August 2024 - Present"
            />
          </>
        )
      case 'Offers':
        return (
          <>
            <SectionItem
              title="Systems Engineer "
              description="Full-time | Status: Accepted"
              institution="@ TCS, India"
              dateRange="18 July 2024"
            />
            <SectionItem
              title="Frontend Developer "
              description="Full-time | Status: Declined"
              institution="@ Prodesk IT, India"
              dateRange="20th July 2024"
            />
            <SectionItem
              title="Software Development Engineer "
              description="Internship + PPO | Status: Revoked"
              institution="@ Brane Enterprises, India"
              dateRange="14 September 2023"
            />
            <SectionItem
              title="Got Awarded NLP research Intership"
              description="Internship | Status: Declined"
              institution="@ IIT Bombay, India"
              dateRange="20th July 2024"
            />
          </>
        )
      case 'Participations':
        return (
          <>
            <SectionItem
              title="Finalist"
              description="Developed a Data Analysis Dashboard using Tableau"
              institution="Microsoft Engage 2022"
              dateRange="2022"
            />
            <SectionItem
              title="Pre-Finalist"
              description="Cleared the first round of the Hackathon"
              institution="Flipkart Grid '22"
              dateRange="2022"
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <motion.div 
      className="flex items-center justify-center bg-gradient-to-br from-white to-gray-50 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className=" text-black p-8 font-sans max-w-4xl w-full">
        <motion.h2 
          className="text-4xl font-bold mb-2 text-center"
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
          {sections.map((section) => (
            <motion.div
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
            </motion.div>
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