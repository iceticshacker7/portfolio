import { motion } from 'framer-motion'
import type { SkillCategory as Skill } from '@shared/schemas'
import { useSkills } from '@/lib/useSkills'
import { SkillIconView } from '@/lib/icons'
import PageHeader, { PageShell } from '@/component/PageHeader'
import { useStaticSeo } from '@/lib/seo'

function SkillCategory({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.div
      className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <SkillIconView icon={skill.icon} className="w-5 h-5" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">{skill.name}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {skill.skills.map((item) => (
          <span key={item} className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground/85">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default function SkillsTree() {
  useStaticSeo('/resume')
  const { skills: skillsData, loading } = useSkills()
  return (
    <PageShell>
      <PageHeader eyebrow="Toolkit" title="Skills" subtitle="Languages, frameworks, platforms and subjects I work with." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)
          : skillsData.map((skill, index) => <SkillCategory key={skill.id} skill={skill} index={index} />)}
      </div>
    </PageShell>
  )
}
