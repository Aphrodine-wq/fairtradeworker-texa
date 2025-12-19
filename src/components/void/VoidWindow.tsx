import { useState, useRef, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { VoidContextMenu } from './VoidContextMenu'
import { getWindowContextMenu } from '@/lib/void/contextMenus'
import { cn } from '@/lib/utils'
import type { WindowData } from '@/lib/void/types'
import { validateWindowSize, validateGridPosition, sanitizeString } from '@/lib/void/validation'
import { isNearEdge, getSnapPosition, type SnapZone } from '@/lib/void/windowSnap'
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
    togglePip,
    updateWindowPosition,
    updateWindowSize,
    focusWindow,
    activeWindowId,
    virtualDesktops,
    moveWindowToDesktop,
  } = useVoidStore()

  // Get window dimensions for snap calculations
  const getWindowDimensions = () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [snapZone, setSnapZone] = useState<SnapZone | null>(null)
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
    if (!window.maximized && !window.pip) {
      const newX = window.position.x + info.offset.x
      const newY = window.position.y + info.offset.y
      
      // Check for snap zones (only for non-PiP windows)
      if (!window.pip) {
        const edgeCheck = isNearEdge(newX, newY, typeof window !== 'undefined' ? window.innerWidth : 1920, typeof window !== 'undefined' ? window.innerHeight : 1080)
        if (edgeCheck.zone) {
          setSnapZone(edgeCheck.zone)
        } else {
          setSnapZone(null)
        }
      }
      
      updateWindowPosition(window.id, {
        x: newX,
        y: newY,
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    
    // Apply snap if zone detected
    if (snapZone && !window.maximized) {
      const { width, height } = getWindowDimensions()
      const snapPos = getSnapPosition(
        snapZone,
        width,
        height
      )
      updateWindowPosition(window.id, { x: snapPos.x, y: snapPos.y })
      updateWindowSize(window.id, { width: snapPos.width, height: snapPos.height })
      
      // If maximizing, set maximized state
      if (snapZone === 'maximize') {
        maximizeWindow(window.id)
      }
    }
    
    setSnapZone(null)
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

      // Validate window size before updating
      const validatedSize = validateWindowSize({ width: newWidth, height: newHeight })
      if (validatedSize) {
        updateWindowSize(window.id, validatedSize)
      }
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

  // Window context menu handlers
  const handleMinimize = () => {
    minimizeWindow(window.id)
  }

  const handleMaximize = () => {
    maximizeWindow(window.id)
  }

  const handleClose = () => {
    closeWindow(window.id)
  }

  const handleMoveToDesktop1 = () => {
    const desktop1 = virtualDesktops[0]
    if (desktop1) {
      moveWindowToDesktop(window.id, desktop1.id)
    }
  }

  const handleMoveToDesktop2 = () => {
    const desktop2 = virtualDesktops[1]
    if (desktop2) {
      moveWindowToDesktop(window.id, desktop2.id)
    }
  }

  const handleMoveToDesktop3 = () => {
    const desktop3 = virtualDesktops[2]
    if (desktop3) {
      moveWindowToDesktop(window.id, desktop3.id)
    }
  }

  const handleNewDesktop = () => {
    // Create new desktop and move window - stub for now
    console.log('New Desktop - not fully implemented yet')
  }

  // Window context menu items
  const windowMenuItems = getWindowContextMenu(
    handleMinimize,
    handleMaximize,
    handleClose,
    handleMoveToDesktop1 // Move to Desktop submenu (will be updated)
  )

  // Update "Move to Desktop" submenu with different handlers
  const moveToDesktopItem = windowMenuItems.find(item => item.label === 'Move to Desktop')
  if (moveToDesktopItem && moveToDesktopItem.submenu) {
    moveToDesktopItem.submenu[0].action = handleMoveToDesktop1 // Desktop 1
    moveToDesktopItem.submenu[1].action = handleMoveToDesktop2 // Desktop 2
    moveToDesktopItem.submenu[2].action = handleMoveToDesktop3 // Desktop 3
    moveToDesktopItem.submenu[4].action = handleNewDesktop // New Desktop (index 4 after separator)
  }

  return (
    <motion.div
      ref={windowRef}
      className={cn('void-window', isActive && 'active', window.maximized && 'maximized', window.pip && 'pip')}
      style={{
        left: window.pip ? window.position.x : window.maximized ? 24 : window.position.x,
        top: window.pip ? window.position.y : window.maximized ? 24 : window.position.y,
        width: window.pip ? window.size.width : window.maximized ? window.innerWidth - 48 : window.size.width,
        height: window.pip ? window.size.height : window.maximized ? window.innerHeight - 48 - 48 : window.size.height,
        zIndex: window.pip ? 10000 : window.zIndex, // PiP always on top
      }}
      initial={{ 
        scale: 0.88, 
        opacity: 0, 
        filter: 'blur(12px)',
        y: 16,
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
      }}
      exit={{ 
        scale: 0.88, 
        opacity: 0, 
        filter: 'blur(12px)',
        y: -16,
      }}
      transition={{ 
        type: 'spring',
        damping: 28,
        stiffness: 400,
        mass: 0.7,
        willChange: 'transform, filter, opacity',
      }}
      onClick={() => focusWindow(window.id)}
      drag={!window.maximized && !window.pip}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.08,
        rotate: 2,
        zIndex: 10000,
        boxShadow: '0 30px 80px rgba(0, 245, 255, 0.4), 0 10px 30px rgba(0, 0, 0, 0.6)',
        filter: 'brightness(1.1)',
        transition: {
          duration: 0.1,
          ease: 'cubic-bezier(0.2, 0, 0, 1)',
        },
      }}
    >
      {/* Title Bar */}
      <VoidContextMenu
        type="window"
        items={windowMenuItems}
      >
        <div className="void-window-titlebar">
          <span className="void-window-title" title={sanitizeString(window.title, 200)}>
            {sanitizeString(window.title, 200)}
          </span>
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
            className="void-window-button pip"
            onClick={(e) => {
              e.stopPropagation()
              togglePip(window.id)
            }}
            aria-label="Picture in Picture"
            title="Picture in Picture"
          >
            ⛶
          </button>
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
      </VoidContextMenu>

      {/* Content */}
      <div 
        className="flex-1 overflow-auto" 
        style={{ 
          height: 'calc(100% - 32px)',
          padding: '16px',
          background: 'color-mix(in srgb, var(--surface, var(--void-surface)) 90%, transparent)',
        }}
      >
        {window.content || (
          <div style={{ color: 'var(--text-secondary, var(--void-text-secondary))', fontSize: '15px', lineHeight: '22px' }}>
            Window content for {sanitizeString(window.menuId || window.title, 200)}
          </div>
        )}
      </div>

      {/* Snap Zone Indicator */}
      {snapZone && !window.maximized && (
        <motion.div
          className="void-window-snap-indicator"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="void-window-snap-label">
            {snapZone === 'maximize' ? 'Maximize' : `Snap ${snapZone.replace('-', ' ')}`}
          </div>
        </motion.div>
      )}

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
