import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { uploadFile } from '@/lib/api'
import { withToast } from '@/lib/notify'
import { contentTypes, type ContentBlock } from '@shared/schemas'

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Comma-separated list input that keeps the raw text while typing (so spaces aren't eaten). */
export function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [raw, setRaw] = useState(value.join(', '))
  useEffect(() => {
    const parsed = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (parsed.join('\u0000') !== value.join('\u0000')) setRaw(value.join(', '))
    // Only resync when the value changes from outside (e.g. a different record is opened).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <Input
      value={raw}
      placeholder={placeholder}
      onChange={(e) => {
        setRaw(e.target.value)
        onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
      }}
    />
  )
}

/** One item per line, for longer entries such as paragraphs. */
export function LinesInput({ value, onChange, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return <Textarea rows={rows} value={value.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />
}

export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      {label}
    </label>
  )
}

/** A URL field with an upload button; uploads go to the API and fill in the URL. */
export function UrlOrUpload({
  value,
  onChange,
  accept = 'image/*',
  preview = true,
  placeholder = 'https://… or upload a file',
}: {
  value: string
  onChange: (v: string) => void
  accept?: string
  preview?: boolean
  placeholder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const handleFile = async (file?: File) => {
    if (!file) return
    setUploading(true)
    const url = await withToast(() => uploadFile(file), 'File uploaded')
    if (url) onChange(url)
    setUploading(false)
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        <Button type="button" variant="outline" disabled={uploading} asChild>
          <label className="cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="sr-only">Upload</span>
            <input type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
        </Button>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange('')} aria-label="Clear">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {preview && value && accept.startsWith('image') && <img src={value} alt="" className="h-20 rounded border object-cover" />}
    </div>
  )
}

const acceptFor: Partial<Record<ContentBlock['type'], string>> = {
  image: 'image/*',
  gif: 'image/gif',
  html: '.html,.htm',
  notebook: '.ipynb,.html,.pdf',
}

export function ContentBlocksEditor({
  blocks,
  onChange,
  showCategory = false,
}: {
  blocks: ContentBlock[]
  onChange: (b: ContentBlock[]) => void
  showCategory?: boolean
}) {
  const update = (i: number, patch: Partial<ContentBlock>) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="border rounded-md p-3 space-y-2 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={block.type} onValueChange={(v) => update(i, { type: v as ContentBlock['type'] })}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {block.type === 'code' && (
              <Input className="w-36 bg-white" placeholder="Language" value={block.language || ''} onChange={(e) => update(i, { language: e.target.value })} />
            )}
            {showCategory && block.type === 'html' && (
              <CheckboxField label="Show “open in new page”" checked={!!block.category} onChange={(v) => update(i, { category: v })} />
            )}
            <div className="ml-auto flex gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange(blocks.filter((_, j) => j !== i))} aria-label="Remove block">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {block.type === 'text' || block.type === 'code' ? (
            <Textarea
              rows={block.type === 'code' ? 10 : 5}
              className={`bg-white ${block.type === 'code' ? 'font-mono text-sm' : ''}`}
              placeholder={block.type === 'text' ? 'Markdown supported' : 'Paste code here'}
              value={block.content}
              onChange={(e) => update(i, { content: e.target.value })}
            />
          ) : block.type === 'html' ? (
            <>
              <UrlOrUpload value={block.content.startsWith('<') ? '' : block.content} accept={acceptFor.html} onChange={(v) => update(i, { content: v })} preview={false} />
              <Textarea
                rows={4}
                className="bg-white font-mono text-xs"
                placeholder="…or paste inline HTML (runs in a sandbox)"
                value={block.content.startsWith('<') ? block.content : ''}
                onChange={(e) => update(i, { content: e.target.value })}
              />
            </>
          ) : (
            <UrlOrUpload value={block.content} accept={acceptFor[block.type]} onChange={(v) => update(i, { content: v })} />
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...blocks, { type: 'text', content: '' }])}>
        <Plus className="h-4 w-4 mr-1" /> Add content block
      </Button>
    </div>
  )
}
