/**
 * VOID CRM - Main component that orchestrates the entire system
 */

import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import { VoidCanvas } from './VoidCanvas'
import { VoidToolbar } from './VoidToolbar'
import { VoidDesktop } from './VoidDesktop'
import { VoidWindowManager } from './VoidWindowManager'
import { VoidTaskbar } from './VoidTaskbar'
import { VoidBuddy } from './VoidBuddy'
import { VoidVoiceHub } from './VoidVoiceHub'
import { VoidMobileNav } from './VoidMobileNav'
import { VoidMenu } from './menus/VoidMenu'
import { CustomersWindow } from './windows/CustomersWindow'
import { LeadsWindow } from './windows/LeadsWindow'
import { SalesWindow } from './windows/SalesWindow'
import { PipelineWindow } from './windows/PipelineWindow'
import { AnalyticsWindow } from './windows/AnalyticsWindow'
import { AIWindow } from './windows/AIWindow'
import { MENU_CONFIGS } from '@/lib/void/menuConfigs'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { useVoidMobile } from '@/hooks/useVoidMobile'
import type { VoidWindow as VoidWindowType, MenuId, ExtractedEntity } from '@/lib/void/types'
import type { User } from '@/lib/types'

interface VOIDProps {
  user: User
  onNavigate?: (page: string) => void
}

