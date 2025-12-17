import { useState, useCallback, useMemo, useEffect } from 'react'
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

  return (
    <div className={cn(
      "relative w-full h-screen overflow-hidden fixed inset-0 z-50",
      "bg-white dark:bg-black"
    )}>
      {/* Starfield background */}
      <VoidBackground />

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
          {/* Central voice hub */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <CentralVoiceHub 
                user={user} 
                onCustomerAdded={handleCustomerAdded}
              />
            </div>
          </div>

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
        {activeSection && !customizeMode && (
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
