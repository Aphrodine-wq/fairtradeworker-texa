import { useRef, useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { useVoidStore } from '@/lib/void/store'
import { VoidIcon } from './VoidIcon'
import { VoidVoiceIcon } from './VoidVoiceIcon'
import { getIconForId } from '@/lib/void/iconMap'
import { validateGridPosition } from '@/lib/void/validation'
import '@/styles/void-desktop.css'

export function VoidDesktop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { icons, iconPositions, pinnedIcons, sortIcons, updateIconPosition, openWindow } = useVoidStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px magnetic threshold for snap-to-grid
      },
    })
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
    setDraggedId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const iconId = active.id as string
    
    if (!containerRef.current || !delta || pinnedIcons.has(iconId)) {
      setDraggedId(null)
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const currentPos = iconPositions[iconId]
    if (!currentPos) {
      setDraggedId(null)
      return
    }

    const cellSize = getCellSize()
    const deltaCol = Math.round(delta.x / cellSize.width)
    const deltaRow = Math.round(delta.y / cellSize.height)

    const newCol = Math.max(1, Math.min(200, currentPos.col + deltaCol))
    const newRow = Math.max(1, Math.min(200, currentPos.row + deltaRow))

    // Check for collisions with other icons
    const hasCollision = icons.some(icon => {
      if (icon.id === iconId) return false
      return icon.position.row === newRow && icon.position.col === newCol
    })

    if (!hasCollision) {
      // Validate position before updating
      const validatedPos = validateGridPosition({ row: newRow, col: newCol })
      if (validatedPos) {
        updateIconPosition(iconId, validatedPos)
      }
    }

    setDraggedId(null)
  }

  const handleContextMenu = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, iconId })
  }

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY, iconId: '' })
    }
  }

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={containerRef}
        className="void-desktop-grid"
        onContextMenu={handleDesktopContextMenu}
      >
        {icons.map((icon) => {
          const IconComponent = getIconForId(icon.id)
          const cssPos = gridToCSS(icon.position.row, icon.position.col)
          
          // Special handling for voice icon (2×2 grid)
          if (icon.id === 'voice-capture') {
            const voiceCssPos = {
              ...cssPos,
              gridColumn: `${icon.position.col} / span 2`,
              gridRow: `${icon.position.row} / span 2`,
            }
            return (
              <VoidVoiceIcon
                key={icon.id}
                icon={icon}
                style={voiceCssPos}
                onContextMenu={(e) => handleContextMenu(e, icon.id)}
              />
            )
          }
          
          return (
            <VoidIcon
              key={icon.id}
              icon={{
                ...icon,
                icon: IconComponent,
              }}
              style={cssPos}
              isDragging={draggedId === icon.id}
              onContextMenu={(e) => handleContextMenu(e, icon.id)}
            />
          )
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.iconId ? (
            <>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)]"
                onClick={() => {
                  const isPinned = pinnedIcons.has(contextMenu.iconId)
                  if (isPinned) {
                    useVoidStore.getState().unpinIcon(contextMenu.iconId)
                  } else {
                    useVoidStore.getState().pinIcon(contextMenu.iconId)
                  }
                  setContextMenu(null)
                }}
              >
                {pinnedIcons.has(contextMenu.iconId) ? 'Unpin from Desktop' : 'Pin to Desktop'}
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)]"
                onClick={() => {
                  const icon = icons.find(i => i.id === contextMenu.iconId)
                  if (icon?.menuId) {
                    openWindow(icon.menuId)
                  }
                  setContextMenu(null)
                }}
              >
                Open
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)]"
                onClick={() => {
                  sortIcons('name')
                  setContextMenu(null)
                }}
              >
                Sort by Name
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)]"
                onClick={() => {
                  sortIcons('date')
                  setContextMenu(null)
                }}
              >
                Sort by Date
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--void-surface-hover)]"
                onClick={() => {
                  sortIcons('usage')
                  setContextMenu(null)
                }}
              >
                Sort by Usage
              </button>
            </>
          )}
        </div>
      )}
    </DndContext>
  )
}
