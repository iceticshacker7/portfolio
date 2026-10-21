import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, FolderPlus, FilePlus, File, Folder, ChevronDown, ChevronRight, Loader2, Star } from 'lucide-react';
import type { DirectoryItem } from '@shared/schemas';
import { api, useApi } from '@/lib/api';
import { buildDirectoryTree } from '@/lib/content';
import { withToast } from '@/lib/notify';
import { CheckboxField, ContentBlocksEditor, Field, ListInput } from './form';

type Draft = Omit<DirectoryItem, 'id' | 'children'> & { id?: string };

const toBody = ({ id: _id, ...rest }: Draft) => rest;

function draftFrom(item: DirectoryItem): Draft {
  const { children: _children, ...rest } = item;
  return {
    ...rest,
    learningItem: item.type === 'file' ? { title: '', keywords: [], content: [], ...item.learningItem } : undefined,
  };
}

// Defined at module level (not inside the page) so expanded/editing state isn't
// lost every time the page re-renders.
const TreeRow: React.FC<{
  item: DirectoryItem;
  depth: number;
  onRename: (item: DirectoryItem, name: string) => void;
  onDelete: (item: DirectoryItem) => void;
  onAdd: (parentId: string, type: 'folder' | 'file') => void;
  onEdit: (item: DirectoryItem) => void;
}> = ({ item, depth, ...actions }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(item.name);
  const childCount = item.children?.length || 0;

  return (
    <div style={{ marginLeft: depth ? 20 : 0 }}>
      <div className="flex flex-wrap items-center gap-1 py-1 border-b border-border">
        {item.type === 'folder' ? (
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Collapse' : 'Expand'}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="w-8" />
        )}
        {item.type === 'folder' ? <Folder className="h-4 w-4 text-blue-500 dark:text-blue-400" /> : <File className="h-4 w-4 text-muted-foreground" />}
        {renaming ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-48" autoFocus />
        ) : (
          <span className="text-sm font-medium px-1">
            {item.name}
            {item.type === 'folder' && <span className="text-xs text-muted-foreground ml-1">({childCount})</span>}
          </span>
        )}
        {item.featured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" aria-label="Featured" />}
        <div className="ml-auto flex">
          <Button
            variant="ghost"
            size="sm"
            title={renaming ? 'Save name' : 'Rename'}
            onClick={() => {
              if (renaming && name.trim() && name !== item.name) actions.onRename(item, name.trim());
              setRenaming(!renaming);
            }}
          >
            {renaming ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
          {item.type === 'folder' ? (
            <>
              <Button variant="ghost" size="sm" title="Add sub-folder" onClick={() => actions.onAdd(item.id, 'folder')}>
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Add learning page" onClick={() => actions.onAdd(item.id, 'file')}>
                <FilePlus className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => actions.onEdit(item)}>
              Edit content
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Delete" onClick={() => actions.onDelete(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isOpen &&
        item.children?.map((child) => <TreeRow key={child.id} item={child} depth={depth + 1} {...actions} />)}
    </div>
  );
};

export default function DirectoryManagementPage() {
  const { data, loading, reload } = useApi<DirectoryItem[]>('/directories', []);
  const tree = buildDirectoryTree(data);
  const [current, setCurrent] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = (parentId: string | null, type: 'folder' | 'file') =>
    setCurrent({
      name: '',
      type,
      parentId,
      featured: false,
      order: 0,
      learningItem: type === 'file' ? { title: '', keywords: [], content: [] } : undefined,
    });

  const save = async (draft: Draft, message: string) => {
    const saved = await withToast(
      () => (draft.id ? api.put(`/directories/${draft.id}`, toBody(draft)) : api.post('/directories', toBody(draft))),
      message,
    );
    if (saved) reload();
    return saved;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setSaving(true);
    if (await save(current, current.id ? 'Saved' : 'Created')) setCurrent(null);
    setSaving(false);
  };

  const handleDelete = async (item: DirectoryItem) => {
    const extra = item.type === 'folder' ? ' and everything inside it' : '';
    if (!window.confirm(`Delete "${item.name}"${extra}?`)) return;
    if (await withToast(() => api.del(`/directories/${item.id}`), 'Deleted')) reload();
  };

  const learning = current?.learningItem;
  const setLearning = (patch: Partial<NonNullable<Draft['learningItem']>>) =>
    setCurrent((prev) => (prev && prev.learningItem ? { ...prev, learningItem: { ...prev.learningItem, ...patch } } : prev));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">Learnings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openAdd(null, 'file')}>
            <FilePlus className="mr-2 h-4 w-4" />
            Root page
          </Button>
          <Button onClick={() => openAdd(null, 'folder')}>
            <Plus className="mr-2 h-4 w-4" />
            Root folder
          </Button>
        </div>
      </div>
      <Dialog open={current !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {current?.id ? 'Edit' : 'Add'} {current?.type === 'folder' ? 'folder' : 'learning page'}
            </DialogTitle>
          </DialogHeader>
          {current && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name (shown in the topic tree)">
                <Input value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} required />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Sort order">
                  <Input type="number" value={current.order} onChange={(e) => setCurrent({ ...current, order: Number(e.target.value) || 0 })} />
                </Field>
                {current.type === 'file' && (
                  <div className="flex items-end pb-2">
                    <CheckboxField label="Feature on the home page" checked={current.featured} onChange={(v) => setCurrent({ ...current, featured: v })} />
                  </div>
                )}
              </div>
              {learning && (
                <>
                  <Field label="Title">
                    <Input value={learning.title} onChange={(e) => setLearning({ title: e.target.value })} />
                  </Field>
                  <Field label="Keywords" hint="Comma-separated.">
                    <ListInput value={learning.keywords} onChange={(keywords) => setLearning({ keywords })} />
                  </Field>
                  <Field label="Content">
                    <ContentBlocksEditor blocks={learning.content} onChange={(content) => setLearning({ content })} showCategory />
                  </Field>
                </>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <div className="w-full rounded-md border p-4">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : tree.length === 0 ? (
          <p className="text-muted-foreground">Nothing here yet. Add a root folder to start.</p>
        ) : (
          tree.map((item) => (
            <TreeRow
              key={item.id}
              item={item}
              depth={0}
              onRename={(it, name) => save({ ...draftFrom(it), name }, 'Renamed')}
              onDelete={handleDelete}
              onAdd={openAdd}
              onEdit={(it) => setCurrent(draftFrom(it))}
            />
          ))
        )}
      </div>
    </div>
  );
}
