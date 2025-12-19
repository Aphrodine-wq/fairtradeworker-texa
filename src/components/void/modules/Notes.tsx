/**
 * NOTES - Notes Module
 * Quick notes and reminders
 */

import { useState } from 'react'
import { Note, Plus, Trash, Pencil } from '@phosphor-icons/react'

interface NoteItem {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export function Notes() {
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  
  const createNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setIsEditing(true)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }
  
  const saveNote = () => {
    if (!selectedNote) return
    
    const updatedNote = {
      ...selectedNote,
      title: editTitle || 'Untitled',
      content: editContent,
      updatedAt: Date.now(),
    }
    
    setNotes(notes.map(note => note.id === selectedNote.id ? updatedNote : note))
    setSelectedNote(updatedNote)
    setIsEditing(false)
  }
  
  const selectNote = (note: NoteItem) => {
    setSelectedNote(note)
    setIsEditing(false)
    setEditTitle(note.title)
    setEditContent(note.content)
  }
  
  return (
    <div className="void-module void-module-notes">
      <div className="void-module-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="void-module-title">NOTES</h2>
            <p className="void-module-description">Quick notes and reminders</p>
          </div>
          <button 
            onClick={createNote}
            className="void-module-action-button"
          >
            <Plus size={20} weight="bold" />
          </button>
        </div>
      </div>
      <div className="void-module-content">
        <div className="flex h-full gap-4">
          {/* Notes List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 pr-4">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Note size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm">Click + to create one</p>
                </div>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`
                      p-3 rounded cursor-pointer border transition-all
                      ${selectedNote?.id === note.id 
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{note.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                          {note.content || 'Empty note'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }}
                        className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Note Editor */}
          <div className="flex-1">
            {selectedNote ? (
              isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Note title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 resize-none"
                    placeholder="Write your note here..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveNote}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditTitle(selectedNote.title)
                        setEditContent(selectedNote.content)
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Pencil size={20} />
                    </button>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedNote.content || 'Empty note'}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Note size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Select a note to view or edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
