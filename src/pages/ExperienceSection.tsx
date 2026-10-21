import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Briefcase, CircleCheckBig, CircleDot } from 'lucide-react'
import SectionItem from '../component/SectionItem'
import type { Experience, ExperienceSection as ExperienceSectionName } from '@shared/schemas'
import { seedExperience } from '@shared/seed-data'
import { useApi } from '@/lib/api'
import PageHeader, { PageShell } from '@/component/PageHeader'
import { useStaticSeo } from '@/lib/seo'

const sections: { id: ExperienceSectionName; icon: typeof GraduationCap }[] = [
  { id: 'Academic', icon: GraduationCap },
  { id: 'Professional', icon: Briefcase },
  { id: 'Offers', icon: CircleCheckBig },
  { id: 'Participations', icon: CircleDot },
]

export default function ExperienceSection() {
  useStaticSeo('/experience')
  const [activeSection, setActiveSection] = useState<ExperienceSectionName>('Academic')
  const { data, loading, error } = useApi<Experience[]>('/experience', [])
  const entries = error ? seedExperience.map((e, i) => ({ ...e, id: `seed-${i}` })) : data
  const visible = sections.filter((s) => loading || entries.some((e) => e.section === s.id))

  const renderSectionContent = () => {
    if (loading) return <div className="h-40 rounded bg-muted animate-pulse" />
    return entries
      .filter((e) => e.section === activeSection)
      .map((e) => (
        <SectionItem key={e.id} title={e.title} description={e.description} institution={e.institution} dateRange={e.dateRange} />
      ))
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Journey" title="Experience" subtitle="My path across academics, work, offers and competitions." />

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label="Experience categories">
          {visible.map((section) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              key={section.id}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon className="w-4 h-4" />
              {section.id}
            </button>
          ))}
        </div>

        <div className="relative border-l-2 border-border pl-8 ml-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  )
}
