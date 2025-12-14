/**
 * Job Bookmark Folders
 * Free Feature - Organize saved jobs ("High Priority")
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Folder,
  Plus,
  Trash,
  Bookmark
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface BookmarkFolder {
  id: string
  name: string
  jobIds: string[]
  createdAt: string
}

interface JobBookmarkFoldersProps {
  user: User
  jobs: Job[]
}

export function JobBookmarkFolders({ user, jobs }: JobBookmarkFoldersProps) {
  const [folders, setFolders] = useLocalKV<BookmarkFolder[]>(`bookmark-folders-${user.id}`, [])
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const createFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Enter a folder name")
      return
    }

    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      jobIds: [],
      createdAt: new Date().toISOString()
    }

    setFolders([...folders, newFolder])
    setNewFolderName("")
    toast.success(`Folder "${newFolderName}" created!`)
  }

  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId))
    toast.success("Folder deleted")
  }

  const addJobToFolder = (folderId: string, jobId: string) => {
    setFolders(folders.map(f =>
      f.id === folderId && !f.jobIds.includes(jobId)
        ? { ...f, jobIds: [...f.jobIds, jobId] }
        : f
    ))
    toast.success("Job added to folder")
  }

  const removeJobFromFolder = (folderId: string, jobId: string) => {
    setFolders(folders.map(f =>
      f.id === folderId
        ? { ...f, jobIds: f.jobIds.filter(id => id !== jobId) }
        : f
    ))
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder weight="duotone" size={24} />
            Bookmark Folders
          </CardTitle>
          <CardDescription>
            Organize your saved jobs into folders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name (e.g., High Priority)"
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <Button onClick={createFolder}>
              <Plus size={16} className="mr-2" />
              Create
            </Button>
          </div>

          {folders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-4 border-2 cursor-pointer transition-all ${
                    selectedFolder === folder.id
                      ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                      : 'border-black dark:border-white'
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder size={20} weight="duotone" />
                      <h3 className="font-semibold text-black dark:text-white">{folder.name}</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFolder(folder.id)
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                  <Badge variant="outline">{folder.jobIds.length} jobs</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentFolder && (
        <Card glass={false}>
          <CardHeader>
            <CardTitle>{currentFolder.name}</CardTitle>
            <CardDescription>
              {currentFolder.jobIds.length} saved jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentFolder.jobIds.length === 0 ? (
              <p className="text-center text-black dark:text-white py-8">
                No jobs in this folder yet. Select jobs from your saved list to add them.
              </p>
            ) : (
              currentFolder.jobIds.map((jobId) => {
                const job = jobs.find(j => j.id === jobId)
                if (!job) return null

                return (
                  <div key={jobId} className="p-4 border-2 border-black dark:border-white flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">{job.title}</h3>
                      <p className="text-sm text-black dark:text-white mt-1">{job.address}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeJobFromFolder(currentFolder.id, jobId)}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
