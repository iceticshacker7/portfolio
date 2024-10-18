'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const achievements = [
  { text: "Proficient Algorithm Learner", icon: "🏆" },
  { text: "Researched AI Topics", icon: "👥" },
  { text: "Earned ML Certificates ", icon: "🌟" },
  { text: "Trained LLM from scratch", icon: "✍️" },
  // { text: "Give a conference talk", icon: "🎤" }
]

export default function FeaturedAchievements() {
  const [completed, setCompleted] = useState<boolean[]>(new Array(achievements.length).fill(false))

  const toggleAchievement = (index: number) => {
    setCompleted(prev => {
      const newCompleted = [...prev]
      newCompleted[index] = !newCompleted[index]
      return newCompleted
    })
  }

  return (
    <motion.div 
      className="flex justify-center w-full p-1 mt-10 font-mono"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-6xl">
        <motion.h2 
          className="text-3xl mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Featured
        </motion.h2>
        <motion.div 
          className="flex flex-wrap gap-3"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {achievements.map((achievement, index) => (
            <motion.div 
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <motion.div
                className={`flex items-center cursor-pointer p-3 border-2 border-black rounded-lg ${
                  completed[index] ? 'bg-green-100' : 'bg-white'
                }`}
                onClick={() => toggleAchievement(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                <motion.div 
                  className="w-1/5 mr-3 flex items-center justify-center"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: completed[index] ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                </motion.div>
                <div className="w-4/5">
                  <AnimatePresence mode="wait">
                    {completed[index] ? (
                      <motion.span
                        key="completed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="line-through"
                      >
                        {achievement.text}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="uncompleted"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {achievement.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}