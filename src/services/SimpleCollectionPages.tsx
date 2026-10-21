import React, { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Edit, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { experienceSections, skillIcons } from '@shared/schemas'
import { api, useApi } from '@/lib/api'
import { withToast } from '@/lib/notify'
import { CheckboxField, Field, ListInput } from './form'

// Small collections share one config-driven editor instead of a page each.
type FieldDef =
  | { key: string; label: string; kind: 'text' | 'textarea' | 'list' | 'number' | 'checkbox'; hint?: string; required?: boolean }
  | { key: string; label: string; kind: 'select'; options: readonly string[]; hint?: string }

interface CollectionConfig {
  title: string
  singular: string
  fields: FieldDef[]
  summary: (item: Row) => string
  groupBy?: string
}

type Row = Record<string, unknown> & { id?: string }

const order: FieldDef = { key: 'order', label: 'Sort order', kind: 'number', hint: 'Lower numbers come first.' }

const configs: Record<string, CollectionConfig> = {
  skills: {
    title: 'Skills',
    singular: 'skill category',
    fields: [
      { key: 'name', label: 'Category name', kind: 'text', required: true },
      { key: 'icon', label: 'Icon', kind: 'select', options: skillIcons },
      { key: 'skills', label: 'Skills', kind: 'list', hint: 'Comma-separated.' },
      { key: 'featured', label: 'Show in “Top Skills” on the home page', kind: 'checkbox' },
      order,
    ],
    summary: (r) => (r.skills as string[]).join(', '),
  },
  experience: {
    title: 'Experience',
    singular: 'entry',
    groupBy: 'section',
    fields: [
      { key: 'section', label: 'Tab', kind: 'select', options: experienceSections },
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'description', label: 'Description', kind: 'text' },
      { key: 'institution', label: 'Institution / company', kind: 'text' },
      { key: 'dateRange', label: 'Date range', kind: 'text' },
      order,
    ],
    summary: (r) => [r.institution, r.dateRange].filter(Boolean).join(' · '),
  },
  achievements: {
    title: 'Achievements',
    singular: 'achievement',
    fields: [
      { key: 'text', label: 'Text', kind: 'text', required: true },
      { key: 'icon', label: 'Emoji', kind: 'text' },
      { key: 'link', label: 'Link', kind: 'text', hint: 'Optional. A /path on this site or an https:// URL.' },
      order,
    ],
    summary: (r) => String(r.link || ''),
  },
  contributions: {
    title: 'Contributions',
    singular: 'contribution',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'keyPoints', label: 'Key points', kind: 'list', hint: 'Comma-separated.' },
      { key: 'link', label: 'Link', kind: 'text' },
      order,
    ],
    summary: (r) => (r.keyPoints as string[]).join(', '),
  },
}

function emptyRow(config: CollectionConfig): Row {
  return Object.fromEntries(
    config.fields.map((f) => [
      f.key,
      f.kind === 'list' ? [] : f.kind === 'number' ? 0 : f.kind === 'checkbox' ? false : f.kind === 'select' ? f.options[0] : '',
    ]),
  )
}

export default function SimpleCollectionPages() {
  const { collection = '' } = useParams()
  const config = configs[collection]
  if (!config) return <Navigate to="/admin" replace />
  // Keyed so switching collections resets all state.
  return <CollectionEditor key={collection} collection={collection} config={config} />
}

function CollectionEditor({ collection, config }: { collection: string; config: CollectionConfig }) {
  const { data, loading, reload } = useApi<Row[]>(`/${collection}`, [])
  const [current, setCurrent] = useState<Row | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current) return
    setSaving(true)
    const { id, ...body } = current
    const saved = await withToast(
      () => (id ? api.put(`/${collection}/${id}`, body) : api.post(`/${collection}`, body)),
      id ? 'Saved' : 'Created',
    )
    setSaving(false)
    if (saved) {
      setCurrent(null)
      reload()
    }
  }

  const handleDelete = async (row: Row) => {
    if (!window.confirm('Delete this item?')) return
    if (await withToast(() => api.del(`/${collection}/${row.id}`), 'Deleted')) reload()
  }

  const titleKey = config.fields[0].kind === 'select' ? config.fields[1].key : config.fields[0].key
  const groups = config.groupBy
    ? [...new Set(data.map((r) => String(r[config.groupBy!])))].map((g) => ({ name: g, rows: data.filter((r) => r[config.groupBy!] === g) }))
    : [{ name: '', rows: data }]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <Button onClick={() => setCurrent(emptyRow(config))}>
          <Plus className="mr-2 h-4 w-4" />
          Add {config.singular}
        </Button>
      </div>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {current?.id ? 'Edit' : 'Add'} {config.singular}
            </DialogTitle>
          </DialogHeader>
          {current && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {config.fields.map((f) => {
                const value = current[f.key]
                const set = (v: unknown) => setCurrent({ ...current, [f.key]: v })
                if (f.kind === 'checkbox') return <CheckboxField key={f.key} label={f.label} checked={Boolean(value)} onChange={set} />
                return (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    {f.kind === 'select' ? (
                      <Select value={String(value)} onValueChange={set}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.kind === 'list' ? (
                      <ListInput value={(value as string[]) || []} onChange={set} />
                    ) : f.kind === 'textarea' ? (
                      <Textarea value={String(value ?? '')} onChange={(e) => set(e.target.value)} />
                    ) : f.kind === 'number' ? (
                      <Input type="number" value={Number(value) || 0} onChange={(e) => set(Number(e.target.value) || 0)} />
                    ) : (
                      <Input value={String(value ?? '')} required={f.required} onChange={(e) => set(e.target.value)} />
                    )}
                  </Field>
                )
              })}
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">Nothing here yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.name} className="mb-6">
            {group.name && <h2 className="font-semibold mb-2">{group.name}</h2>}
            <div className="space-y-2">
              {group.rows.map((row) => (
                <div key={row.id} className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">
                      {collection === 'achievements' ? `${row.icon} ` : ''}
                      {String(row[titleKey])}
                      {row.featured ? <span className="ml-2 text-xs text-yellow-600">★ featured</span> : null}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{config.summary(row)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">#{String(row.order)}</span>
                  <Button variant="ghost" size="sm" aria-label="Edit" onClick={() => setCurrent({ ...emptyRow(config), ...row })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Delete" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
