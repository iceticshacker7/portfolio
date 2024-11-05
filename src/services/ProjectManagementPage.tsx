import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db,auth } from '../firebase';  // Adjust this import based on your Firebase setup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom';


const storage = getStorage();

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  subtags: string[];
  image: string;
  youtube: string;
  notebookUrl: string;
  githubUrl: string;
  liveUrl: string;
  sections: {
    title: string;
    content: {
      type: 'text' | 'image' | 'gif' | 'notebook' | 'code' | 'html';
      content: string;
      language?: string;
    }[];
  }[];
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login')
      return
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const fetchedProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    setProjects(fetchedProjects);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => {
      if (!prev) return null;
      if (name === 'tags' || name === 'subtags') {
        return { ...prev, [name]: value.split(',').map(item => item.trim()) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    setCurrentProject(prev => {
      if (!prev || !prev.sections) return prev;
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const handleContentChange = (sectionIndex: number, contentIndex: number, field: string, value: any) => {
    setCurrentProject(prev => {
      if (!prev || !prev.sections) return prev;
      const newSections = [...prev.sections];
      const newContent = [...newSections[sectionIndex].content];
      newContent[contentIndex] = { ...newContent[contentIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], content: newContent };
      return { ...prev, sections: newSections };
    });
  };

  const handleAddSection = () => {
    setCurrentProject(prev => {
      if (!prev) return prev;
      const newSections = [...(prev.sections || []), { title: '', content: [] }];
      return { ...prev, sections: newSections };
    });
  };

  const handleAddContent = (sectionIndex: number) => {
    setCurrentProject(prev => {
      if (!prev || !prev.sections) return prev;
      const newSections = [...prev.sections];
      newSections[sectionIndex].content.push({ type: 'text', content: '' });
      return { ...prev, sections: newSections };
    });
  };

  const handleDeleteSection = (index: number) => {
    setCurrentProject(prev => {
      if (!prev || !prev.sections) return prev;
      const newSections = prev.sections.filter((_, i) => i !== index);
      return { ...prev, sections: newSections };
    });
  };

  const handleDeleteContent = (sectionIndex: number, contentIndex: number) => {
    setCurrentProject(prev => {
      if (!prev || !prev.sections) return prev;
      const newSections = [...prev.sections];
      newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== contentIndex);
      return { ...prev, sections: newSections };
    });
  };

  const handleFileUpload = async (file: File, field: string) => {
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      if (field.startsWith('sections')) {
        const [, sectionIndex, , contentIndex] = field.split(/\[|\]/).filter(Boolean);
        handleContentChange(parseInt(sectionIndex), parseInt(contentIndex), 'content', downloadURL);
      } else {
        setCurrentProject(prev => prev ? { ...prev, [field]: downloadURL } : null);
      }
      
      toast({
        title: "File uploaded successfully",
        description: "The file has been uploaded and the URL has been saved.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      const projectData = {
        ...currentProject,
        sections: currentProject.sections?.map(section => ({
          ...section,
          content: section.content.map(content => ({
            ...content,
            content: content.content || ''
          }))
        }))
      };

      if (isEditing && currentProject.id) {
        await updateDoc(doc(db, 'projects', currentProject.id), projectData);
      } else {
        await addDoc(collection(db, 'projects'), projectData);
      }

      fetchProjects();
      setCurrentProject(null);
      setIsEditing(false);
      setIsDialogOpen(false);
      toast({
        title: isEditing ? "Project updated" : "Project created",
        description: `The project has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error saving project",
        description: "There was an error saving the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        fetchProjects();
        toast({
          title: "Project deleted",
          description: "The project has been deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error deleting project",
          description: "There was an error deleting the project. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setCurrentProject({
      title: '',
      description: '',
      tags: [],
      subtags: [],
      image: '',
      youtube: '',
      notebookUrl: '',
      githubUrl: '',
      liveUrl: '',
      sections: []
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              placeholder="Project Title"
              value={currentProject?.title || ''}
              onChange={handleInputChange}
              required
            />
            <Textarea
              name="description"
              placeholder="Project Description"
              value={currentProject?.description || ''}
              onChange={handleInputChange}
              required
            />
            <Input
              name="tags"
              placeholder="Tags (comma-separated)"
              value={currentProject?.tags?.join(', ') || ''}
              onChange={handleInputChange}
            />
            <Input
              name="subtags"
              placeholder="Subtags (comma-separated)"
              value={currentProject?.subtags?.join(', ') || ''}
              onChange={handleInputChange}
            />
            <div>
              <label className="block mb-2">Project Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'image')}
                disabled={isUploading}
              />
              {currentProject?.image && <p className="mt-2">Current image: {currentProject.image}</p>}
            </div>
            <Input
              name="youtube"
              placeholder="YouTube URL"
              value={currentProject?.youtube || ''}
              onChange={handleInputChange}
            />
            <Input
              name="notebookUrl"
              placeholder="Notebook URL"
              value={currentProject?.notebookUrl || ''}
              onChange={handleInputChange}
            />
            <Input
              name="githubUrl"
              placeholder="GitHub URL"
              value={currentProject?.githubUrl || ''}
              onChange={handleInputChange}
            />
            <Input
              name="liveUrl"
              placeholder="Live URL"
              value={currentProject?.liveUrl || ''}
              onChange={handleInputChange}
            />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sections</h3>
              {currentProject?.sections?.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border p-4 rounded-md relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteSection(sectionIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Section Title"
                    value={section.title}
                    onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                    className="mb-2"
                  />
                  {section.content.map((content, contentIndex) => (
                    <div key={contentIndex} className="mb-2 border p-2 rounded-md relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeleteContent(sectionIndex, contentIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Select
                        onValueChange={(value) => handleContentChange(sectionIndex, contentIndex, 'type', value)}
                        value={content.type}
                      >
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
                      {content.type === 'code' && (
                        <Input
                          placeholder="Language"
                          value={content.language || ''}
                          onChange={(e) => handleContentChange(sectionIndex, contentIndex, 'language', e.target.value)}
                          className="mt-2"
                        />
                      )}
                      {['image', 'gif'].includes(content.type) ? (
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept={content.type === 'gif' ? 'image/gif' : 'image/*'}
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], `sections[${sectionIndex}].content[${contentIndex}].content`)}
                            disabled={isUploading}
                          />
                          {content.content && <p className="mt-2">Current file: {content.content}</p>}
                        </div>
                      ) : (
                        <Textarea
                          placeholder="Content"
                          value={content.content}
                          onChange={(e) => handleContentChange(sectionIndex, contentIndex, 'content', e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  ))}
                  <Button type="button" onClick={() => handleAddContent(sectionIndex)} className="mt-2">
                    Add Content
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddSection}>Add Section</Button>
            </div>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Project
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        {projects.map((project) => (
          <div key={project.id} className="mb-4 p-4 border rounded-md">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="flex space-x-2 mb-2">
              {project.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-2 mb-2">
              {project.subtags.map((subtag, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {subtag}
                </span>
              ))}
            </div>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}