import { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { WINDOW_CONFIG } from '@/lib/void/config'
import { X, Minus, Square } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { VoidWindow as VoidWindowType } from '@/lib/void/types'

interface VoidWindowProps {
  window: VoidWindowType
  isMobile?: boolean
}

export function VoidWindow({ window, isMobile = false }: VoidWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition } = useVoidStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null)

  const handleDragStart = () => {
    setIsDragging(true)
    focusWindow(window.id)
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    if (!window.maximized) {
      updateWindowPosition(window.id, {
        x: window.position.x + info.offset.x,
        y: window.position.y + info.offset.y,
      })
    }
  }

  if (window.minimized) return null

  const windowVariants = {
    hidden: { scale: 0.8, opacity: 0, filter: 'blur(10px)' },
    visible: {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } },
  }

  return (
    <motion.div
      variants={windowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'absolute bg-[var(--void-surface)]/90 backdrop-blur-xl',
        'border border-[var(--void-border)] rounded-2xl',
        'shadow-2xl overflow-hidden',
        'flex flex-col',
        isMobile && 'inset-4'
      )}
      style={{
        left: window.maximized ? 0 : `${window.position.x}px`,
        top: window.maximized ? 0 : `${window.position.y}px`,
        width: window.maximized ? '100%' : `${window.size.width}px`,
        height: window.maximized ? '100%' : `${window.size.height}px`,
        zIndex: window.zIndex,
      }}
      onClick={() => focusWindow(window.id)}
    >
      {/* Title Bar */}
      <motion.div
        drag={!isMobile && !window.maximized}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="h-12 px-4 bg-[var(--void-surface)]/50 border-b border-[var(--void-border)] flex items-center justify-between cursor-move"
      >
        <span className="font-semibold text-[var(--void-text)] text-sm" style={{ fontFamily: 'var(--void-font-body)' }}>
          {window.title}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(window.id)
            }}
            className="w-3 h-3 rounded-full bg-[var(--void-warning)] hover:opacity-80 transition-opacity"
            aria-label="Minimize"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              maximizeWindow(window.id)
            }}
            className="w-3 h-3 rounded-full bg-[var(--void-success)] hover:opacity-80 transition-opacity"
            aria-label="Maximize"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(window.id)
            }}
            className="w-3 h-3 rounded-full bg-[var(--void-error)] hover:opacity-80 transition-opacity"
            aria-label="Close"
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {window.content || (
          <div className="text-[var(--void-text-muted)] text-sm">
            Window content for {window.menuId}
          </div>
        )}
      </div>
    </motion.div>
  )
}
