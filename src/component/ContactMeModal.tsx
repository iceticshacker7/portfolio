import React, { useState, useEffect } from 'react'
import { Send, Loader, CheckCircle2 } from 'lucide-react'
import emailjs from "@emailjs/browser";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { useProfile } from '@/lib/profile'
import { socialIconMap } from '@/lib/icons'

interface ContactMeModalProps {
  isOpen: boolean
  onClose: () => void
}

const emailjsConfigured = Boolean(
  import.meta.env.VITE_SERVICE_ID && import.meta.env.VITE_TEMPLATE_ID_CONTACT_US && import.meta.env.VITE_PUBLIC_KEY,
)

const inputClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'

// Rendered through the Radix dialog portal (on document.body), so the sticky header's
// backdrop-filter can't trap it and the overlay always covers the whole viewport.
export default function ContactMeModal({ isOpen, onClose }: ContactMeModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [website, setWebsite] = useState('')
  const { profile } = useProfile()

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border-border bg-card p-0 gap-0 sm:rounded-2xl">
        <div className="grid md:grid-cols-[1fr_1.3fr]">
          <aside className="hidden md:flex flex-col gap-5 rounded-l-2xl border-r border-border bg-muted/40 p-7">
            <div className="flex items-center gap-3">
              {profile.avatar && <img src={profile.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />}
              <div>
                <p className="font-semibold text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.headline}</p>
              </div>
            </div>
            {profile.focusAreas.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus areas</p>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
                  {profile.focusAreas.map((area) => (
                    <li key={area} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-auto flex gap-3">
              {profile.socials.map(({ platform, url }) => {
                const { Icon, label } = socialIconMap[platform]
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </aside>

          <div className="p-6 sm:p-7">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Get in touch</DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              Hiring, collaborating or just want to talk ML? Send a message and I'll reply by email.
            </DialogDescription>

            {submitStatus === 'success' ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-xl bg-green-50 p-8 text-center text-green-800 dark:bg-green-950/40 dark:text-green-200">
                <CheckCircle2 className="h-10 w-10" />
                <p className="font-medium">Thanks, your message was sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-foreground">Name</label>
                    <input id="contact-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
                    <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-foreground">Message</label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={5000}
                    className={`${inputClass} h-36 resize-none`}
                    required
                  />
                </div>
                {submitStatus === 'error' && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                    Something went wrong. Please try again, or reach me on LinkedIn.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
