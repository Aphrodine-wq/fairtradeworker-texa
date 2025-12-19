import { useRef, useState, useCallback, useMemo, memo } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragMoveEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { useVoidStore } from '@/lib/void/store'
import { VoidIcon } from './VoidIcon'
import { VoidVoiceIcon } from './VoidVoiceIcon'
import { VoidContextMenu } from './VoidContextMenu'
import { getIconForId } from '@/lib/void/iconMap'
import { validateGridPosition } from '@/lib/void/validation'
import { getDesktopContextMenu, getIconContextMenu } from '@/lib/void/contextMenus'
import { dragSystem } from '@/lib/void/dragSystem'
import '@/styles/void-desktop.css'

// Memoized component to prevent unnecessary re-renders
export const VoidDesktop = memo(function VoidDesktop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { icons, iconPositions, pinnedIcons, sortIcons, updateIconPosition, openWindow, setDesktopBackground, createFile } = useVoidStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<ReturnType<typeof dragSystem.getDragState>>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Advanced sensor configuration with multiple activation strategies
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // 1px for maximum precision
        delay: 0,
        tolerance: 0,
      },
    })
  )

  // Memoize icons data for drag system
  const iconsData = useMemo(() => 
    icons.map(icon => ({ id: icon.id, position: icon.position })),
    [icons]
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    const iconId = event.active.id as string
    setDraggedId(iconId)
    
    // Initialize advanced drag system
    const state = dragSystem.handleDragStart(event)
    setDragState(state)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const gridSize = { width: rect.width, height: rect.height }
    
    // Update advanced drag system
    const state = dragSystem.handleDragMove(event, iconsData)
    if (state) {
      setDragState(state)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    const iconId = active.id as string
    
    if (!containerRef.current || pinnedIcons.has(iconId)) {
      setDraggedId(null)
      setDragState(undefined)
      dragSystem.clearDragState(iconId)
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const gridSize = { width: rect.width, height: rect.height }
    
    // Get advanced drag result with momentum and snap zones
    const dragResult = dragSystem.handleDragEnd(event, gridSize)
    
    if (!dragResult) {
      setDraggedId(null)
      setDragState(undefined)
      return
    }

    // Use advanced drag system's final position (includes momentum and snap)
    const { finalPosition } = dragResult

    // Enhanced collision detection with radius
    const cellSize = getCellSize()
    const hasCollision = icons.some(icon => {
      if (icon.id === iconId) return false
      const distance = Math.sqrt(
        Math.pow((icon.position.col - finalPosition.col) * cellSize.width, 2) +
        Math.pow((icon.position.row - finalPosition.row) * cellSize.height, 2)
      )
      return distance < cellSize.width * 0.8 // 80% of cell size collision radius
    })

    if (!hasCollision) {
      // Validate position before updating
      const validatedPos = validateGridPosition(finalPosition)
      if (validatedPos) {
        updateIconPosition(iconId, validatedPos)
      }
    }

    setDraggedId(null)
    setDragState(undefined)
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
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
                  />
                </div>
              </VoidContextMenu>
            )
          })}
        </div>
      </VoidContextMenu>
    </DndContext>
  )
})
