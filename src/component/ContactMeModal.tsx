import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader, Code, Database, Brain } from 'lucide-react'
import emailjs from "@emailjs/browser";
import {
  FaGithub,
  FaKaggle,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
interface ContactMeModalProps {
  isOpen: boolean
  onClose: () => void
}

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/iceticshacker7", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/divyanshrai7", label: "LinkedIn" },
  { icon: FaKaggle, href: "https://kaggle.com/divyanshrai7",label: "Kaggle" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaYoutube, href: "https://youtube.com" , label: "YouTube"},
];
const expertise = [
  { icon: Code, label: "Full-stack Development" },
  { icon: Database, label: "Data Engineering" },
  { icon: Brain, label: "Machine Learning" },
]

export default function ContactMeModal({ isOpen, onClose }: ContactMeModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [submitStatus, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log(name, email, message)
    try {
      await emailjs.send(
        import.meta.env.VITE_SERVICE_ID,
        import.meta.env.VITE_TEMPLATE_ID_CONTACT_US,
        {name, email, message},
        import.meta.env.VITE_PUBLIC_KEY,
      )
      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
    }
    setIsSubmitting(false)
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                  Let's Connect
                </h2>
                <p className="text-gray-600 mt-2">
                  I'm excited to hear from you and discuss potential collaborations!
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Divyansh Rai</h3>
                  <p className="text-gray-600 mb-4">
                    System Engineer | ML Enthusiast | Full-stack Developer
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center bg-white rounded-full px-3 py-1 text-sm text-gray-700"
                        whileHover={{ scale: 1.05 }}
                      >
                        <item.icon size={16} className="mr-2" />
                        {item.label}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex space-x-4">
                    {socialLinks.map((link, index) => (
                      <motion.a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-500 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <link.icon size={24} />
                        <span className="sr-only">{link.label}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg p-6 text-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-xl font-semibold mb-2">Why Work With Me?</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Passionate about cutting-edge technologies</li>
                    <li>Strong problem-solving skills</li>
                    <li>Collaborative team player</li>
                    <li>Committed to delivering high-quality solutions</li>
                  </ul>
                </motion.div>
              </div>

              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 px-4 rounded-md hover:from-blue-600 hover:to-teal-500 transition-all duration-300 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin mr-2" size={20} />
                    ) : (
                      <Send className="mr-2" size={20} />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
                <AnimatePresence>
                  {submitStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-4 p-3 rounded-md ${
                        submitStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {submitStatus === 'success'
                        ? 'Message sent successfully! Closing in 3 seconds...'
                        : 'An error occurred. Please try again.'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}