export function VOID({ user, onNavigate }: VOIDProps) {
  const [windows, setWindows] = useKV<VoidWindowType[]>('void-windows', [])
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null)
  const [nextZIndex, setNextZIndex] = useState(100)
  const [showVoiceHub, setShowVoiceHub] = useState(false)
  const mobile = useVoidMobile()

  const handleIconDoubleClick = useCallback((menuId: MenuId) => {
    // Special handling for voice menu
    if (menuId === 'voice') {
      setShowVoiceHub(true)
      return
    }

    // Check if window already exists
    const existingWindow = windows.find(w => w.menuId === menuId)
    if (existingWindow) {
      // Focus existing window
      handleFocusWindow(existingWindow.id)
      return
    }

    // Create new window
    const menuConfig = MENU_CONFIGS.find(m => m.id === menuId)
    if (!menuConfig) return

    // Get window content component
    const getWindowContent = () => {
      switch (menuId) {
        case 'customers':
          return <CustomersWindow />
        case 'leads':
          return <LeadsWindow />
        case 'sales':
          return <SalesWindow />
        case 'pipeline':
          return <PipelineWindow />
        case 'analytics':
          return <AnalyticsWindow />
        case 'ai':
          return <AIWindow />
        default:
          return (
            <div className="p-6 text-white">
              <p className="text-gray-400">Window content for {menuConfig.label}</p>
              <p className="text-gray-500 text-sm mt-2">Coming soon...</p>
            </div>
          )
      }
    }

    const newWindow: VoidWindowType = {
      id: `window-${Date.now()}`,
      menuId,
      title: menuConfig.label,
      position: { x: 100 + (windows.length * 30), y: 100 + (windows.length * 30) },
      size: { width: 1000, height: 700 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      content: getWindowContent(),
    }

    setWindows(prev => [...prev, newWindow])
    setNextZIndex(prev => prev + 1)
  }, [windows, nextZIndex])

  const handleCloseWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId))
  }, [setWindows])

  const handleMinimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true, isMaximized: false } : w
    ))
  }, [setWindows])

  const handleRestoreWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
    ))
    setNextZIndex(prev => prev + 1)
  }, [setWindows, nextZIndex])

  const handleMaximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }, [setWindows])

  const handleResizeWindow = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ))
  }, [setWindows])

  const handleDragWindow = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ))
  }, [setWindows])

  const handleFocusWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      zIndex: w.id === windowId ? nextZIndex : w.zIndex,
    })))
    setNextZIndex(prev => prev + 1)
  }, [setWindows, nextZIndex])

  const handleMenuAction = useCallback((action: string) => {
    // Handle menu actions
    if (action.startsWith('view-')) {
      // Navigate to view
      onNavigate?.(action.replace('view-', ''))
    } else if (action === 'voice-capture') {
      setShowVoiceHub(true)
      setActiveMenu(null)
    } else {
      // Other actions
      onNavigate?.(action)
    }
    setActiveMenu(null)
  }, [onNavigate])

  const handleVoiceComplete = useCallback((entities: ExtractedEntity[]) => {
    // Create lead from voice entities
    console.log('Voice entities:', entities)
    // TODO: Create lead in CRM
    setShowVoiceHub(false)
  }, [])

  const handleIconRightClick = useCallback((iconId: string, event: React.MouseEvent) => {
    // Show context menu
    // TODO: Implement context menu
  }, [])

  // Keyboard shortcuts
  useVoidKeyboard({
    onSearch: () => {
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      searchInput?.focus()
    },
    onCloseWindow: () => {
      const topWindow = windows
        .filter(w => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0]
      if (topWindow) {
        handleCloseWindow(topWindow.id)
      }
    },
    onNewWindow: (menuId) => {
      handleIconDoubleClick(menuId as MenuId)
    },
  })

  // Keyboard shortcuts
  useVoidKeyboard({
    onSearch: () => {
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
      searchInput?.focus()
    },
    onCloseWindow: () => {
      const topWindow = windows
        .filter(w => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0]
      if (topWindow) {
        handleCloseWindow(topWindow.id)
      }
    },
    onNewWindow: (menuId) => {
      handleIconDoubleClick(menuId as MenuId)
    },
  })

  return (
    <VoidCanvas>
      <div className="h-screen w-screen overflow-hidden relative">
        {/* Top Toolbar */}
        <VoidToolbar
          onSearch={(query) => {
            // Handle global search
            console.log('Search:', query)
          }}
          onNotificationClick={() => {
            // Open notifications
          }}
          onProfileClick={() => {
            // Open profile/settings
            handleIconDoubleClick('settings')
          }}
        />

        {/* Desktop Icons */}
        <div className={cn("pt-24", mobile.isMobile && "pt-20")}>
          <VoidDesktop
            onIconClick={(menuId) => setActiveMenu(menuId)}
            onIconDoubleClick={handleIconDoubleClick}
            onIconRightClick={handleIconRightClick}
          />
        </div>

        {/* The Buddy */}
        <VoidBuddy userName={user.fullName || 'there'} />

        {/* Voice Hub */}
        {showVoiceHub && (
          <VoidVoiceHub onComplete={handleVoiceComplete} />
        )}

        {/* Floating Windows */}
        <VoidWindowManager
          windows={windows}
          onCloseWindow={handleCloseWindow}
          onMinimizeWindow={handleMinimizeWindow}
          onMaximizeWindow={handleMaximizeWindow}
          onResizeWindow={handleResizeWindow}
          onDragWindow={handleDragWindow}
          onFocusWindow={handleFocusWindow}
          isMobile={mobile.isMobile}
        />

        {/* Taskbar (Desktop only) */}
        {!mobile.isMobile && (
          <VoidTaskbar
            windows={windows}
            onRestore={handleRestoreWindow}
            onClose={handleCloseWindow}
            activeWindowId={windows.find(w => w.zIndex === Math.max(...windows.map(w => w.zIndex)))?.id}
          />
        )}

        {/* Mobile Navigation */}
        {mobile.isMobile && (
          <VoidMobileNav
            activeMenu={activeMenu}
            onMenuClick={(menuId) => {
              setActiveMenu(menuId)
              handleIconDoubleClick(menuId)
            }}
          />
        )}

        {/* Menu Popup - Show on icon click (single click) */}
        <AnimatePresence>
          {activeMenu && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
                <VoidMenu
                  menu={MENU_CONFIGS.find(m => m.id === activeMenu)!}
                  onClose={() => setActiveMenu(null)}
                  onItemClick={handleMenuAction}
                />
              </div>
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setActiveMenu(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </VoidCanvas>
  )
}
