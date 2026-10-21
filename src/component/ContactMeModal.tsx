import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader, Code, Database, Brain } from 'lucide-react'
import emailjs from "@emailjs/browser";
import { api } from '@/lib/api'
import { useProfile } from '@/lib/profile'
import { socialIconMap } from '@/lib/icons'

interface ContactMeModalProps {
  isOpen: boolean
  onClose: () => void
}

const expertiseIcons = [Code, Database, Brain]
const emailjsConfigured = Boolean(
  import.meta.env.VITE_SERVICE_ID && import.meta.env.VITE_TEMPLATE_ID_CONTACT_US && import.meta.env.VITE_PUBLIC_KEY,
)

export default function ContactMeModal({ isOpen, onClose }: ContactMeModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [website, setWebsite] = useState('')
  const { profile } = useProfile()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

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
    // The message is always saved to the database (visible under Admin > Messages);
    // EmailJS additionally emails it when configured.
    const results = await Promise.allSettled([
      api.post('/contact', { name, email, message, website }),
      emailjsConfigured
        ? emailjs.send(
            import.meta.env.VITE_SERVICE_ID,
            import.meta.env.VITE_TEMPLATE_ID_CONTACT_US,
            { name, email, message },
            import.meta.env.VITE_PUBLIC_KEY,
          )
        : Promise.reject(new Error('EmailJS not configured')),
    ])
    if (results.some((r) => r.status === 'fulfilled')) {
      setSubmitStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } else {
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
          className="fixed inset-0 bg-foreground bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-card rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 id="contact-title" className="text-2xl sm:text-3xl font-bold text-foreground">
                  Let's Connect
                </h2>
                <p className="text-muted-foreground mt-2">
                  I'm excited to hear from you and discuss potential collaborations!
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="hidden md:block">
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">{profile.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    {profile.footerTagline}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.about.expertise.slice(0, 3).map((label, index) => {
                      const Icon = expertiseIcons[index % expertiseIcons.length]
                      return (
                      <motion.div
                        key={label}
                        className="flex items-center bg-card rounded-full px-3 py-1 text-sm text-foreground/85"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Icon size={16} className="mr-2" />
                        {label}
                      </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex space-x-4">
                    {profile.socials.map(({ platform, url }) => {
                      const link = { ...socialIconMap[platform], href: url }
                      return (
                      <motion.a
                        key={url}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-blue-500 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <link.Icon size={24} />
                        <span className="sr-only">{link.label}</span>
                      </motion.a>
                      )
                    })}
                  </div>
                </div>

                <motion.div
                  className="rounded-lg border border-border bg-muted/50 p-6 text-foreground"
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
                  {/* Honeypot: hidden from people, filled in by spam bots. */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="hidden"
                    aria-hidden="true"
                  />
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground/85 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground/85 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground/85 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={5000}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
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
                        submitStatus === 'success' ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200'
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