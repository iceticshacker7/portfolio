import { motion } from "framer-motion"
import { ArrowRight, Code, Database, Brain, Users, Zap } from "lucide-react"

const expertiseAreas = [
  { icon: Code, text: "Full-stack Development" },
  { icon: Database, text: "Data Engineering & Analysis" },
  { icon: Brain, text: "Machine Learning & AI" },
  { icon: Users, text: "Team Collaboration" },
  { icon: Zap, text: "Rapid Prototyping" },
]

export default function AboutSection({ contact }: { contact: () => void }) {
   
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
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Me?</h3>
          <p className="text-gray-600 mb-6">
            As a passionate and innovative technologist, I bring a unique blend of technical expertise and creative problem-solving to every project. With a strong foundation in both software development and data science, I'm able to tackle complex challenges and deliver robust, scalable solutions that drive real business value.
          </p>
          <p className="text-gray-600 mb-6">
            My commitment to continuous learning keeps me at the forefront of emerging technologies, allowing me to implement cutting-edge solutions that give your projects a competitive edge. Whether it's developing intuitive user interfaces, architecting efficient backend systems, or extracting actionable insights from data, I'm dedicated to exceeding expectations and pushing the boundaries of what's possible.
          </p>
          <motion.div
            className="flex items-center text-blue-600 font-semibold cursor-pointer group"
            whileHover={{ x: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="mr-2">View my full resume</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            {expertiseAreas.map((area, index) => (
              <motion.li
                key={index}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <area.icon className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-gray-700">{area.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Collaborate?</h3>
        <p className="text-gray-600 mb-6">
          I'm always excited to take on new challenges and contribute to innovative projects. Let's work together to bring your ideas to life and create something extraordinary.
        </p>
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