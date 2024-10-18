import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, auth } from '../firebase' // Assuming you have this set up
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Certificates {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  credentialUrl: string;
  date: string;
  instituteName: string;
  location: string;
}

export default function CertificateManagementPage() {
  const [certificates, setCertificates] = useState<Certificates[]>([])
  const [currentCertificate, setCurrentCertificate] = useState<Partial<Certificates> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login')
      return
    }
    fetchCertificates()
  }, [navigate])

  const fetchCertificates = async () => {
    const querySnapshot = await getDocs(collection(db, 'certificates'))
    const fetchedCertificates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificates))
    setCertificates(fetchedCertificates)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentCertificate(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags') => {
    const values = e.target.value.split(',').map(item => item.trim())
    setCurrentCertificate(prev => ({ ...prev, [field]: values }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const storageRef = ref(storage, `certificates/${currentCertificate?.id || 'new'}/image/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setCurrentCertificate(prev => ({ ...prev, image: downloadURL }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCertificate) return

    try {
      const certificateData = {
        ...currentCertificate,
        image: currentCertificate.image || '',
      }

      if (isEditing && currentCertificate.id) {
        await updateDoc(doc(db, 'certificates', currentCertificate.id), certificateData)
      } else {
        await addDoc(collection(db, 'certificates'), {
          ...certificateData,
          author: {
            name: auth.currentUser?.displayName || '',
            avatar: auth.currentUser?.photoURL || '',
          },
        })
      }
      fetchCertificates()
      setCurrentCertificate(null)
      setIsEditing(false)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving certificate:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      await deleteDoc(doc(db, 'certificates', id))
      fetchCertificates()
    }
  }

  const openEditDialog = (certificate: Certificates) => {
    setCurrentCertificate(certificate)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Certificate Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={() => {
            setCurrentCertificate(null)
            setIsEditing(false)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Certificate
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Certificate' : 'Add New Certificate'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              placeholder="Certificate Title"
              value={currentCertificate?.title || ''}
              onChange={handleInputChange}
              required
            />
            <Textarea
              name="description"
              placeholder="Certificate Description"
              value={currentCertificate?.description || ''}
              onChange={handleInputChange}
              required
            />
            <Input
              name="tags"
              placeholder="Tags (comma-separated)"
              value={currentCertificate?.tags?.join(', ') || ''}
              onChange={(e) => handleArrayInputChange(e, 'tags')}
            />
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {currentCertificate?.image && (
                <img src={currentCertificate.image} alt="Certificate" className="mt-2 h-20 w-20 object-cover" />
              )}
            </div>
            <Input
              name="credentialUrl"
              placeholder="Credential URL"
              value={currentCertificate?.credentialUrl || ''}
              onChange={handleInputChange}
            />
            <Input
              name="date"
              placeholder="Date"
              type="date"
              value={currentCertificate?.date || ''}
              onChange={handleInputChange}
            />
            <Input
              name="instituteName"
              placeholder="Institute Name"
              value={currentCertificate?.instituteName || ''}
              onChange={handleInputChange}
            />
            <Input
              name="location"
              placeholder="Location"
              value={currentCertificate?.location || ''}
              onChange={handleInputChange}
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Certificate
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setCurrentCertificate(null)
                setIsEditing(false)
                setIsDialogOpen(false)
              }}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map(certificate => (
          <Card key={certificate.id}>
            <CardHeader>
              <CardTitle>{certificate.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{certificate.description}</p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => openEditDialog(certificate)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(certificate.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
