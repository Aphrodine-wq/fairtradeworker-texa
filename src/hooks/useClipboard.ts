/**
 * Hook for VOID OS Clipboard Manager
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getClipboardHistory,
  addToClipboard,
  togglePin,
  deleteClipboardItem,
  clearClipboard,
  copyToClipboard,
  searchClipboard,
  type ClipboardItem,
} from '@/lib/void/clipboard'

export function useClipboard() {
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [pinnedItems, setPinnedItems] = useState<ClipboardItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load clipboard history
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const history = await getClipboardHistory()
      setItems(history)
      setPinnedItems(history.filter(item => item.pinned))
    } catch (error) {
      console.error('[Clipboard] Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Monitor clipboard changes
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData
      if (!clipboardData) return

      // Check for text
      if (clipboardData.types.includes('text/plain')) {
        const text = clipboardData.getData('text/plain')
        if (text) {
          await addToClipboard(text, 'text')
          loadHistory()
        }
      }

      // Check for image
      if (clipboardData.types.includes('image/png') || clipboardData.types.includes('image/jpeg')) {
        const file = clipboardData.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = async (event) => {
            const dataUrl = event.target?.result as string
            await addToClipboard(dataUrl, 'image')
            loadHistory()
          }
          reader.readAsDataURL(file)
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [loadHistory])

  const handleTogglePin = useCallback(async (id: string) => {
    await togglePin(id)
    loadHistory()
  }, [loadHistory])

  const handleDelete = useCallback(async (id: string) => {
    await deleteClipboardItem(id)
    loadHistory()
  }, [loadHistory])

  const handleClear = useCallback(async () => {
    await clearClipboard()
    loadHistory()
  }, [loadHistory])

  const handleCopy = useCallback(async (text: string) => {
    await copyToClipboard(text)
    loadHistory()
  }, [loadHistory])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length === 0) {
      loadHistory()
      return
    }

    setIsLoading(true)
    try {
      const results = await searchClipboard(query)
      setItems(results)
    } catch (error) {
      console.error('[Clipboard] Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadHistory])

  return {
    items,
    pinnedItems,
    searchQuery,
    isLoading,
    loadHistory,
    togglePin: handleTogglePin,
    deleteItem: handleDelete,
    clear: handleClear,
    copy: handleCopy,
    search: handleSearch,
  }
}
