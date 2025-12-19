import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'
import type { IconData } from '@/lib/void/types'
import { sanitizeString } from '@/lib/void/validation'
import { dragSystem } from '@/lib/void/dragSystem'

interface VoidIconProps {
  icon: IconData
  style: React.CSSProperties
  isDragging: boolean
  onContextMenu: (e: React.MouseEvent) => void
}

export function VoidIcon({ icon, style, isDragging, onContextMenu }: VoidIconProps) {
  const { openWindow, recordIconUsage, pinnedIcons } = useVoidStore()
  const IconComponent = icon.icon

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: icon.id,
    disabled: pinnedIcons.has(icon.id),
  })

  // Simple visual feedback (NO MOMENTUM PHYSICS)
  const dragState = isDragging ? dragSystem.getDragState(icon.id) : undefined
  const hasSnapZone = dragState?.snapZone && dragState.snapZone.strength > 0.5
  const hasCollision = !!dragState?.collision

  // Simple drag style - no momentum effects
  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1,
    scale: isDragging ? 1.2 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    filter: isDragging 
      ? `brightness(1.5) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5)) ${hasSnapZone ? 'hue-rotate(180deg)' : ''} ${hasCollision ? 'contrast(1.2)' : ''}`
      : 'none',
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: isDragging ? 'grabbing' : 'grab',
  } as React.CSSProperties

  const handleDoubleClick = () => {
    if (icon.menuId) {
      recordIconUsage(icon.id)
      openWindow(icon.menuId)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        'void-icon',
        pinnedIcons.has(icon.id) && 'pinned'
      )}
      data-id={icon.id}
      data-dragging={isDragging}
      {...attributes}
      {...(!pinnedIcons.has(icon.id) ? listeners : {})}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="void-icon-content">
        <IconComponent 
          className="w-16 h-16" 
          weight="bold"
          style={{ 
            color: 'var(--text-secondary, var(--void-text-secondary))',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7))',
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
