/**
 * VOID OS Virtual File System
 * File browser interface
 */

import { useState } from 'react'
import { Folder, File, ChevronRight, Search } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { VoidContextMenu } from './VoidContextMenu'
import { getFileContextMenu } from '@/lib/void/contextMenus'
import { getFilesByParent, type VoidFile } from '@/lib/void/fileSystem'
import '@/styles/void-filesystem.css'

export function VoidFileSystem() {
  const { fileSystem, currentPath, setCurrentPath, deleteFile } = useVoidStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const currentFiles = getFilesByParent(fileSystem, currentPath || null)
  const filteredFiles = searchQuery.trim()
    ? currentFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFiles

  const getFileIcon = (type: VoidFile['type']) => {
    switch (type) {
      case 'folder':
      case 'smartfolder':
        return Folder
      default:
        return File
    }
  }

  return (
    <div className="void-filesystem">
      <div className="void-filesystem-header">
        <div className="void-filesystem-search">
          <Search className="void-filesystem-search-icon" />
          <input
            type="text"
            className="void-filesystem-search-input"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="void-filesystem-content">
        {filteredFiles.length > 0 ? (
          <div className="void-filesystem-list">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type)
              
              // File context menu handlers
              const handleFileOpen = () => {
                if (file.type === 'folder' || file.type === 'smartfolder') {
                  setCurrentPath(file.id)
                } else {
                  console.log('Open file:', file)
                }
              }

              const handleFileRename = () => {
                setRenamingFileId(file.id)
                setRenameValue(file.name)
              }

              const handleFileDelete = () => {
                if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                  deleteFile(file.id)
                }
              }

              const handleFileCopy = () => {
                // Stub for now
                console.log('Copy file:', file)
              }

              const handleFileCut = () => {
                // Stub for now
                console.log('Cut file:', file)
              }

              const handleFileProperties = () => {
                // Stub for now
                console.log('File properties:', file)
              }

              const fileMenuItems = getFileContextMenu(
                handleFileOpen,
                handleFileRename,
                handleFileDelete,
                handleFileCopy,
                handleFileCut,
                handleFileProperties
              )

              return (
                <VoidContextMenu
                  key={file.id}
                  type="file"
                  items={fileMenuItems}
                >
                  <div
                    className="void-filesystem-item"
                    onClick={(e) => {
                      // Don't navigate if renaming
                      if (renamingFileId === file.id) return
                      e.stopPropagation()
                      if (file.type === 'folder' || file.type === 'smartfolder') {
                        setCurrentPath(file.id)
                      } else {
                        console.log('Open file:', file)
                      }
                    }}
                  >
                    <Icon className="void-filesystem-item-icon" />
                    {renamingFileId === file.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => {
                          if (renameValue.trim() && renameValue !== file.name) {
                            // Update file name - stub for now
                            console.log('Rename file:', file.id, 'to', renameValue)
                          }
                          setRenamingFileId(null)
                          setRenameValue('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          } else if (e.key === 'Escape') {
                            setRenamingFileId(null)
                            setRenameValue('')
                          }
                        }}
                        autoFocus
                        className="void-filesystem-item-rename-input"
                      />
                    ) : (
                      <span className="void-filesystem-item-name">{file.name}</span>
                    )}
                    {(file.type === 'folder' || file.type === 'smartfolder') && (
                      <ChevronRight className="void-filesystem-item-arrow" />
                    )}
                  </div>
                </VoidContextMenu>
              )
            })}
          </div>
        ) : (
          <div className="void-filesystem-empty">
            {searchQuery ? 'No files found' : 'Empty folder'}
          </div>
        )}
      </div>
    </div>
  )
}
