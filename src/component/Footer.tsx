import { motion } from 'framer-motion'
import { FaGithub, FaKaggle, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa"

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/iceticshacker7" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/divyanshrai7" },
  { icon: FaKaggle, href: "https://kaggle.com" },
  { icon: FaTwitter, href: "https://twitter.com" },
  { icon: FaYoutube, href: "https://youtube.com" },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      className="w-full bg-gradient-to-b from-white to-gray-100 border-t-2 border-black font-mono py-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold">Divyansh Rai</h2>
            <p className="text-sm text-gray-600">System Engineer | ML Enthusiast</p>
          </motion.div>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {socialLinks.map(({ icon: Icon, href }) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </motion.div>
        </div>
        <motion.div 
          className="mt-8 text-center text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p>&copy; {currentYear} Divyansh Rai. All rights reserved.</p>
          <p className="mt-2">
          <a href="#" className="hover:underline ml-2">Powered by AI</a>

            {/* <a href="#" className="hover:underline">Privacy Policy</a> |  */}
            {/* <a href="#" className="hover:underline ml-2">Terms of Service</a> */}
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}