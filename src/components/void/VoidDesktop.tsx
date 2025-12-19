import { useRef, useState, useCallback, memo } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { VoidIcon } from './VoidIcon'
import { VoidVoiceIcon } from './VoidVoiceIcon'
import { VoidContextMenu } from './VoidContextMenu'
import { getIconForId } from '@/lib/void/iconMap'
import { validateGridPosition } from '@/lib/void/validation'
import { getDesktopContextMenu, getIconContextMenu } from '@/lib/void/contextMenus'
import '@/styles/void-desktop.css'

// Memoized component to prevent unnecessary re-renders
export const VoidDesktop = memo(function VoidDesktop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { icons, iconPositions, pinnedIcons, sortIcons, updateIconPosition, openWindow, setDesktopBackground, createFile } = useVoidStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [isDropping, setIsDropping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate grid cell size
  const getCellSize = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      width: rect.width / 200,
      height: rect.height / 200,
    }
  }, [])

  // Convert grid position to CSS grid coordinates
  const gridToCSS = useCallback((row: number, col: number) => {
    return {
      gridRow: row,
      gridColumn: col,
    }
  }, [])

  // Snap position to grid with 8px magnetic threshold
  const snapToGrid = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!containerRef.current) return null
    
    const rect = containerRef.current.getBoundingClientRect()
    const cellSize = getCellSize()
    
    const relativeX = clientX - rect.left
    const relativeY = clientY - rect.top
    
    const col = Math.round(relativeX / cellSize.width)
    const row = Math.round(relativeY / cellSize.height)
    
    // Clamp to grid bounds (1-200)
    return {
      row: Math.max(1, Math.min(200, row)),
      col: Math.max(1, Math.min(200, col)),
    }
  }, [getCellSize])

  // Native HTML5 Drag Start Handler
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const iconId = e.currentTarget.getAttribute('data-id') || e.dataTransfer.getData('text/plain')
    if (iconId) {
      setDraggedId(iconId)
    }
  }

  // Native HTML5 Drag Over Handler - allows drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // Required to allow drop
    e.dataTransfer.dropEffect = 'move'
  }

  // Native HTML5 Drop Handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const iconId = e.dataTransfer.getData('text/plain')
    if (!iconId || !containerRef.current || pinnedIcons.has(iconId)) {
      setDraggedId(null)
      setIsDropping(false)
      return
    }

    // Show "Dropping" state
    setIsDropping(true)

    // Get drop position
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = e.clientX
    const clientY = e.clientY

    // Snap to grid
    const gridPosition = snapToGrid(clientX, clientY)
    if (!gridPosition) {
      setDraggedId(null)
      setIsDropping(false)
      return
    }

    // Enhanced collision detection with radius
    const cellSize = getCellSize()
    const hasCollision = icons.some(icon => {
      if (icon.id === iconId) return false
      const distance = Math.sqrt(
        Math.pow((icon.position.col - gridPosition.col) * cellSize.width, 2) +
        Math.pow((icon.position.row - gridPosition.row) * cellSize.height, 2)
      )
      return distance < cellSize.width * 0.8 // 80% of cell size collision radius
    })

    if (!hasCollision) {
      // Validate position before updating
      const validatedPos = validateGridPosition(gridPosition)
      if (validatedPos) {
        updateIconPosition(iconId, validatedPos)
      }
    }

    // Clear states after a brief delay to show "Dropping" text
    setTimeout(() => {
      setDraggedId(null)
      setIsDropping(false)
    }, 200)
  }

  // Native HTML5 Drag End Handler (when drag is cancelled or ends)
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedId(null)
    setIsDropping(false)
  }

  // Desktop context menu handlers
  const handleNewFolder = () => {
    const currentPath = useVoidStore.getState().currentPath || 'root'
    createFile({
      name: 'New Folder',
      type: 'folder',
      path: `/VOID/New Folder`,
      parentId: currentPath,
      metadata: {},
    })
  }

  const handleNewDocument = () => {
    const currentPath = useVoidStore.getState().currentPath || 'root'
    createFile({
      name: 'New Document',
      type: 'template',
      path: `/VOID/New Document`,
      parentId: currentPath,
      metadata: {},
    })
  }

  const handleNewShortcut = () => {
    // Stub for now
    console.log('New Shortcut - not implemented yet')
  }

  const handleRefresh = () => {
    // Refresh desktop - reload icons or refresh state
    window.location.reload()
  }

  const handleArrangeByName = () => sortIcons('name')
  const handleArrangeByDate = () => sortIcons('date')
  const handleArrangeByType = () => sortIcons('usage')
  const handleAutoArrange = () => {
    // Auto-arrange icons in grid
    sortIcons('name')
  }

  const handleChangeBackground = () => {
    // Trigger file input for background upload
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          setDesktopBackground(dataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    e.target.value = ''
  }

  const handleDisplaySettings = () => {
    openWindow('settings')
  }

  const handlePaste = () => {
    // Open clipboard manager - this will be handled via keyboard shortcut or separate mechanism
    // For now, just log
    console.log('Paste - clipboard manager integration needed')
  }

  const handleOpenFileSystem = () => {
    openWindow('filesystem')
  }

  // Desktop context menu items
  const desktopMenuItems = getDesktopContextMenu(
    handleNewFolder, // New -> Folder (will be updated for submenu)
    handleRefresh,
    handleArrangeByName, // Arrange -> By Name (will be updated for submenu)
    handleChangeBackground,
    handleDisplaySettings,
    handlePaste,
    handleOpenFileSystem,
    handleDisplaySettings // Settings (same as Display Settings for now)
  )

  // Update "New" submenu with different handlers
  const newItem = desktopMenuItems.find(item => item.label === 'New')
  if (newItem && newItem.submenu) {
    newItem.submenu[0].action = handleNewFolder // Folder
    newItem.submenu[1].action = handleNewDocument // Document
    newItem.submenu[2].action = handleNewShortcut // Shortcut
  }

  // Update "Arrange Icons" submenu with different handlers
  const arrangeItem = desktopMenuItems.find(item => item.label === 'Arrange Icons')
  if (arrangeItem && arrangeItem.submenu) {
    arrangeItem.submenu[0].action = handleArrangeByName // By Name
    arrangeItem.submenu[1].action = handleArrangeByDate // By Date
    arrangeItem.submenu[2].action = handleArrangeByType // By Type
    arrangeItem.submenu[4].action = handleAutoArrange // Auto Arrange (index 4 after separator)
  }

  // Add "Open Module" submenu with all 10 modules
  const moduleModules = [
    { id: 'livewire', label: 'Livewire' },
    { id: 'facelink', label: 'Facelink' },
    { id: 'blueprint', label: 'Blueprint' },
    { id: 'scope', label: 'Scope' },
    { id: 'dispatch', label: 'Dispatch' },
    { id: 'reputation', label: 'Reputation' },
    { id: 'cashflow', label: 'Cashflow' },
    { id: 'vault', label: 'Vault' },
    { id: 'funnel', label: 'Funnel' },
    { id: 'milestones', label: 'Milestones' },
  ]

  desktopMenuItems.splice(desktopMenuItems.length - 2, 0, {
    label: 'Open Module',
    icon: '📦',
    submenu: moduleModules.map(module => ({
      label: module.label,
      action: () => openWindow(module.id),
    })),
  })

  return (
    <>
      {/* Drag/Drop Status Indicator */}
      {(draggedId || isDropping) && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
          style={{
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="text-6xl font-bold text-white"
            style={{
              animation: isDropping ? 'pulse 0.3s ease-in-out' : 'none',
            }}
          >
            {isDropping ? 'DROPPING' : 'DRAGGING'}
          </div>
        </div>
      )}

      {/* Hidden file input for background upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Desktop with context menu */}
      <VoidContextMenu
        type="desktop"
        items={desktopMenuItems}
      >
        <div
          ref={containerRef}
          className="void-desktop-grid"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {icons.map((icon) => {
            const IconComponent = getIconForId(icon.id)
            const cssPos = gridToCSS(icon.position.row, icon.position.col)
            
            // Icon context menu handlers
            const handleIconOpen = () => {
              if (icon.menuId) {
                openWindow(icon.menuId)
              }
            }

            const handleIconOpenNewWindow = () => {
              // Duplicate window - open same menuId again
              if (icon.menuId) {
                openWindow(icon.menuId)
              }
            }

            const handleIconPin = () => {
              if (pinnedIcons.has(icon.id)) {
                useVoidStore.getState().unpinIcon(icon.id)
              } else {
                useVoidStore.getState().pinIcon(icon.id)
              }
            }

            const handleIconAddToFavorites = () => {
              // Stub for now
              console.log('Add to Favorites - not implemented yet')
            }

            const handleIconCut = () => {
              // Stub for now
              console.log('Cut icon - not implemented yet')
            }

            const handleIconCopy = () => {
              // Stub for now
              console.log('Copy icon - not implemented yet')
            }

            const handleIconDelete = () => {
              // Stub for now
              console.log('Delete icon - not implemented yet')
            }

            const iconMenuItems = getIconContextMenu(
              handleIconOpen,
              handleIconOpenNewWindow,
              handleIconPin,
              handleIconAddToFavorites,
              handleIconCut,
              handleIconCopy,
              handleIconDelete
            )

            // Update "Pin to Desktop" label based on current state
            const pinItem = iconMenuItems.find(item => item.label === 'Pin to Desktop')
            if (pinItem) {
              pinItem.label = pinnedIcons.has(icon.id) ? 'Unpin from Desktop' : 'Pin to Desktop'
            }
            
            // Special handling for voice icon (2×2 grid)
            if (icon.id === 'voice-capture') {
              const voiceCssPos = {
                ...cssPos,
                gridColumn: `${icon.position.col} / span 2`,
                gridRow: `${icon.position.row} / span 2`,
              }
              return (
                <VoidContextMenu
                  key={icon.id}
                  type="icon"
                  items={iconMenuItems}
                >
                  <div style={voiceCssPos}>
                    <VoidVoiceIcon
                      icon={icon}
                      style={voiceCssPos}
                      onContextMenu={() => {}} // Handled by VoidContextMenu
                    />
                  </div>
                </VoidContextMenu>
              )
            }
            
            return (
              <VoidContextMenu
                key={icon.id}
                type="icon"
                items={iconMenuItems}
              >
                <div style={cssPos}>
                  <VoidIcon
                    icon={{
                      ...icon,
                      icon: IconComponent,
                    }}
                    style={cssPos}
                    isDragging={draggedId === icon.id}
                    onContextMenu={() => {}} // Handled by VoidContextMenu
                    onDragStart={handleDragStart}
                  />
                </div>
              </VoidContextMenu>
            )
          })}
        </div>
      </VoidContextMenu>
    </>
  )
})
