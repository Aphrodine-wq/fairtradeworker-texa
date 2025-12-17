import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowsOut, ArrowsIn, ArrowLeft, Planet } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { User, CRMCustomer } from '@/lib/types'

import { VoidBackground } from './VoidBackground'
import { PlanetarySystem } from './PlanetarySystem'
import { PlanetPanel } from './PlanetPanels'
import type { PlanetType } from './VoidPlanet'

interface CRMVoidSolarSystemProps {
  user: User
  onNavigate?: (page: string) => void
  onBack?: () => void
}

export function CRMVoidSolarSystem({ user, onNavigate, onBack }: CRMVoidSolarSystemProps) {
  const [activePlanet, setActivePlanet] = useState<PlanetType | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Prevent body scroll when Solar System is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  // Hide welcome after a delay
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handlePlanetSelect = useCallback((planet: PlanetType) => {
    setActivePlanet(planet)
  }, [])

  const handleClosePanel = useCallback(() => {
    setActivePlanet(null)
  }, [])

  const handleCustomerAdded = useCallback((customer: CRMCustomer) => {
    console.log('New customer added:', customer)
    // Could trigger animations, notifications, etc.
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Handle ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePlanet) {
        setActivePlanet(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePlanet])

  return (
    <div className={cn(
      "relative w-full h-screen overflow-hidden fixed inset-0 z-50",
      "bg-[#050510] dark:bg-[#050510]"
    )}>
      {/* Cosmic background with stars, nebulae, and shooting stars */}
      <VoidBackground />

      {/* Welcome animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                🌌
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                CRM Solar System
              </h1>
              <p className="text-white/60 text-lg">
                Your business universe awaits...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header controls */}
      <motion.div
        className="absolute top-4 right-4 z-40 flex gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="bg-black/50 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-black/50 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
        </Button>
      </motion.div>

      {/* Title */}
      <motion.div
        className="absolute top-4 left-4 z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Planet size={24} className="text-white" weight="fill" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CRM Solar System</h1>
            <p className="text-xs text-white/50">Navigate your business universe</p>
          </div>
        </div>
      </motion.div>

      {/* The planetary system */}
      <div className="relative z-10 w-full h-full">
        <PlanetarySystem
          user={user}
          onPlanetSelect={handlePlanetSelect}
          activePlanet={activePlanet}
          onCustomerAdded={handleCustomerAdded}
        />
      </div>

      {/* Planet panels */}
      <AnimatePresence>
        {activePlanet && (
          <PlanetPanel
            planet={activePlanet}
            user={user}
            onClose={handleClosePanel}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      {/* Stats footer */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-lg">👥</span>
            <span className="text-sm font-medium">47 Customers</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-lg">📁</span>
            <span className="text-sm font-medium">12 Projects</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-lg">💰</span>
            <span className="text-sm font-medium">$156K Pipeline</span>
          </div>
        </div>
      </motion.div>

      {/* Keyboard shortcut hints */}
      <motion.div
        className="absolute bottom-4 right-4 z-30 text-xs text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p>Press <kbd className="px-1 py-0.5 rounded bg-white/10">ESC</kbd> to close panels</p>
      </motion.div>
    </div>
  )
}
