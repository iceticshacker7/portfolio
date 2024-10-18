import { motion } from 'framer-motion'

interface SectionItemProps {
  title: string
  description: string
  institution: string
  dateRange: string
}

export default function SectionItem({ title, description, institution, dateRange }: SectionItemProps) {
  return (
    <motion.div 
      className="mb-8 relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-black"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
      />
      <motion.h3 
        className="text-xl font-semibold mb-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-gray-600 mb-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {description}
      </motion.p>
      <motion.p 
        className="text-sm text-gray-500 mb-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {institution}
      </motion.p>
      <motion.p 
        className="text-sm text-gray-400"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {dateRange}
      </motion.p>
    </motion.div>
  )
}