import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { X, Microphone } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User, CRMCustomer } from '@/lib/types'

import { VoidBackground } from './VoidBackground'
import { CentralVoiceHub } from './CentralVoiceHub'
import { MainMenuCircle } from './MainMenuCircle'
import { SubMenuCircle } from './SubMenuCircle'
import { LeadCaptureMenu } from './LeadCaptureMenu'
import { VoidClock } from './VoidClock'
import { CRMVoidBentoGrid } from './CRMVoidBentoGrid'
import { MusicPlayer } from './MusicPlayer'
import { MAIN_MENU_CONFIGS, type MainMenuId } from './MainMenuConfig'

// Type for menu positions
interface MenuPosition {
  x: number
  y: number
}

interface CRMVoidProps {
  user: User
  onNavigate?: (page: string) => void
}

export function CRMVoid({ user, onNavigate }: CRMVoidProps) {
  const [activeMainMenu, setActiveMainMenu] = useState<MainMenuId | null>(null)
  const [showVoiceIntake, setShowVoiceIntake] = useState(false)
  const [pinnedMenus, setPinnedMenus] = useKV<MainMenuId[]>("crm-void-pinned-menus", [])
  
  // Drag-and-drop menu positions (persisted in localStorage)
  const [menuPositions, setMenuPositions] = useKV<Record<MainMenuId, MenuPosition>>("crm-void-menu-positions", {})
  
  // Voice intake position (persisted in localStorage)
  const [voiceIntakePosition, setVoiceIntakePosition] = useKV<MenuPosition | null>("crm-void-voice-intake-position", null)
  
  // Track which menu is being dragged
  const [draggingMenu, setDraggingMenu] = useState<MainMenuId | null>(null)
  
  // Prevent body scroll when CRM Void is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const handleCustomerAdded = useCallback((customer: CRMCustomer) => {
    // Could trigger animations or notifications
    console.log('New customer added:', customer)
  }, [])

  const handleMainMenuClick = useCallback((menuId: MainMenuId) => {
    // Toggle: if clicking the same menu, close it; otherwise open the new one
    if (activeMainMenu === menuId) {
      setActiveMainMenu(null)
    } else {
      setActiveMainMenu(menuId)
    }
  }, [activeMainMenu])

  const handlePinToggle = useCallback((menuId: MainMenuId) => {
    setPinnedMenus((current) => {
      const isPinned = (current || []).includes(menuId)
      if (isPinned) {
        return (current || []).filter(id => id !== menuId)
      } else {
        return [...(current || []), menuId]
      }
    })
  }, [setPinnedMenus])

  const handleSubMenuClick = useCallback((page: string, subMenuId: string) => {
    // Check if this is the "Import Customer Data" sub-menu
    if (subMenuId === 'import-customer-data') {
      setShowVoiceIntake(true)
      setActiveMainMenu(null)
      return
    }
    
    // For all sub-menus (including leads), navigate and close menu
    if (onNavigate) {
      onNavigate(page)
    }
    // Close sub-menus after navigation
    setActiveMainMenu(null)
  }, [onNavigate])

  // Handle menu drag end - save new position
  const handleMenuDragEnd = useCallback((menuId: MainMenuId, position: { x: number; y: number }) => {
    setMenuPositions((current) => ({
      ...current,
      [menuId]: position,
    }))
    setDraggingMenu(null)
  }, [setMenuPositions])

  // Handle voice intake drag end - save new position
  const handleVoiceIntakeDragEnd = useCallback((position: { x: number; y: number }) => {
    setVoiceIntakePosition(position)
  }, [setVoiceIntakePosition])

  // Calculate main menu positions - horizontal row layout
  const menuSpacing = 120 // pixels between menus
  const startX = -(MAIN_MENU_CONFIGS.length * menuSpacing) / 2
  const menuPositionsLinear = MAIN_MENU_CONFIGS.map((_, index) => ({
    x: startX + (index * menuSpacing),
    y: 0 // Center vertically
  }))

  // Handle ESC key to close main menu
  useEffect(() => {
    if (!activeMainMenu) return

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMainMenu(null)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [activeMainMenu])

  // Handle click outside to close sub-menus
  useEffect(() => {
    if (!activeMainMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if click is outside main menu circles and sub-menu circles
      if (!target.closest('[data-main-menu]') && !target.closest('[data-sub-menu]')) {
        setActiveMainMenu(null)
      }
    }

    // Small delay to prevent immediate closing when opening
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMainMenu])

  return (
    <div className={cn(
      "relative w-full h-screen overflow-hidden fixed inset-0 z-50",
      "bg-transparent"
    )}>
      {/* Starfield background */}
      <VoidBackground />

      {/* CRM Void System Title */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          <span className="text-white dark:text-white brightness-110">
            CRM Void System
          </span>
        </h1>
      </motion.div>

      {/* Void Clock - Top Right */}
      <motion.div
        className="absolute top-8 right-8 z-30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <VoidClock />
      </motion.div>

      {/* Bento Grid - Top Left (below title) */}
      <motion.div
        className="absolute top-24 left-8 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 900, damping: 18 }}
      >
        <CRMVoidBentoGrid user={user} onNavigate={onNavigate} />
      </motion.div>

      {/* Central Voice Intake Hub - Draggable */}
      <motion.div
        className="absolute z-30"
        style={{
          left: voiceIntakePosition ? '50%' : '50%',
          top: voiceIntakePosition ? '50%' : '50%',
          transform: voiceIntakePosition 
            ? `translate(${voiceIntakePosition.x}px, ${voiceIntakePosition.y}px)` 
            : 'translate(-50%, -50%)'
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 150, damping: 15 }}
      >
        <CentralVoiceHub 
          user={user} 
          onCustomerAdded={handleCustomerAdded}
          position={voiceIntakePosition || undefined}
          onDragEnd={handleVoiceIntakeDragEnd}
          isDraggable={true}
        />
      </motion.div>

      {/* Main content area - ensure no scrolling and perfect centering */}
      <div className="relative z-10 flex items-center justify-center h-screen w-screen overflow-hidden">
        {/* Centered container for all elements */}
        <div className="relative w-full h-full flex items-center justify-center">

          {/* Main Menu Circles - with drag-and-drop, linear layout */}
          {MAIN_MENU_CONFIGS.map((menuConfig, index) => {
            // Use linear positions instead of circular
            const defaultPos = menuPositionsLinear[index]
            // Use custom position if saved, otherwise use default linear position
            const customPos = menuPositions?.[menuConfig.id]
            const x = customPos?.x ?? defaultPos.x
            const y = customPos?.y ?? defaultPos.y
            const Icon = menuConfig.icon
            
            return (
              <div key={menuConfig.id}>
                <MainMenuCircle
                  id={menuConfig.id}
                  label={menuConfig.label}
                  icon={<Icon size={28} weight="duotone" />}
                  angle={0} // Not used in linear layout
                  radius={0} // Not used in linear layout
                  isActive={activeMainMenu === menuConfig.id}
                  onClick={() => handleMainMenuClick(menuConfig.id)}
                  color={menuConfig.color}
                  bgColor={menuConfig.bgColor}
                  borderColor={menuConfig.borderColor}
                  isPinned={(pinnedMenus || []).includes(menuConfig.id)}
                  onPinToggle={() => handlePinToggle(menuConfig.id)}
                  customPosition={customPos}
                  onDragEnd={(pos) => handleMenuDragEnd(menuConfig.id, pos)}
                  isDraggable={true}
                />
                
                {/* Sub-Menu Circles - appear when main menu is active */}
                <AnimatePresence>
                  {activeMainMenu === menuConfig.id && (
                    <>
                      {menuConfig.subMenus.map((subMenu, subIndex) => (
                        <SubMenuCircle
                          key={subMenu.id}
                          id={subMenu.id}
                          label={subMenu.label}
                          icon={subMenu.icon}
                          parentAngle={0} // Not used in linear layout
                          parentRadius={0} // Not used in linear layout
                          parentX={x}
                          parentY={y}
                          index={subIndex}
                          total={menuConfig.subMenus.length}
                          onClick={() => handleSubMenuClick(subMenu.page, subMenu.id)}
                          color={menuConfig.color}
                          bgColor={menuConfig.bgColor}
                          borderColor={menuConfig.borderColor}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

        </div>
      </div>

      {/* Lead Capture Menu Panel */}
      <AnimatePresence>
        {activeMainMenu === 'leads' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto max-h-[90vh] overflow-y-auto">
              <LeadCaptureMenu 
                user={user}
                onLeadCaptured={(lead) => {
                  console.log('Lead captured:', lead)
                  // Could trigger sync to CRM here
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Intake Modal */}
      <AnimatePresence>
        {showVoiceIntake && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
              onClick={() => setShowVoiceIntake(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="relative pointer-events-auto bg-white dark:bg-black rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceIntake(false)}
                  className="absolute top-4 right-4 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </Button>
                
                {/* Central Voice Hub */}
                <div className="flex items-center justify-center">
                  <CentralVoiceHub 
                    user={user} 
                    onCustomerAdded={(customer) => {
                      handleCustomerAdded(customer)
                      // Optionally close modal after adding customer
                      setTimeout(() => setShowVoiceIntake(false), 1500)
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Music Player */}
      <MusicPlayer />

    </div>
  )
}
