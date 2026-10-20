import type { SkillCategory } from '@shared/schemas'
import { seedSkills } from '@shared/seed-data'
import { useApi } from './api'

/** Skill categories; `featuredOnly` is used by the home page. Falls back to the built-in list if the API is down. */
export function useSkills(featuredOnly = false) {
  const { data, loading, error } = useApi<SkillCategory[]>(featuredOnly ? '/skills?featured=1' : '/skills', [])
  const fallback = seedSkills.filter((s) => !featuredOnly || s.featured).map((s, i) => ({ ...s, id: `seed-${i}` }))
  return { skills: error ? fallback : data, loading }
}

