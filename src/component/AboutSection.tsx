import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Code, Database, Brain, Users, Zap, Mail } from "lucide-react"
import { useProfile } from "@/lib/profile"

const expertiseIcons = [Code, Database, Brain, Users, Zap]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 },
}

export default function AboutSection({ contact }: { contact: () => void }) {
  const { about, resumeUrl } = useProfile().profile

  return (
    <section id="about" className="w-full py-16 sm:py-20 bg-muted/40 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">About me</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{about.title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
          <motion.div {...reveal} className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                View my full resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : (
              <Link to="/resume" className="group inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                View all my skills
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </motion.div>

          <motion.div {...reveal} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-5">What I bring</h3>
            <ul className="space-y-4">
              {about.expertise.map((text, index) => {
                const Icon = expertiseIcons[index % expertiseIcons.length]
                return (
                  <li key={text} className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-foreground/90">{text}</span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>

        {(about.ctaTitle || about.ctaText) && (
          <motion.div
            {...reveal}
            className="mt-14 rounded-2xl bg-slate-900 dark:bg-card dark:border dark:border-border px-6 py-10 sm:px-12 text-center text-white shadow-lg"
          >
            {about.ctaTitle && <h3 className="text-2xl font-bold">{about.ctaTitle}</h3>}
            {about.ctaText && <p className="mt-3 max-w-2xl mx-auto text-slate-300">{about.ctaText}</p>}
            <button
              onClick={contact}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Mail className="h-4 w-4" /> Get in touch
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
