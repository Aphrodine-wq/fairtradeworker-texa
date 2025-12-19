import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'
import type { IconData } from '@/lib/void/types'
import { sanitizeString } from '@/lib/void/validation'

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

  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1,
    scale: isDragging ? 1.1 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    filter: isDragging ? 'brightness(1.3) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))' : 'none',
    transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
          className="w-12 h-12" 
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
