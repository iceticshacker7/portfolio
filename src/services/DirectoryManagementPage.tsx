import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';  // Adjust Firebase import path
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, FolderPlus, FilePlus, File, ChevronDown, ChevronRight, X, Link, Upload } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const storage = getStorage();

interface LearningItem {
  id: string;
  title: string;
  keywords: string[];
  content: {
    type: 'text' | 'image' | 'gif' | 'notebook' | 'code' | 'html';
    category: boolean;
    content: string;
    language?: string;
    fileType?: 'link' | 'upload';
  }[];
}

interface DirectoryItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  children?: DirectoryItem[];
  learningItem?: LearningItem;
}

export default function DirectoryManagementPage() {
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<DirectoryItem> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    const querySnapshot = await getDocs(collection(db, 'directories'));
    const fetchedDirectories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem));
    const structuredDirectories = buildDirectoryTree(fetchedDirectories);
    setDirectories(structuredDirectories);
  };

  const buildDirectoryTree = (items: DirectoryItem[]): DirectoryItem[] => {
    const itemMap = new Map<string, DirectoryItem>();
    items.forEach(item => itemMap.set(item.id, { ...item, children: [] }));
    
    const rootItems: DirectoryItem[] = [];
    itemMap.forEach(item => {
      if (item.parentId === null) {
        rootItems.push(item);
      } else {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        }
      }
    });
    
    return rootItems;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        learningItem: {
          ...prev.learningItem,
          [name]: name === 'keywords' ? value.split(',').map(k => k.trim()) : value
        } as LearningItem
      };
    });
  };

  const handleContentChange = (index: number, field: keyof LearningItem['content'][0], value: any) => {
    setCurrentItem(prev => {
      if (!prev || !prev.learningItem) return prev;
      return {
        ...prev,
        learningItem: {
          ...prev.learningItem,
          content: prev.learningItem.content?.map((c, i) =>
            i === index ? { ...c, [field]: value } : c
          ) || []
        }
      };
    });
  };

  const handleAddContent = () => {
    setCurrentItem(prev => {
      if (!prev || !prev.learningItem) return prev;
      return {
        ...prev,
        learningItem: {
          ...prev.learningItem,
          content: [
            ...(prev.learningItem.content || []),
            { type: 'text', category: false, content: '', fileType: 'link' }
          ]
        }
      };
    });
  };

  const handleDeleteContent = (index: number) => {
    setCurrentItem(prev => {
      if (!prev || !prev.learningItem) return prev;
      return {
        ...prev,
        learningItem: {
          ...prev.learningItem,
          content: prev.learningItem.content?.filter((_, i) => i !== index) || []
        }
      };
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      handleContentChange(index, 'content', downloadURL);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
  
    try {
      const itemData: Partial<DirectoryItem> = {
        name: currentItem.name!,
        type: currentItem.type!,
        parentId: currentItem.parentId || null,
      };

      if (currentItem.type === 'file' && currentItem.learningItem) {
        itemData.learningItem = {
          id: currentItem.learningItem.id || '',
          title: currentItem.learningItem.title || '',
          keywords: currentItem.learningItem.keywords || [],
          content: currentItem.learningItem.content || []
        };
      }
  
      if (isEditing && currentItem.id) {
        await updateDoc(doc(db, 'directories', currentItem.id), itemData);
      } else {
        await addDoc(collection(db, 'directories'), itemData);
      }
  
      fetchDirectories();
      setCurrentItem(null);
      setIsEditing(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'directories', id));
      // Delete all children
      const childrenSnapshot = await getDocs(query(collection(db, 'directories'), where('parentId', '==', id)));
      const deletePromises = childrenSnapshot.docs.map(childDoc => deleteDoc(childDoc.ref));
      await Promise.all(deletePromises);
      fetchDirectories();
    }
  };

  const openEditDialog = (item: DirectoryItem) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openAddDialog = (parentId: string | null, type: 'folder' | 'file') => {
    setCurrentItem({
      type,
      parentId,
      learningItem: type === 'file' ? { id: '', title: '', keywords: [], content: [] } : undefined
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const DirectoryItem: React.FC<{ item: DirectoryItem; depth: number }> = ({ item, depth }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
  
    const toggleOpen = () => setIsOpen(!isOpen);
  
    const handleEdit = async () => {
      if (isEditing) {
        await updateDoc(doc(db, 'directories', item.id), { name: editedName });
        fetchDirectories();
      }
      setIsEditing(!isEditing);
    };
  
    return (
      <div style={{ marginLeft: `${depth * 20}px` }}>
        {item.type === 'folder' ? (
          <div>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={toggleOpen}
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="inline-block w-40 ml-1"
              />
            ) : (
              <span className="ml-1 text-sm font-medium">{item.name}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openAddDialog(item.id, 'folder')}>
              <FolderPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openAddDialog(item.id, 'file')}>
              <FilePlus className="h-4 w-4" />
            </Button>
            {isOpen && item.children && (
              <div>
                {item.children.map((child, index) => (
                  <DirectoryItem key={index} item={child} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <File className="h-4 w-4 text-muted-foreground" />
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="inline-block w-40 ml-2"
              />
            ) : (
              <span className="ml-2 text-sm">{item.name}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
              <Edit className="h-4 w-4" /> Edit Content
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Directory Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={() => openAddDialog(null, 'folder')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Root Item
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Item Name"
              value={currentItem?.name || ''}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            {currentItem?.type === 'file' && (
              <>
                <Input
                  name="title"
                  placeholder="Learning Item Title"
                  value={currentItem?.learningItem?.title || ''}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="keywords"
                  placeholder="Keywords (comma-separated)"
                  value={currentItem?.learningItem?.keywords?.join(', ') || ''}
                  onChange={handleInputChange}
                />
                {currentItem?.learningItem?.content?.map((content, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteContent(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Select onValueChange={(value) => handleContentChange(index, 'type', value)} value={content.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Content Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                        <SelectItem value="notebook">Notebook</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={content.category}
                        onCheckedChange={(checked) => handleContentChange(index, 'category', checked)}
                      />
                      <label>Is Category</label>
                    </div>
                    {content.type === 'code' && (
                  <>
                    <Input
                      placeholder="Language"
                      value={content.language || ''}
                      onChange={(e) => handleContentChange(index, 'language', e.target.value)}
                      className="mb-2"
                    />
                    <Textarea
                      placeholder="Paste your code here"
                      value={content.content || ''}
                      onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                      className="font-mono"
                      rows={10}
                    />
                  </>
                )}
                    {['html', 'notebook', 'image', 'gif'].includes(content.type) && (
                      <div className="space-y-2">
                        <RadioGroup
                          value={content.fileType || 'link'}
                          onValueChange={(value) => handleContentChange(index, 'fileType', value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="link" id={`link-${index}`} />
                            <Label htmlFor={`link-${index}`}>Link</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upload" id={`upload-${index}`} />
                            <Label htmlFor={`upload-${index}`}>Upload</Label>
                          </div>
                        </RadioGroup>
                        {content.fileType === 'link' ? (
                          <div className="flex items-center space-x-2">
                            <Link className="h-4 w-4" />
                            <Input
                              placeholder="File URL"
                              value={content.content}
                              onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <Input
                              type="file"
                              accept={content.type === 'html' ? '.html' : content.type === 'notebook' ? '.ipynb' : 'image/*'}
                              onChange={(e) => e.target.files && handleFileUpload(index, e.target.files[0])}
                              disabled={isUploading}
                            />
                          </div>
                        )}
                        {isUploading && <p>Uploading...</p>}
                        {content.content && <p>Current file: {content.content}</p>}
                      </div>
                    )}
                    {['text'].includes(content.type) && (
                      <Textarea
                        placeholder="Content"
                        value={content.content}
                        onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <Button type="button" onClick={handleAddContent}>Add Content Section</Button>
              </>
            )}
            <Button type="submit" disabled={isUploading}>
              <Save className="mr-2 h-4 w-4" />
              Save Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        {directories.map((item, index) => (
          <DirectoryItem key={index} item={item} depth={0} />
        ))}
      </ScrollArea>
    </div>
  );
}