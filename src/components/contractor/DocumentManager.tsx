import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Folder, File, Upload, Share, Trash, Plus, MagnifyingGlass, Download, Eye } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  folderId: string
  sharedWith?: string[]
}

interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: string
}

export function DocumentManager({ user }: { user: User }) {
  const [documents, setDocuments] = useKV<Document[]>("documents", [])
  const [folders, setFolders] = useKV<Folder[]>("document-folders", [])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const isPro = user.isPro || false

  const currentFolder = useMemo(() => 
    folders.find(f => f.id === currentFolderId) || null,
    [folders, currentFolderId]
  )

  const folderPath = useMemo(() => {
    const path: Folder[] = []
    let current = currentFolder
    while (current) {
      path.unshift(current)
      current = folders.find(f => f.id === current?.parentId) || undefined
    }
    return path
  }, [folders, currentFolder])

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => doc.folderId === (currentFolderId || 'root'))
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [documents, currentFolderId, searchQuery])

  const subFolders = useMemo(() => 
    folders.filter(f => f.parentId === (currentFolderId || 'root')),
    [folders, currentFolderId]
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId: currentFolderId || 'root'
      }
      setDocuments([...documents, newDoc])
    })
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId || undefined,
      createdAt: new Date().toISOString()
    }
    setFolders([...folders, newFolder])
    setNewFolderName("")
    setShowNewFolderDialog(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <Folder weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Document Manager</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Organize, upload, and share your business documents. Supports PDF, images, and office files.
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus size={18} className="mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                  <div className="px-8 pt-6 pb-4 border-b-2 border-black dark:border-white flex-shrink-0">
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-2xl">Create Folder</DialogTitle>
                      <DialogDescription>Organize your documents</DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="flex-1 overflow-hidden p-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Folder Name</Label>
                        <Input
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="e.g., Contracts, Invoices, Receipts"
                          className="h-11"
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-4 border-t-2 border-black dark:border-white flex-shrink-0">
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => setShowNewFolderDialog(false)} className="h-11">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFolder} className="h-11">
                        Create Folder
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button asChild>
                  <span>
                    <Upload size={18} className="mr-2" />
                    Upload Files
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolderId(null)}
              className="h-8"
            >
              <Folder size={16} className="mr-1" />
              Root
            </Button>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <span>/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="h-8"
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} weight="duotone" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Folders and Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Folders */}
            {subFolders.map(folder => (
              <Card
                key={folder.id}
                className="hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all cursor-pointer bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="p-4 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white mb-3 shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <Folder size={32} weight="duotone" className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-black dark:text-white truncate w-full">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {documents.filter(d => d.folderId === folder.id).length} files
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Documents */}
            {filteredDocuments.map(doc => (
              <Card
                key={doc.id}
                className="hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white flex-shrink-0 shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                      <File size={24} weight="duotone" className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black dark:text-white truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Share size={14} className="mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-600 dark:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDocuments(documents.filter(d => d.id !== doc.id))
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {subFolders.length === 0 && filteredDocuments.length === 0 && (
              <Card className="col-span-full bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
                <CardContent className="p-12 text-center">
                  <Folder size={64} className="mx-auto mb-4 text-black dark:text-white" />
                  <p className="text-muted-foreground text-lg mb-2">No documents yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload files or create folders to get started
                  </p>
                  <div className="flex gap-3 justify-center">
                    <label>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button>
                        <Upload size={18} className="mr-2" />
                        Upload Files
                      </Button>
                    </label>
                    <Button variant="outline" onClick={() => setShowNewFolderDialog(true)}>
                      <Plus size={18} className="mr-2" />
                      Create Folder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}