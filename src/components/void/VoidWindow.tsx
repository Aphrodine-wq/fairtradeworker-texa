/**
 * VOID Window - Floating window component with drag, resize, minimize, maximize
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Minus, Square, SquareSplitHorizontal } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VoidWindow as VoidWindowType } from '@/lib/void/types'

interface VoidWindowProps {
  window: VoidWindowType
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onResize: (size: { width: number; height: number }) => void
  onDragEnd: (position: { x: number; y: number }) => void
  onFocus: () => void
  isMobile?: boolean
}

export function VoidWindow({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onResize,
  onDragEnd,
  onFocus,
  isMobile = false,
}: VoidWindowProps) {
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    if (!window.isMaximized) {
      const newX = window.position.x + info.offset.x
      const newY = window.position.y + info.offset.y
      onDragEnd({ x: newX, y: newY })
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: window.size.width,
      startHeight: window.size.height,
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const deltaX = e.clientX - resizeRef.current.startX
      const deltaY = e.clientY - resizeRef.current.startY
      onResize({
        width: Math.max(400, resizeRef.current.startWidth + deltaX),
        height: Math.max(300, resizeRef.current.startHeight + deltaY),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (window.isMinimized) {
    return null // Minimized windows are handled by taskbar
  }

  // On mobile, always fullscreen
  const isFullscreen = isMobile || window.isMaximized

  return (
    <motion.div
      className="absolute"
      style={{
        left: isFullscreen ? 0 : window.position.x,
        top: isFullscreen ? 0 : window.position.y,
        width: isFullscreen ? '100%' : window.size.width,
        height: isFullscreen ? '100%' : window.size.height,
        zIndex: window.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={onFocus}
      onMouseDown={onFocus}
    >
      {/* Window Container */}
      <motion.div
        className={cn(
          "h-full flex flex-col",
          "bg-black/90 backdrop-blur-xl rounded-xl",
          "border border-[#00f0ff]/30",
          "shadow-2xl",
          "overflow-hidden"
        )}
        drag={!isFullscreen}
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        dragConstraints={isFullscreen ? false : {
          left: 0,
          top: 0,
          right: typeof window !== 'undefined' ? window.innerWidth - window.size.width : 0,
          bottom: typeof window !== 'undefined' ? window.innerHeight - window.size.height : 0,
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-4 py-2 bg-[#00f0ff]/10 border-b border-[#00f0ff]/20 cursor-move"
          onMouseDown={(e) => {
            if (e.detail === 2) {
              onMaximize()
            }
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{window.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-[#00f0ff]/20"
                  onClick={onMinimize}
                >
                  <Minus size={14} weight="bold" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-[#00f0ff]/20"
                  onClick={onMaximize}
                >
                  {window.isMaximized ? (
                    <SquareSplitHorizontal size={14} weight="bold" />
                  ) : (
                    <Square size={14} weight="bold" />
                  )}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-red-500/20"
              onClick={onClose}
            >
              <X size={14} weight="bold" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-auto">
          {window.content}
        </div>
      </motion.div>

      {/* Resize Handle */}
      {!isFullscreen && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, transparent 40%, rgba(0, 240, 255, 0.3) 40%, rgba(0, 240, 255, 0.3) 100%)',
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </motion.div>
  )
}
