import { motion } from 'framer-motion'
import { FaGithub, FaKaggle, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa"

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/iceticshacker7" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/divyanshrai7" },
  { icon: FaKaggle, href: "https://kaggle.com/divyanshrai7" },
  { icon: FaTwitter, href: "https://twitter.com" },
  { icon: FaYoutube, href: "https://youtube.com" },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      className="w-full bg-white from-gray-50 to-white border-t border-gray-200 font-mono py-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-8 md:mb-0 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Divyansh Rai</h2>
            <p className="text-sm text-gray-600 mt-2">System Engineer | ML Graduate</p>
          </motion.div>
          <motion.div 
            className="flex space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {socialLinks.map(({ icon: Icon, href }) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </motion.div>
        </div>
        <motion.div 
          className="mt-12 text-center text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p>&copy; {currentYear} Divyansh Rai. All rights reserved.</p>
          <p className="mt-2">
            <motion.a 
              href="https://chatgpt.com/" 
              className="text-blue-500 hover:text-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Powered by AI
            </motion.a>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}