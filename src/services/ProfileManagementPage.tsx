import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { socialPlatforms, type Profile, type SocialPlatform } from '@shared/schemas'
import { seedProfile } from '@shared/seed-data'
import { api, useApi } from '@/lib/api'
import { withToast } from '@/lib/notify'
import { useProfile } from '@/lib/profile'
import { socialIconMap } from '@/lib/icons'
import { Field, LinesInput, ListInput, UrlOrUpload } from './form'

export default function ProfileManagementPage() {
  const { data, loading } = useApi<Profile | null>('/profile', null)
  const { reload: reloadSiteProfile } = useProfile()
  const [profile, setProfile] = useState<Profile>(seedProfile)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setProfile({ ...seedProfile, ...data, about: { ...seedProfile.about, ...data.about } })
  }, [data])

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => ({ ...p, [key]: value }))
  const setAbout = (patch: Partial<Profile['about']>) => setProfile((p) => ({ ...p, about: { ...p.about, ...patch } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...profile,
      focusAreas: profile.focusAreas.filter((f) => f.trim()),
      about: { ...profile.about, paragraphs: profile.about.paragraphs.filter((p) => p.trim()) },
    }
    if (await withToast(() => api.put('/profile', body), 'Profile saved')) reloadSiteProfile()
    setSaving(false)
  }

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile & About</h1>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </div>
      {!data && (
        <p className="text-sm rounded-md bg-yellow-50 border border-yellow-200 p-3">
          No profile is saved yet, so the site is showing the built-in defaults below. Save once to store them in the database.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Hero card</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={profile.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Initials (avatar fallback)">
            <Input value={profile.initials} maxLength={4} onChange={(e) => set('initials', e.target.value)} />
          </Field>
        </div>
        <Field label="Photo" hint="Leave empty to use the photo bundled with the site.">
          <UrlOrUpload value={profile.avatar} onChange={(v) => set('avatar', v)} />
        </Field>
        <Field label="Headline (typed out on the home page)">
          <Input value={profile.headline} onChange={(e) => set('headline', e.target.value)} />
        </Field>
        <Field label="Focus areas" hint="One per line.">
          <LinesInput value={profile.focusAreas} onChange={(v) => set('focusAreas', v)} rows={5} />
        </Field>
        <Field label="Key skills line">
          <Input value={profile.keySkills} onChange={(e) => set('keySkills', e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Footer tagline">
            <Input value={profile.footerTagline} onChange={(e) => set('footerTagline', e.target.value)} />
          </Field>
          <Field label="Resume (PDF)">
            <UrlOrUpload value={profile.resumeUrl} onChange={(v) => set('resumeUrl', v)} accept=".pdf" preview={false} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Social links</h2>
        {profile.socials.map((social, i) => (
          <div key={i} className="flex gap-2">
            <Select
              value={social.platform}
              onValueChange={(v) => set('socials', profile.socials.map((s, j) => (j === i ? { ...s, platform: v as SocialPlatform } : s)))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {socialIconMap[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={social.url}
              placeholder={social.platform === 'email' ? 'mailto:you@example.com' : 'https://…'}
              onChange={(e) => set('socials', profile.socials.map((s, j) => (j === i ? { ...s, url: e.target.value } : s)))}
            />
            <Button type="button" variant="ghost" aria-label="Remove link" onClick={() => set('socials', profile.socials.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('socials', [...profile.socials, { platform: 'website', url: '' }])}>
          <Plus className="h-4 w-4 mr-1" /> Add link
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">About section</h2>
        <Field label="Heading">
          <Input value={profile.about.title} onChange={(e) => setAbout({ title: e.target.value })} />
        </Field>
        <Field label="Paragraphs" hint="Separate paragraphs with a blank line.">
          <Textarea
            rows={8}
            value={profile.about.paragraphs.join('\n\n')}
            onChange={(e) => setAbout({ paragraphs: e.target.value.split(/\n\s*\n/) })}
          />
        </Field>
        <Field label="Expertise" hint="Comma-separated.">
          <ListInput value={profile.about.expertise} onChange={(expertise) => setAbout({ expertise })} />
        </Field>
        <Field label="Call-to-action heading">
          <Input value={profile.about.ctaTitle} onChange={(e) => setAbout({ ctaTitle: e.target.value })} />
        </Field>
        <Field label="Call-to-action text">
          <Textarea value={profile.about.ctaText} onChange={(e) => setAbout({ ctaText: e.target.value })} />
        </Field>
      </section>
    </form>
  )
}
