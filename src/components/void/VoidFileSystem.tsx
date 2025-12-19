/**
 * VOID OS Virtual File System
 * File browser interface
 */

import { useState } from 'react'
import { Folder, File, ChevronRight, Search } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { getFilesByParent, type VoidFile } from '@/lib/void/fileSystem'
import '@/styles/void-filesystem.css'

export function VoidFileSystem() {
  const { fileSystem, currentPath } = useVoidStore()
  const [searchQuery, setSearchQuery] = useState('')

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
              return (
                <div
                  key={file.id}
                  className="void-filesystem-item"
                  onClick={() => {
                    if (file.type === 'folder' || file.type === 'smartfolder') {
                      // Navigate to folder
                      useVoidStore.getState().setCurrentPath(file.id)
                    } else {
                      // Open file
                      console.log('Open file:', file)
                    }
                  }}
                >
                  <Icon className="void-filesystem-item-icon" />
                  <span className="void-filesystem-item-name">{file.name}</span>
                  {(file.type === 'folder' || file.type === 'smartfolder') && (
                    <ChevronRight className="void-filesystem-item-arrow" />
                  )}
                </div>
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
