import { useState, useRef, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'
import type { WindowData } from '@/lib/void/types'
import '@/styles/void-desktop.css'

interface VoidWindowProps {
  window: WindowData
}

const RESIZE_HANDLE_SIZE = 4
const MIN_WINDOW_WIDTH = 400
const MIN_WINDOW_HEIGHT = 300

export function VoidWindow({ window }: VoidWindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    focusWindow,
    activeWindowId,
  } = useVoidStore()

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  const isActive = activeWindowId === window.id

  useEffect(() => {
    if (isActive && windowRef.current) {
      windowRef.current.focus()
    }
  }, [isActive])

  const handleDragStart = () => {
    setIsDragging(true)
    focusWindow(window.id)
  }

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!window.maximized) {
      updateWindowPosition(window.id, {
        x: window.position.x + info.offset.x,
        y: window.position.y + info.offset.y,
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleResizeStart = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    })
    focusWindow(window.id)
  }

  useEffect(() => {
    if (!isResizing || !resizeStart) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = window.position.x
      let newY = window.position.y

      if (isResizing.includes('e')) {
        newWidth = Math.max(MIN_WINDOW_WIDTH, resizeStart.width + deltaX)
      }
      if (isResizing.includes('w')) {
        newWidth = Math.max(MIN_WINDOW_WIDTH, resizeStart.width - deltaX)
        newX = window.position.x + deltaX
      }
      if (isResizing.includes('s')) {
        newHeight = Math.max(MIN_WINDOW_HEIGHT, resizeStart.height + deltaY)
      }
      if (isResizing.includes('n')) {
        newHeight = Math.max(MIN_WINDOW_HEIGHT, resizeStart.height - deltaY)
        newY = window.position.y + deltaY
      }

      updateWindowSize(window.id, { width: newWidth, height: newHeight })
      if (newX !== window.position.x || newY !== window.position.y) {
        updateWindowPosition(window.id, { x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
      setResizeStart(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, window])

  if (window.minimized) return null

  return (
    <motion.div
      ref={windowRef}
      className={cn('void-window', isActive && 'active')}
      style={{
        left: window.maximized ? 24 : `${window.position.x}px`,
        top: window.maximized ? 24 : `${window.position.y}px`,
        width: window.maximized ? 'calc(100% - 48px)' : `${window.size.width}px`,
        height: window.maximized ? 'calc(100% - 96px)' : `${window.size.height}px`, // Account for toolbar (48px) + taskbar (48px)
        zIndex: window.zIndex,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => focusWindow(window.id)}
      drag={!window.maximized}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      {/* Title Bar */}
      <div className="void-window-titlebar">
        <span className="void-window-title">{window.title}</span>
        <div className="void-window-controls">
          <button
            className="void-window-button minimize"
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(window.id)
            }}
            aria-label="Minimize"
          />
          <button
            className="void-window-button maximize"
            onClick={(e) => {
              e.stopPropagation()
              maximizeWindow(window.id)
            }}
            aria-label="Maximize"
          />
          <button
            className="void-window-button close"
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(window.id)
            }}
            aria-label="Close"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4" style={{ height: 'calc(100% - 32px)' }}>
        {window.content || (
          <div className="text-[var(--void-text-muted)] text-sm">
            Window content for {window.menuId || window.title}
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {!window.maximized && (
        <>
          <div className="void-resize-handle n" onMouseDown={(e) => handleResizeStart('n', e)} />
          <div className="void-resize-handle s" onMouseDown={(e) => handleResizeStart('s', e)} />
          <div className="void-resize-handle e" onMouseDown={(e) => handleResizeStart('e', e)} />
          <div className="void-resize-handle w" onMouseDown={(e) => handleResizeStart('w', e)} />
          <div className="void-resize-handle nw" onMouseDown={(e) => handleResizeStart('nw', e)} />
          <div className="void-resize-handle ne" onMouseDown={(e) => handleResizeStart('ne', e)} />
          <div className="void-resize-handle sw" onMouseDown={(e) => handleResizeStart('sw', e)} />
          <div className="void-resize-handle se" onMouseDown={(e) => handleResizeStart('se', e)} />
        </>
      )}
    </motion.div>
  )
}
