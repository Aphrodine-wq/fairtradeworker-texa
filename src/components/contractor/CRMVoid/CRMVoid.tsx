import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, Kanban, Crown, Users, Brain, ChartLine, 
  Sliders, Gear, FileText, ArrowsOut, ArrowsIn
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

const DEFAULT_RADIUS = 280

export function CRMVoid({ user, onNavigate }: CRMVoidProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [customizeMode, setCustomizeMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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
          ? { ...layout, angle: newAngle, radius: Math.min(Math.max(newRadius, 150), 400) }
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

  // Prevent body scroll when CRM Void is active
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className={cn(
      "fixed inset-0 w-full h-full overflow-hidden",
      "bg-background z-50"
    )}>
      {/* Subtle background pattern */}
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
          className="bg-background/80 backdrop-blur-sm border-border text-foreground hover:bg-muted"
        >
          {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
        </Button>
        
        {customizeMode && (
          <Button
            size="sm"
            onClick={() => setCustomizeMode(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Done Customizing
          </Button>
        )}
      </motion.div>

      {/* Customize mode indicator */}
      <AnimatePresence>
        {customizeMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
          >
            <p className="text-primary text-sm font-medium">
              🎨 Customize Mode - Drag sections to reposition
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {/* Central voice hub */}
        <CentralVoiceHub 
          user={user} 
          onCustomerAdded={handleCustomerAdded}
        />

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
              radius={layout.radius}
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

      {/* Stats footer */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <StatsCard label="Customers" value="—" />
        <StatsCard label="Active Leads" value="—" />
        <StatsCard label="This Month" value="$0" />
      </motion.div>
    </div>
  )
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 rounded-lg bg-card border border-border backdrop-blur-sm">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground font-semibold">{value}</p>
    </div>
  )
}
