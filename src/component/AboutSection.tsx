import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Code, Database, Brain, Users, Zap } from "lucide-react"
import { useProfile } from "@/lib/profile"

const expertiseIcons = [Code, Database, Brain, Users, Zap]

export default function AboutSection({ contact }: { contact: () => void }) {
  const { about, resumeUrl } = useProfile().profile

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">About Me</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-400 mx-auto"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">{about.title}</h3>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-600 mb-6">
              {p}
            </p>
          ))}
          <motion.div whileHover={{ x: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 font-semibold group">
                <span className="mr-2">View my full resume</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <Link to="/resume" className="inline-flex items-center text-blue-600 font-semibold group">
                <span className="mr-2">View my skills</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">My Expertise</h3>
          <ul className="space-y-4">
            {about.expertise.map((text, index) => {
              const Icon = expertiseIcons[index % expertiseIcons.length]
              return (
              <motion.li
                key={text}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-gray-700">{text}</span>
              </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center"
      >
        {about.ctaTitle && <h3 className="text-2xl font-semibold text-gray-900 mb-4">{about.ctaTitle}</h3>}
        {about.ctaText && <p className="text-gray-600 mb-6">{about.ctaText}</p>}
        <motion.button
        onClick={contact}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-md shadow-md hover:from-blue-600 hover:to-teal-500 transition-all duration-300"
        >
          Get in Touch
        </motion.button>
      </motion.div>
    </section>
  )
}