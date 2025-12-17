import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, FastForward, Rewind, Planet, Eye, EyeSlash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VoidPlanet, PLANET_CONFIGS, PlanetType, PlanetConfig } from './VoidPlanet'
import { CentralVoiceHub } from './CentralVoiceHub'
import type { User, CRMCustomer } from '@/lib/types'

interface PlanetarySystemProps {
  user: User
  onPlanetSelect: (planet: PlanetType) => void
  activePlanet: PlanetType | null
  onCustomerAdded?: (customer: CRMCustomer) => void
}

interface PlanetState {
  angle: number
  config: PlanetConfig
}

export function PlanetarySystem({ 
  user, 
  onPlanetSelect, 
  activePlanet,
  onCustomerAdded 
}: PlanetarySystemProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [showOrbits, setShowOrbits] = useState(true)
  const [planetStates, setPlanetStates] = useState<PlanetState[]>(() =>
    PLANET_CONFIGS.map((config, i) => ({
      angle: (i * 40) % 360, // Stagger initial positions
      config
    }))
  )
  
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(Date.now())
  const isPro = user.isPro || false

  // Orbital animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const deltaTime = (now - lastTimeRef.current) / 1000 // Convert to seconds
      lastTimeRef.current = now

      if (!isPaused) {
        setPlanetStates(prev => prev.map(state => {
          if (state.config.id === 'sun') return state
          
          // Calculate angular velocity based on orbit speed
          const angularVelocity = (360 / state.config.orbitSpeed) * speedMultiplier
          const newAngle = (state.angle + angularVelocity * deltaTime) % 360
          
          return { ...state, angle: newAngle }
        }))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, speedMultiplier])

  const handlePlanetClick = useCallback((planetId: PlanetType) => {
    const config = PLANET_CONFIGS.find(p => p.id === planetId)
    if (config?.requiresPro && !isPro) {
      onPlanetSelect('uranus') // Show pro upgrade for locked planets
      return
    }
    onPlanetSelect(planetId)
  }, [isPro, onPlanetSelect])

  const togglePause = () => setIsPaused(prev => !prev)
  const speedUp = () => setSpeedMultiplier(prev => Math.min(prev * 2, 8))
  const slowDown = () => setSpeedMultiplier(prev => Math.max(prev / 2, 0.25))
  const toggleOrbits = () => setShowOrbits(prev => !prev)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Orbital controls */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 dark:bg-white/10 backdrop-blur-md border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={slowDown}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          title="Slow down orbits"
        >
          <Rewind size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePause}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          title={isPaused ? "Resume orbits" : "Pause orbits"}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={speedUp}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          title="Speed up orbits"
        >
          <FastForward size={16} />
        </Button>

        <div className="w-px h-6 bg-white/30 mx-1" />

        <span className="text-xs text-white/80 font-mono min-w-[40px] text-center">
          {speedMultiplier}x
        </span>

        <div className="w-px h-6 bg-white/30 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOrbits}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          title={showOrbits ? "Hide orbits" : "Show orbits"}
        >
          {showOrbits ? <Eye size={16} /> : <EyeSlash size={16} />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPlanetSelect('sun')}
          className={cn(
            "h-8 w-8 p-0 text-white hover:bg-white/20",
            activePlanet === 'sun' && "bg-white/20"
          )}
          title="Go to Command Center"
        >
          <Planet size={16} />
        </Button>
      </motion.div>

      {/* Solar system info display */}
      <motion.div
        className="absolute top-6 left-6 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="px-4 py-3 rounded-lg bg-black/60 dark:bg-white/10 backdrop-blur-md border border-white/20">
          <h3 className="text-sm font-bold text-white mb-1">🌌 CRM Solar System</h3>
          <p className="text-xs text-white/70">
            {PLANET_CONFIGS.length - 1} planets • {isPaused ? 'Paused' : 'Orbiting'}
          </p>
          {activePlanet && (
            <p className="text-xs text-yellow-400 mt-1">
              Active: {PLANET_CONFIGS.find(p => p.id === activePlanet)?.name}
            </p>
          )}
        </div>
      </motion.div>

      {/* Planet legend */}
      <motion.div
        className="absolute top-6 right-6 z-30 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="px-4 py-3 rounded-lg bg-black/60 dark:bg-white/10 backdrop-blur-md border border-white/20">
          <h4 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
            Planetary Guide
          </h4>
          <div className="space-y-1.5">
            {PLANET_CONFIGS.filter(p => p.id !== 'sun').map(planet => (
              <button
                key={planet.id}
                onClick={() => handlePlanetClick(planet.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1 rounded transition-colors text-left",
                  activePlanet === planet.id 
                    ? "bg-white/20" 
                    : "hover:bg-white/10",
                  planet.requiresPro && !isPro && "opacity-50"
                )}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ 
                    background: `radial-gradient(circle at 30% 30%, ${planet.color}dd, ${planet.color})`,
                    boxShadow: `0 0 6px ${planet.glowColor}88`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {planet.name}
                    {planet.requiresPro && !isPro && ' 🔒'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* The solar system */}
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        {/* Render planets */}
        {planetStates.map(state => (
          <VoidPlanet
            key={state.config.id}
            config={state.config}
            currentAngle={state.angle}
            isActive={activePlanet === state.config.id}
            isPaused={isPaused}
            onClick={() => handlePlanetClick(state.config.id)}
            showOrbit={showOrbits}
          />
        ))}

        {/* Central voice hub (inside the sun) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <AnimatePresence>
            {activePlanet === 'sun' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CentralVoiceHub 
                  user={user} 
                  onCustomerAdded={onCustomerAdded}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Connection lines between related planets */}
      <PlanetaryConnections 
        planetStates={planetStates}
        activePlanet={activePlanet}
        showConnections={showOrbits}
      />
    </div>
  )
}

// Component to show connections between related planets
interface PlanetaryConnectionsProps {
  planetStates: PlanetState[]
  activePlanet: PlanetType | null
  showConnections: boolean
}

function PlanetaryConnections({ planetStates, activePlanet, showConnections }: PlanetaryConnectionsProps) {
  if (!showConnections || !activePlanet) return null

  // Define planet relationships
  const relationships: Record<PlanetType, PlanetType[]> = {
    sun: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    mercury: ['sun', 'venus'],
    venus: ['sun', 'earth', 'mars'], // Customers connect to projects and home
    earth: ['sun', 'venus', 'mars', 'jupiter'], // Dashboard connects to most things
    mars: ['sun', 'earth', 'jupiter', 'venus'], // Projects connect to finance, customers, dashboard
    jupiter: ['sun', 'earth', 'mars', 'saturn'], // Finance connects to projects, analytics
    saturn: ['sun', 'jupiter', 'earth'], // Analytics connects to finance, dashboard
    uranus: ['sun', 'saturn', 'neptune'], // Integrations connect to analytics, archive
    neptune: ['sun', 'uranus'], // Archive connects to integrations
    moon: ['earth']
  }

  const activePlanetState = planetStates.find(p => p.config.id === activePlanet)
  if (!activePlanetState) return null

  const relatedPlanets = relationships[activePlanet] || []
  
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {relatedPlanets.map(relatedId => {
        const relatedState = planetStates.find(p => p.config.id === relatedId)
        if (!relatedState) return null

        // Calculate positions
        const activeX = activePlanetState.config.id === 'sun' 
          ? window.innerWidth / 2 
          : window.innerWidth / 2 + Math.cos((activePlanetState.angle * Math.PI) / 180) * activePlanetState.config.orbitRadius
        const activeY = activePlanetState.config.id === 'sun'
          ? window.innerHeight / 2
          : window.innerHeight / 2 + Math.sin((activePlanetState.angle * Math.PI) / 180) * activePlanetState.config.orbitRadius * 0.4

        const relatedX = relatedState.config.id === 'sun'
          ? window.innerWidth / 2
          : window.innerWidth / 2 + Math.cos((relatedState.angle * Math.PI) / 180) * relatedState.config.orbitRadius
        const relatedY = relatedState.config.id === 'sun'
          ? window.innerHeight / 2
          : window.innerHeight / 2 + Math.sin((relatedState.angle * Math.PI) / 180) * relatedState.config.orbitRadius * 0.4

        return (
          <motion.line
            key={`${activePlanet}-${relatedId}`}
            x1={activeX}
            y1={activeY}
            x2={relatedX}
            y2={relatedY}
            stroke={activePlanetState.config.glowColor}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )
      })}
    </svg>
  )
}

export { PLANET_CONFIGS }
export type { PlanetType }
