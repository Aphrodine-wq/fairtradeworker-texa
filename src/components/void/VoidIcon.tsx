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

  // Advanced visual feedback with physics-based effects
  const dragState = isDragging ? dragSystem.getDragState(icon.id) : undefined
  const momentum = dragState?.momentum
  const momentumMagnitude = momentum ? Math.sqrt(momentum.x ** 2 + momentum.y ** 2) : 0
  const hasSnapZone = dragState?.snapZone && dragState.snapZone.strength > 0.5
  const hasCollision = !!dragState?.collision

  // Enhanced drag style with physics-based visual feedback
  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.85 : 1,
    scale: isDragging ? (1.15 + momentumMagnitude * 0.001) : 1,
    zIndex: isDragging ? 1000 : 'auto',
    filter: isDragging 
      ? `brightness(${1.4 + momentumMagnitude * 0.0001}) drop-shadow(0 ${8 + momentumMagnitude * 0.01}px ${16 + momentumMagnitude * 0.01}px rgba(0, 0, 0, 0.4)) ${hasSnapZone ? 'hue-rotate(180deg)' : ''} ${hasCollision ? 'contrast(1.2)' : ''}`
      : 'none',
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: isDragging ? 'grabbing' : 'grab',
    rotate: isDragging && momentum ? `${Math.atan2(momentum.y, momentum.x) * (180 / Math.PI)}deg` : '0deg',
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
