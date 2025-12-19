/**
 * VOID OS Clipboard Manager
 * History and pinned items interface
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Pin, PinOff, Trash2, Copy, X } from 'lucide-react'
import { useClipboard } from '@/hooks/useClipboard'
import '@/styles/void-clipboard.css'

interface VoidClipboardManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function VoidClipboardManager({ isOpen, onClose }: VoidClipboardManagerProps) {
  const {
    items,
    pinnedItems,
    searchQuery,
    isLoading,
    togglePin,
    deleteItem,
    clear,
    copy,
    search,
  } = useClipboard()

  if (!isOpen) {
    return null
  }

  const displayItems = searchQuery.trim().length > 0 ? items : items

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="void-clipboard-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="void-clipboard-manager"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="void-clipboard-header">
              <h2 className="void-clipboard-title">Clipboard History</h2>
              <button
                className="void-clipboard-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="void-clipboard-close-icon" />
              </button>
            </div>

            {/* Search */}
            <div className="void-clipboard-search">
              <Search className="void-clipboard-search-icon" />
              <input
                type="text"
                className="void-clipboard-search-input"
                placeholder="Search clipboard..."
                value={searchQuery}
                onChange={(e) => search(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="void-clipboard-content">
              {/* Pinned Items */}
              {pinnedItems.length > 0 && (
                <div className="void-clipboard-section">
                  <div className="void-clipboard-section-title">PINNED</div>
                  {pinnedItems.map((item) => (
                    <ClipboardItem
                      key={item.id}
                      item={item}
                      onPin={() => togglePin(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onCopy={() => copy(item.content)}
                    />
                  ))}
                </div>
              )}

              {/* Recent Items */}
              <div className="void-clipboard-section">
                <div className="void-clipboard-section-title">RECENT</div>
                {isLoading ? (
                  <div className="void-clipboard-loading">Loading...</div>
                ) : displayItems.length > 0 ? (
                  displayItems
                    .filter(item => !item.pinned)
                    .map((item) => (
                      <ClipboardItem
                        key={item.id}
                        item={item}
                        onPin={() => togglePin(item.id)}
                        onDelete={() => deleteItem(item.id)}
                        onCopy={() => copy(item.content)}
                      />
                    ))
                ) : (
                  <div className="void-clipboard-empty">No clipboard items</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="void-clipboard-footer">
              <button
                className="void-clipboard-clear"
                onClick={clear}
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ClipboardItem({
  item,
  onPin,
  onDelete,
  onCopy,
}: {
  item: { id: string; type: string; content: string; preview?: string; pinned: boolean; timestamp: number }
  onPin: () => void
  onDelete: () => void
  onCopy: () => void
}) {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <motion.div
      className="void-clipboard-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onCopy()}
    >
      {item.type === 'image' ? (
        <img
          src={item.content}
          alt="Clipboard image"
          className="void-clipboard-item-image"
        />
      ) : (
        <div className="void-clipboard-item-text">
          {item.preview || item.content.slice(0, 200)}
        </div>
      )}
      <div className="void-clipboard-item-actions">
        <button
          className="void-clipboard-item-action"
          onClick={(e) => {
            e.stopPropagation()
            onPin()
          }}
          title={item.pinned ? 'Unpin' : 'Pin'}
        >
          {item.pinned ? (
            <Pin className="void-clipboard-item-action-icon" />
          ) : (
            <PinOff className="void-clipboard-item-action-icon" />
          )}
        </button>
        <button
          className="void-clipboard-item-action"
          onClick={(e) => {
            e.stopPropagation()
            onCopy()
          }}
          title="Copy"
        >
          <Copy className="void-clipboard-item-action-icon" />
        </button>
        <button
          className="void-clipboard-item-action"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete"
        >
          <Trash2 className="void-clipboard-item-action-icon" />
        </button>
      </div>
      <div className="void-clipboard-item-time">{formatTime(item.timestamp)}</div>
    </motion.div>
  )
}
