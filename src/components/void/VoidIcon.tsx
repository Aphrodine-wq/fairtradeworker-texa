/**
 * VOID Icon - Draggable desktop icon component
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DotsSixVertical } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { VoidIcon as VoidIconType } from '@/lib/void/types'

interface VoidIconProps {
  icon: VoidIconType
  onDoubleClick: () => void
  onClick?: () => void
  onRightClick: (event: React.MouseEvent) => void
  onDragEnd: (position: { x: number; y: number }) => void
  tooltip?: string
}

export function VoidIcon({ icon, onDoubleClick, onClick, onRightClick, onDragEnd, tooltip }: VoidIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    setIsDragging(false)
    const newX = icon.position.x + info.offset.x
    const newY = icon.position.y + info.offset.y
    onDragEnd({ x: newX, y: newY })
  }

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: icon.position.x,
        top: icon.position.y,
        zIndex: isDragging ? 50 : icon.isPinned ? 20 : 10,
      }}
      initial={false}
      animate={{
        x: 0,
        y: 0,
        scale: isHovered ? 1.1 : 1,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onRightClick}
    >
      <div className="flex flex-col items-center gap-2 group">
        {/* Icon Container */}
        <motion.div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center",
            "bg-black/50 backdrop-blur-md border border-[#00f0ff]/30",
            "shadow-lg",
            icon.isPinned && "ring-2 ring-[#00f0ff] ring-offset-2 ring-offset-[#0a0a0f]"
          )}
          animate={{
            boxShadow: isHovered 
              ? '0 0 20px rgba(0, 240, 255, 0.5)' 
              : icon.isPinned 
                ? '0 0 10px rgba(0, 240, 255, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-3xl">{icon.icon}</span>
        </motion.div>

        {/* Label */}
        <span className={cn(
          "text-xs font-medium text-white text-center",
          "drop-shadow-lg",
          isHovered && "text-[#00f0ff]"
        )}>
          {icon.label}
        </span>

        {/* Tooltip */}
        {tooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/90 backdrop-blur-md rounded-lg border border-[#00f0ff]/30 text-xs text-white whitespace-nowrap pointer-events-none z-50"
          >
            {tooltip}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#00f0ff]/30" />
          </motion.div>
        )}

        {/* Drag Handle (visible on hover) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <DotsSixVertical size={12} className="text-[#00f0ff]/50" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
