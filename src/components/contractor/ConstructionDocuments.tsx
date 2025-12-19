import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileText, Blueprint, Receipt, Image, FilePdf,
  Upload, Download, Eye, Trash, Plus, Folder,
  MagnifyingGlass, Share, Calendar
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface ConstructionDocument {
  id: string
  name: string
  type: 'contract' | 'blueprint' | 'change_order' | 'invoice' | 'photo' | 'permit' | 'other'
  projectId?: string
  projectName?: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  tags: string[]
  sharedWith: string[]
  version?: number
  isLatest: boolean
}

interface ConstructionDocumentsProps {
  user: User
}

export function ConstructionDocuments({ user }: ConstructionDocumentsProps) {
  const [documents, setDocuments] = useKV<ConstructionDocument[]>("construction-documents", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as ConstructionDocument['type'],
    projectId: '',
    tags: [] as string[]
  })

  const myProjects = useMemo(() => {
    return jobs.filter(job => 
      job.status === 'in-progress' || job.status === 'completed' &&
      job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    )
  }, [jobs, user.id])

  const filteredDocuments = useMemo(() => {
    let filtered = documents

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter)
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(doc => doc.projectId === projectFilter)
    }

    return filtered
  }, [documents, searchQuery, typeFilter, projectFilter])

  const handleUpload = () => {
    if (!newDocument.name) {
      toast.error("Please enter a document name")
      return
    }

    const project = myProjects.find(p => p.id === newDocument.projectId)
    const newDoc: ConstructionDocument = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      type: newDocument.type,
      projectId: newDocument.projectId || undefined,
      projectName: project?.title,
      fileUrl: '', // In real app, this would be uploaded file URL
      fileSize: 0,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.id,
      tags: newDocument.tags,
      sharedWith: [],
      isLatest: true
    }

    setDocuments((current) => [...(current || []), newDoc])
    setShowUploadDialog(false)
    setNewDocument({ name: '', type: 'other', projectId: '', tags: [] })
    toast.success("Document added successfully")
  }

  const handleDelete = (docId: string) => {
    setDocuments((current) => (current || []).filter(d => d.id !== docId))
    toast.success("Document deleted")
  }

  const getTypeIcon = (type: ConstructionDocument['type']) => {
    switch (type) {
      case 'contract': return <FileText weight="duotone" size={20} className="text-black dark:text-white" />
      case 'blueprint': return <Blueprint weight="duotone" size={20} className="text-black dark:text-white" />
      case 'change_order': return <Receipt weight="duotone" size={20} className="text-black dark:text-white" />
      case 'invoice': return <FilePdf weight="duotone" size={20} className="text-black dark:text-white" />
      case 'photo': return <Image weight="duotone" size={20} className="text-black dark:text-white" />
      default: return <FileText weight="duotone" size={20} className="text-black dark:text-white" />
    }
  }

  const getTypeLabel = (type: ConstructionDocument['type']) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const documentStats = useMemo(() => {
    const stats = {
      total: documents.length,
      byType: {} as Record<ConstructionDocument['type'], number>,
      byProject: {} as Record<string, number>
    }

    documents.forEach(doc => {
      stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1
      if (doc.projectId) {
        stats.byProject[doc.projectId] = (stats.byProject[doc.projectId] || 0) + 1
      }
    })

    return stats
  }, [documents])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <FileText weight="duotone" size={28} className="text-black dark:text-white" />
            Construction Documents
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage contracts, blueprints, change orders, invoices, and project photos
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a new document to your construction project library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document Name</Label>
                <Input
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  placeholder="e.g., Main Contract, Site Blueprint"
                />
              </div>
              <div>
                <Label>Document Type</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(v: any) => setNewDocument({ ...newDocument, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="blueprint">Blueprint</SelectItem>
                    <SelectItem value="change_order">Change Order</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Project (Optional)</Label>
                <Select
                  value={newDocument.projectId}
                  onValueChange={(v) => setNewDocument({ ...newDocument, projectId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {myProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  <Upload size={16} className="mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Documents</span>
              <FileText weight="duotone" size={20} className="text-black dark:text-white" />
            </div>
            <div className="text-2xl font-bold text-black dark:text-white mt-2">
              {documentStats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contracts</span>
              <FileText weight="duotone" size={20} className="text-black dark:text-white" />
            </div>
            <div className="text-2xl font-bold text-black dark:text-white mt-2">
              {documentStats.byType.contract || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blueprints</span>
              <Blueprint weight="duotone" size={20} className="text-black dark:text-white" />
            </div>
            <div className="text-2xl font-bold text-black dark:text-white mt-2">
              {documentStats.byType.blueprint || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Change Orders</span>
              <Receipt weight="duotone" size={20} className="text-black dark:text-white" />
            </div>
            <div className="text-2xl font-bold text-black dark:text-white mt-2">
              {documentStats.byType.change_order || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="blueprint">Blueprints</SelectItem>
            <SelectItem value="change_order">Change Orders</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="photo">Photos</SelectItem>
            <SelectItem value="permit">Permits</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {myProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
          <p className="text-muted-foreground mb-4">No documents found</p>
          <Button onClick={() => setShowUploadDialog(true)}>Upload Your First Document</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getTypeIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">{doc.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {getTypeLabel(doc.type)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doc.projectName && (
                    <div>
                      <span className="text-xs text-muted-foreground">Project: </span>
                      <span className="text-xs font-medium text-black dark:text-white">
                        {doc.projectName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye size={14} className="mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download size={14} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
