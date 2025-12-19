import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useVoidGrid } from '@/hooks/useVoidGrid'
import { useVoidStore } from '@/lib/void/store'
import { getIconForMenu } from '@/lib/void/iconMap'
import { GRID_CONFIG } from '@/lib/void/config'
import type { VoidIcon as VoidIconType } from '@/lib/void/types'
import { cn } from '@/lib/utils'

interface VoidIconProps {
  icon: VoidIconType
  onDoubleClick?: (menuId?: string) => void
  onRightClick?: (event: React.MouseEvent, icon: VoidIconType) => void
}

export function VoidIcon({ icon, onDoubleClick, onRightClick }: VoidIconProps) {
  const { getPixelPosition } = useVoidGrid()
  const { openWindow } = useVoidStore()
  const [isHovered, setIsHovered] = useState(false)

  const IconComponent = icon.type === 'menu' && icon.menuId
    ? getIconForMenu(icon.menuId)
    : icon.icon

  const pixelPos = getPixelPosition(icon.id)
  const iconSize = GRID_CONFIG.unitToPixel(icon.size.width)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: icon.id,
    data: {
      type: 'icon',
      icon,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${pixelPos.x}px`,
    top: `${pixelPos.y}px`,
    width: `${iconSize}px`,
    height: `${iconSize}px`,
  }

  const handleClick = () => {
    if (icon.menuId) {
      openWindow(icon.menuId)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDoubleClick && icon.menuId) {
      onDoubleClick(icon.menuId)
    }
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRightClick) {
      onRightClick(e, icon)
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      data-icon-id={icon.id}
      {...attributes}
      {...listeners}
      className={cn(
        'absolute cursor-move select-none',
        isDragging && 'z-50 opacity-80'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-1 p-2 rounded-lg',
          'bg-[var(--void-surface)]/50 backdrop-blur-sm',
          'border border-[var(--void-border)]',
          'hover:bg-[var(--void-surface-hover)]',
          'hover:border-[var(--void-border-hover)]',
          'transition-all duration-200',
          isHovered && 'shadow-[var(--void-glow)]'
        )}
        style={{ width: '100%', height: '100%' }}
      >
        <IconComponent
          className="text-[var(--void-accent)]"
          style={{ fontSize: `${iconSize * 0.4}px` }}
        />
        <span
          className="text-xs text-[var(--void-text)] text-center leading-tight"
          style={{
            fontFamily: 'var(--void-font-body)',
            fontSize: `${iconSize * 0.12}px`,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {icon.label}
        </span>
      </div>
    </motion.div>
  )
}
