import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, Loader2, Star } from 'lucide-react';
import type { Project } from '@shared/schemas';
import { api, useApi } from '@/lib/api';
import { withToast } from '@/lib/notify';
import { CheckboxField, ContentBlocksEditor, Field, ListInput, UrlOrUpload } from './form';

type ProjectDraft = Omit<Project, 'id'> & { id?: string };

const emptyProject = (): ProjectDraft => ({
  title: '',
  slug: '',
  description: '',
  tags: [],
  subtags: [],
  keyPoints: [],
  image: '',
  youtube: '',
  notebookUrl: '',
  githubUrl: '',
  liveUrl: '',
  blogUrl: '',
  featured: false,
  order: 0,
  sections: [],
});

export default function ProjectManagement() {
  const { data: projects, loading, reload } = useApi<Project[]>('/projects', []);
  const [current, setCurrent] = useState<ProjectDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setCurrent((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setSection = (index: number, patch: Partial<ProjectDraft['sections'][number]>) =>
    setCurrent((prev) =>
      prev ? { ...prev, sections: prev.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)) } : prev,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setSaving(true);
    const { id, ...body } = current;
    const saved = await withToast(
      () => (id ? api.put(`/projects/${id}`, body) : api.post('/projects', body)),
      id ? 'Project updated' : 'Project created',
    );
    setSaving(false);
    if (saved) {
      setCurrent(null);
      reload();
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    if (await withToast(() => api.del(`/projects/${project.id}`), 'Project deleted')) reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setCurrent(emptyProject())}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      </div>

      <Dialog open={current !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{current?.id ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          {current && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title">
                <Input value={current.title} onChange={(e) => set('title', e.target.value)} required />
              </Field>
              <Field label="URL slug" hint="Leave empty to generate it from the title, e.g. /projects/driver-drowsiness-detection.">
                <Input value={current.slug} placeholder="auto" onChange={(e) => set('slug', e.target.value)} />
              </Field>
              <Field label="Description">
                <Textarea rows={4} value={current.description} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tags" hint="Comma-separated. These become the filter buttons on /projects.">
                  <ListInput value={current.tags} onChange={(v) => set('tags', v)} />
                </Field>
                <Field label="Subtags" hint="Comma-separated, e.g. libraries used.">
                  <ListInput value={current.subtags} onChange={(v) => set('subtags', v)} />
                </Field>
              </div>
              <Field label="Key points" hint="Comma-separated, shown on the home page card.">
                <ListInput value={current.keyPoints} onChange={(v) => set('keyPoints', v)} />
              </Field>
              <Field label="Banner image">
                <UrlOrUpload value={current.image} onChange={(v) => set('image', v)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="YouTube video" hint="Full URL or video id.">
                  <Input value={current.youtube} onChange={(e) => set('youtube', e.target.value)} />
                </Field>
                <Field label="Notebook URL">
                  <UrlOrUpload value={current.notebookUrl} onChange={(v) => set('notebookUrl', v)} accept=".ipynb,.html,.pdf" preview={false} />
                </Field>
                <Field label="GitHub URL">
                  <Input value={current.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} />
                </Field>
                <Field label="Live URL">
                  <Input value={current.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} />
                </Field>
                <Field label="Blog URL">
                  <Input value={current.blogUrl} onChange={(e) => set('blogUrl', e.target.value)} />
                </Field>
                <Field label="Sort order" hint="Lower numbers come first.">
                  <Input type="number" value={current.order} onChange={(e) => set('order', Number(e.target.value) || 0)} />
                </Field>
              </div>
              <CheckboxField label="Feature on the home page" checked={current.featured} onChange={(v) => set('featured', v)} />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sections</h3>
                {current.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border p-4 rounded-md space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Section Title"
                        value={section.title}
                        onChange={(e) => setSection(sectionIndex, { title: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Remove section"
                        onClick={() => set('sections', current.sections.filter((_, i) => i !== sectionIndex))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ContentBlocksEditor blocks={section.content} onChange={(content) => setSection(sectionIndex, { content })} />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => set('sections', [...current.sections, { title: '', content: [] }])}>
                  Add Section
                </Button>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Project
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-md flex flex-col sm:flex-row gap-4">
              {project.image && <img src={project.image} alt="" className="w-full sm:w-32 h-20 object-cover rounded" />}
              <div className="flex-grow min-w-0">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {project.title}
                  {project.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-label="Featured" />}
                </h2>
                <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {project.subtags.map((tag) => (
                    <span key={tag} className="bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setCurrent({ ...emptyProject(), ...project })}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(project)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
