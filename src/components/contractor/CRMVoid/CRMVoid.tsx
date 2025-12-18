import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, Kanban, Crown, Users, Brain, ChartLine, 
  Sliders, Gear, FileText, ArrowsOut, ArrowsIn, X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import { cn } from '@/lib/utils'
import type { User, CRMCustomer } from '@/lib/types'

import { VoidBackground } from './VoidBackground'
import { CentralVoiceHub } from './CentralVoiceHub'
import { OrbitingSection, DEFAULT_SECTIONS, type SectionId } from './OrbitingSection'
import { SectionPanel } from './SectionPanels'
import { MainMenuCircle } from './MainMenuCircle'
import { SubMenuCircle } from './SubMenuCircle'
import { MAIN_MENU_CONFIGS, type MainMenuId } from './MainMenuConfig'

interface CRMVoidProps {
  user: User
  onNavigate?: (page: string) => void
}

interface SectionLayout {
  id: SectionId
  angle: number
  radius: number
  visible: boolean
}

const DEFAULT_RADIUS = 200 // Reduced to fit better on screen

export function CRMVoid({ user, onNavigate }: CRMVoidProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [activeMainMenu, setActiveMainMenu] = useState<MainMenuId | null>(null)
  const [customizeMode, setCustomizeMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Prevent body scroll when CRM Void is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
  
  // Persist layout customization
  const [sectionLayouts, setSectionLayouts] = useKV<SectionLayout[]>(
    'crm-void-layout',
    DEFAULT_SECTIONS.map(s => ({
      id: s.id,
      angle: s.angle,
      radius: DEFAULT_RADIUS,
      visible: true
    }))
  )

  const isPro = user.isPro || false

  const getSectionIcon = (id: SectionId) => {
    const iconProps = { size: 24, weight: 'duotone' as const }
    switch (id) {
      case 'business-tools': return <Briefcase {...iconProps} />
      case 'kanban': return <Kanban {...iconProps} />
      case 'pro-tools': return <Crown {...iconProps} />
      case 'customers': return <Users {...iconProps} />
      case 'ai-insights': return <Brain {...iconProps} />
      case 'reports': return <ChartLine {...iconProps} />
      case 'customize': return <Sliders {...iconProps} />
      case 'settings': return <Gear {...iconProps} />
      case 'documents': return <FileText {...iconProps} />
    }
  }

  const handleSectionClick = useCallback((id: SectionId) => {
    if (customizeMode) return
    
    const section = DEFAULT_SECTIONS.find(s => s.id === id)
    if (section?.requiresPro && !isPro) {
      setActiveSection('pro-tools')
      return
    }
    
    if (id === 'customize') {
      setCustomizeMode(true)
      return
    }
    
    setActiveSection(id)
  }, [customizeMode, isPro])

  const handleClosePanel = useCallback(() => {
    setActiveSection(null)
  }, [])

  const handleCustomerAdded = useCallback((customer: CRMCustomer) => {
    // Could trigger animations or notifications
    console.log('New customer added:', customer)
  }, [])

  const handleDragEnd = useCallback((id: SectionId, x: number, y: number) => {
    if (!customizeMode) return
    
    // Calculate new angle and radius from center
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const dx = x - centerX
    const dy = y - centerY
    const newAngle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360
    const newRadius = Math.sqrt(dx * dx + dy * dy)
    
    setSectionLayouts(current => 
      (current || []).map(layout =>
        layout.id === id
          ? { ...layout, angle: newAngle, radius: Math.min(Math.max(newRadius, 120), 200) } // Reduced max radius
          : layout
      )
    )
  }, [customizeMode, setSectionLayouts])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const visibleSections = useMemo(() => {
    return (sectionLayouts || []).filter(s => s.visible)
  }, [sectionLayouts])

  // Decorative planets state
  const [planetAngles, setPlanetAngles] = useState<number[]>([
    15, 75, 135, 195, 255, 315 // Initial angles for 6 decorative planets
  ])
  const planetAnimationRef = useRef<number | null>(null)

  // Animate decorative planets
  useEffect(() => {
    const animate = () => {
      setPlanetAngles(prev => prev.map(angle => (angle + 0.02) % 360))
      planetAnimationRef.current = requestAnimationFrame(animate)
    }
    planetAnimationRef.current = requestAnimationFrame(animate)
    return () => {
      if (planetAnimationRef.current) {
        cancelAnimationFrame(planetAnimationRef.current)
      }
    }
  }, [])

  // Handle ESC key to exit customize mode
  useEffect(() => {
    if (!customizeMode) return

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCustomizeMode(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [customizeMode])

  const exitCustomizeMode = useCallback(() => {
    setCustomizeMode(false)
  }, [])

  const handleMainMenuClick = useCallback((menuId: MainMenuId) => {
    if (customizeMode) return
    
    // Toggle: if clicking the same menu, close it; otherwise open the new one
    if (activeMainMenu === menuId) {
      setActiveMainMenu(null)
    } else {
      setActiveMainMenu(menuId)
      // Close any active section panel when opening main menu
      setActiveSection(null)
    }
  }, [customizeMode, activeMainMenu])

  const handleSubMenuClick = useCallback((page: string) => {
    if (onNavigate) {
      onNavigate(page)
    }
    // Close sub-menus after navigation
    setActiveMainMenu(null)
  }, [onNavigate])

  // Calculate main menu positions (5 circles, 72 degrees apart)
  const mainMenuRadius = 280
  const mainMenuAngles = MAIN_MENU_CONFIGS.map((_, index) => index * 72)

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
        <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-white text-center drop-shadow-lg">
          <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            CRM Void System
          </span>
        </h1>
      </motion.div>

      {/* Header controls */}
      <motion.div
        className="absolute top-4 right-4 z-30 flex gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
        >
          {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
        </Button>
        
        {customizeMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={exitCustomizeMode}
              className="bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
              title="Exit Customize Mode (ESC)"
            >
              <X size={16} />
            </Button>
            <Button
              size="sm"
              onClick={exitCustomizeMode}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              title="Exit Customize Mode (ESC)"
            >
              Done Customizing
            </Button>
          </>
        )}
      </motion.div>

      {/* Customize mode indicator */}
      <AnimatePresence>
        {customizeMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white flex items-center gap-3 shadow-lg"
          >
            <p className="text-black dark:text-white text-sm font-medium">
              🎨 Customize Mode - Drag sections to reposition
            </p>
            <button
              onClick={exitCustomizeMode}
              className="ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Exit Customize Mode (ESC)"
              aria-label="Exit Customize Mode"
            >
              <X size={16} className="text-black dark:text-white" weight="bold" />
            </button>
            <span className="text-xs text-black/60 dark:text-white/60 ml-1">(Press ESC)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area - ensure no scrolling and perfect centering */}
      <div className="relative z-10 flex items-center justify-center h-screen w-screen overflow-hidden">
        {/* Centered container for all elements */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Decorative planets - behind sections */}
          {planetAngles.map((angle, index) => {
            const planetRadius = 280 + (index * 40) // Different orbital distances
            const planetSize = 12 + (index % 3) * 4 // Varying sizes
            const planetX = Math.cos((angle * Math.PI) / 180) * planetRadius
            const planetY = Math.sin((angle * Math.PI) / 180) * planetRadius
            
            // Different colors for variety
            const planetColors = [
              'rgba(139, 92, 246, 0.4)', // purple
              'rgba(59, 130, 246, 0.4)', // blue
              'rgba(236, 72, 153, 0.4)', // pink
              'rgba(34, 197, 94, 0.4)',  // green
              'rgba(251, 191, 36, 0.4)', // yellow
              'rgba(249, 115, 22, 0.4)', // orange
            ]
            const planetColor = planetColors[index % planetColors.length]
            
            return (
              <motion.div
                key={`planet-${index}`}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  zIndex: 5, // Behind sections but above background
                }}
                animate={{
                  x: planetX,
                  y: planetY,
                }}
                transition={{
                  type: 'linear',
                  duration: 0.1,
                  ease: 'linear'
                }}
              >
                <div
                  className="rounded-full blur-sm"
                  style={{
                    width: planetSize,
                    height: planetSize,
                    marginLeft: -planetSize / 2,
                    marginTop: -planetSize / 2,
                    background: `radial-gradient(circle, ${planetColor}, ${planetColor.replace('0.4', '0.1')})`,
                    boxShadow: `0 0 ${planetSize * 2}px ${planetColor}`,
                  }}
                />
              </motion.div>
            )
          })}

          {/* Central voice hub */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <CentralVoiceHub 
                user={user} 
                onCustomerAdded={handleCustomerAdded}
              />
            </div>
          </div>

          {/* Main Menu Circles */}
          {MAIN_MENU_CONFIGS.map((menuConfig, index) => {
            const angle = mainMenuAngles[index]
            const x = Math.cos((angle * Math.PI) / 180) * mainMenuRadius
            const y = Math.sin((angle * Math.PI) / 180) * mainMenuRadius
            const Icon = menuConfig.icon
            
            return (
              <div key={menuConfig.id}>
                <MainMenuCircle
                  id={menuConfig.id}
                  label={menuConfig.label}
                  icon={<Icon size={28} weight="duotone" />}
                  angle={angle}
                  radius={mainMenuRadius}
                  isActive={activeMainMenu === menuConfig.id}
                  onClick={() => handleMainMenuClick(menuConfig.id)}
                  color={menuConfig.color}
                  bgColor={menuConfig.bgColor}
                  borderColor={menuConfig.borderColor}
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
                          parentAngle={angle}
                          parentRadius={mainMenuRadius}
                          parentX={x}
                          parentY={y}
                          index={subIndex}
                          total={menuConfig.subMenus.length}
                          onClick={() => handleSubMenuClick(subMenu.page)}
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

          {/* Orbiting sections */}
          {visibleSections.map((layout) => {
            const sectionConfig = DEFAULT_SECTIONS.find(s => s.id === layout.id)
            if (!sectionConfig) return null
            
            return (
              <OrbitingSection
                key={layout.id}
                id={layout.id}
                label={sectionConfig.label}
                icon={getSectionIcon(layout.id)}
                angle={layout.angle}
                radius={Math.min(layout.radius, 200)} // Cap radius to prevent overflow
                isActive={activeSection === layout.id}
                isLocked={sectionConfig.requiresPro}
                isPro={isPro}
                onClick={() => handleSectionClick(layout.id)}
                onDragEnd={(x, y) => handleDragEnd(layout.id, x, y)}
                customizable={customizeMode}
              />
            )
          })}
        </div>
      </div>

      {/* Section panel overlay */}
      <AnimatePresence>
        {activeSection && !customizeMode && !activeMainMenu && (
          <SectionPanel
            section={activeSection}
            user={user}
            onClose={handleClosePanel}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
