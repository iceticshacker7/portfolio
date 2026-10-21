import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, X, Loader2, Star } from 'lucide-react'
import type { Certificate } from '@shared/schemas'
import { api, useApi } from '@/lib/api'
import { withToast } from '@/lib/notify'
import { CheckboxField, Field, ListInput, UrlOrUpload } from './form'

type CertificateDraft = Omit<Certificate, 'id'> & { id?: string }

const emptyCertificate = (): CertificateDraft => ({
  title: '',
  description: '',
  tags: [],
  image: '',
  credentialUrl: '',
  date: '',
  instituteName: '',
  location: '',
  featured: false,
  order: 0,
})

export default function CertificateManagementPage() {
  const { data: certificates, loading, reload } = useApi<Certificate[]>('/certificates', [])
  const [current, setCurrent] = useState<CertificateDraft | null>(null)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof CertificateDraft>(key: K, value: CertificateDraft[K]) =>
    setCurrent((prev) => (prev ? { ...prev, [key]: value } : prev))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current) return
    setSaving(true)
    const { id, ...body } = current
    const saved = await withToast(
      () => (id ? api.put(`/certificates/${id}`, body) : api.post('/certificates', body)),
      id ? 'Certificate updated' : 'Certificate created',
    )
    setSaving(false)
    if (saved) {
      setCurrent(null)
      reload()
    }
  }

  const handleDelete = async (certificate: Certificate) => {
    if (!window.confirm(`Delete "${certificate.title}"?`)) return
    if (await withToast(() => api.del(`/certificates/${certificate.id}`), 'Certificate deleted')) reload()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <Button onClick={() => setCurrent(emptyCertificate())}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Certificate
        </Button>
      </div>
      <Dialog open={current !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{current?.id ? 'Edit Certificate' : 'Add New Certificate'}</DialogTitle>
          </DialogHeader>
          {current && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title">
                <Input value={current.title} onChange={(e) => set('title', e.target.value)} required />
              </Field>
              <Field label="Description">
                <Textarea value={current.description} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <Field label="Tags" hint="Comma-separated. These become the filter buttons on /certificates.">
                <ListInput value={current.tags} onChange={(v) => set('tags', v)} />
              </Field>
              <Field label="Certificate image">
                <UrlOrUpload value={current.image} onChange={(v) => set('image', v)} />
              </Field>
              <Field label="Credential URL">
                <Input value={current.credentialUrl} onChange={(e) => set('credentialUrl', e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Date">
                  <Input type="date" value={current.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
                <Field label="Sort order">
                  <Input type="number" value={current.order} onChange={(e) => set('order', Number(e.target.value) || 0)} />
                </Field>
                <Field label="Institute">
                  <Input value={current.instituteName} onChange={(e) => set('instituteName', e.target.value)} />
                </Field>
                <Field label="Location">
                  <Input value={current.location} onChange={(e) => set('location', e.target.value)} />
                </Field>
              </div>
              <CheckboxField label="Feature on the home page" checked={current.featured} onChange={(v) => set('featured', v)} />
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Certificate
                </Button>
                <Button type="button" variant="outline" onClick={() => setCurrent(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : certificates.length === 0 ? (
        <p className="text-muted-foreground">No certificates yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id}>
              {certificate.image && <img src={certificate.image} alt="" className="w-full h-32 object-cover rounded-t-lg" />}
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {certificate.title}
                  {certificate.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="Featured" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{certificate.description}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrent({ ...emptyCertificate(), ...certificate })}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(certificate)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
