import { useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'
import type { IconData } from '@/lib/void/types'
import { sanitizeString } from '@/lib/void/validation'

interface VoidIconProps {
  icon: IconData
  style: React.CSSProperties
  isDragging: boolean
  onContextMenu: (e: React.MouseEvent) => void
  onDragStart?: (e: React.DragEvent) => void
}

export function VoidIcon({ icon, style, isDragging, onContextMenu, onDragStart }: VoidIconProps) {
  const { openWindow, recordIconUsage, pinnedIcons } = useVoidStore()
  const IconComponent = icon.icon
  const iconRef = useRef<HTMLDivElement>(null)

  // Native HTML5 drag handler
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Store the icon identifier in the drag event
    e.dataTransfer.setData('text/plain', icon.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Set drag image to the icon element itself
    if (iconRef.current) {
      const dragImage = iconRef.current.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.8'
      dragImage.style.transform = 'scale(1.2)'
      e.dataTransfer.setDragImage(dragImage, 0, 0)
    }
    
    // Call parent handler if provided
    onDragStart?.(e)
  }

  // Simple drag style - no momentum effects
  const dragStyle = {
    ...style,
    opacity: isDragging ? 0.9 : 1,
    scale: isDragging ? 1.2 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    filter: isDragging 
      ? `brightness(1.5) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5))`
      : 'none',
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: pinnedIcons.has(icon.id) ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  } as React.CSSProperties

  const handleDoubleClick = () => {
    if (icon.menuId) {
      recordIconUsage(icon.id)
      openWindow(icon.menuId)
    }
  }

  return (
    <div
      ref={iconRef}
      draggable={!pinnedIcons.has(icon.id)}
      style={dragStyle}
      className={cn(
        'void-icon',
        pinnedIcons.has(icon.id) && 'pinned',
        isDragging && 'dragging'
      )}
      data-id={icon.id}
      data-dragging={isDragging}
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="void-icon-content">
        <IconComponent 
          className="w-8 h-8" 
          weight="regular"
          style={{ 
            color: 'var(--text-secondary, var(--void-text-secondary))',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
          }}
        />
        <span 
          className="void-icon-label void-body-small"
          style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          title={sanitizeString(icon.label, 100)}
        >
          {sanitizeString(icon.label, 100)}
        </span>
      </div>
    </div>
  )
}
