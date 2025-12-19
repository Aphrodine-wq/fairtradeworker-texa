/**
 * VOID OS Clipboard Manager
 * Manages clipboard history and pinned items
 */

export interface ClipboardItem {
  id: string
  type: 'text' | 'image' | 'file'
  content: string // Text content or data URL for images/files
  timestamp: number
  pinned: boolean
  preview?: string // Preview text for images/files
}

const MAX_CLIPBOARD_ITEMS = 50
const CLIPBOARD_DB_NAME = 'void-clipboard'
const CLIPBOARD_STORE_NAME = 'items'

/**
 * Initialize IndexedDB for clipboard
 */
async function initClipboardDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CLIPBOARD_DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(CLIPBOARD_STORE_NAME)) {
        const store = db.createObjectStore(CLIPBOARD_STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('pinned', 'pinned', { unique: false })
      }
    }
  })
}

/**
 * Add item to clipboard history
 */
export async function addToClipboard(
  content: string,
  type: ClipboardItem['type'] = 'text'
): Promise<ClipboardItem> {
  const item: ClipboardItem = {
    id: `clipboard-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    content,
    timestamp: Date.now(),
    pinned: false,
    preview: type === 'text' ? content.slice(0, 100) : type === 'image' ? '[Image]' : '[File]',
  }

  try {
    const db = await initClipboardDB()
    const transaction = db.transaction([CLIPBOARD_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(CLIPBOARD_STORE_NAME)

    // Add new item
    await new Promise<void>((resolve, reject) => {
      const addRequest = store.add(item)
      addRequest.onsuccess = () => resolve()
      addRequest.onerror = () => reject(addRequest.error)
    })

    // Get all items and keep only last MAX_CLIPBOARD_ITEMS (excluding pinned)
    const getAllRequest = store.index('pinned').getAll()
    getAllRequest.onsuccess = async () => {
      const allItems = getAllRequest.result as ClipboardItem[]
      const unpinned = allItems.filter(i => !i.pinned).sort((a, b) => b.timestamp - a.timestamp)
      
      // Remove excess unpinned items
      if (unpinned.length > MAX_CLIPBOARD_ITEMS) {
        const toRemove = unpinned.slice(MAX_CLIPBOARD_ITEMS)
        for (const itemToRemove of toRemove) {
          store.delete(itemToRemove.id)
        }
      }
    }

    return item
  } catch (error) {
    console.error('[Clipboard] Failed to add item:', error)
    throw error
  }
}

/**
 * Get clipboard history
 */
export async function getClipboardHistory(limit = 50): Promise<ClipboardItem[]> {
  try {
    const db = await initClipboardDB()
    const transaction = db.transaction([CLIPBOARD_STORE_NAME], 'readonly')
    const store = transaction.objectStore(CLIPBOARD_STORE_NAME)

    return new Promise((resolve, reject) => {
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result as ClipboardItem[]
        // Sort: pinned first, then by timestamp
        const sorted = items.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return b.timestamp - a.timestamp
        })
        resolve(sorted.slice(0, limit))
      }
      getAllRequest.onerror = () => reject(getAllRequest.error)
    })
  } catch (error) {
    console.error('[Clipboard] Failed to get history:', error)
    return []
  }
}

/**
 * Toggle pin status
 */
export async function togglePin(id: string): Promise<void> {
  try {
    const db = await initClipboardDB()
    const transaction = db.transaction([CLIPBOARD_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(CLIPBOARD_STORE_NAME)

    const getRequest = store.get(id)
    getRequest.onsuccess = () => {
      const item = getRequest.result as ClipboardItem
      if (item) {
        item.pinned = !item.pinned
        store.put(item)
      }
    }
  } catch (error) {
    console.error('[Clipboard] Failed to toggle pin:', error)
  }
}

/**
 * Delete clipboard item
 */
export async function deleteClipboardItem(id: string): Promise<void> {
  try {
    const db = await initClipboardDB()
    const transaction = db.transaction([CLIPBOARD_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(CLIPBOARD_STORE_NAME)
    store.delete(id)
  } catch (error) {
    console.error('[Clipboard] Failed to delete item:', error)
  }
}

/**
 * Clear all clipboard items
 */
export async function clearClipboard(): Promise<void> {
  try {
    const db = await initClipboardDB()
    const transaction = db.transaction([CLIPBOARD_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(CLIPBOARD_STORE_NAME)
    store.clear()
  } catch (error) {
    console.error('[Clipboard] Failed to clear:', error)
  }
}

/**
 * Copy text to clipboard and add to history
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Use Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      await addToClipboard(text, 'text')
      return true
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    await addToClipboard(text, 'text')
    return true
  } catch (error) {
    console.error('[Clipboard] Failed to copy:', error)
    return false
  }
}

/**
 * Search clipboard history
 */
export async function searchClipboard(query: string): Promise<ClipboardItem[]> {
  const history = await getClipboardHistory()
  const queryLower = query.toLowerCase()
  
  return history.filter(item => {
    if (item.type === 'text') {
      return item.content.toLowerCase().includes(queryLower) ||
             item.preview?.toLowerCase().includes(queryLower)
    }
    return item.preview?.toLowerCase().includes(queryLower)
  })
}
