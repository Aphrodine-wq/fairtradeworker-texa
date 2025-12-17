import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'

export type PlanetType = 
  | 'sun'           // Central hub - You (the contractor)
  | 'mercury'       // Quick Actions - Fast, hot, closest
  | 'venus'         // Relationships - Customers & Leads
  | 'earth'         // Home Base - Dashboard & Overview
  | 'mars'          // Projects - Red planet of work
  | 'jupiter'       // Finance - Massive, dominant
  | 'saturn'        // Analytics - Rings of data
  | 'uranus'        // Integrations - Tilted, unique
  | 'neptune'       // Archive - Distant, deep storage
  | 'moon'          // Satellite - Quick tools

export interface PlanetConfig {
  id: PlanetType
  name: string
  description: string
  color: string
  glowColor: string
  size: number
  orbitRadius: number
  orbitSpeed: number // seconds per orbit
  hasRings?: boolean
  hasMoons?: number
  icon?: ReactNode
  requiresPro?: boolean
}

interface VoidPlanetProps {
  config: PlanetConfig
  isActive: boolean
  isPaused: boolean
  onClick: () => void
  showOrbit?: boolean
  currentAngle: number
}

export function VoidPlanet({
  config,
  isActive,
  isPaused,
  onClick,
  showOrbit = true,
  currentAngle
}: VoidPlanetProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Calculate position based on current angle
  const x = Math.cos((currentAngle * Math.PI) / 180) * config.orbitRadius
  const y = Math.sin((currentAngle * Math.PI) / 180) * config.orbitRadius * 0.4 // Elliptical orbit

  const planetVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.15 },
    active: { scale: 1.2 }
  }

  return (
    <>
      {/* Orbit path */}
      {showOrbit && config.id !== 'sun' && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          width={config.orbitRadius * 2 + 40}
          height={config.orbitRadius * 0.8 + 40}
          style={{ zIndex: 0 }}
        >
          <ellipse
            cx={config.orbitRadius + 20}
            cy={config.orbitRadius * 0.4 + 20}
            rx={config.orbitRadius}
            ry={config.orbitRadius * 0.4}
            fill="none"
            stroke={isActive ? config.glowColor : 'rgba(255,255,255,0.1)'}
            strokeWidth={isActive ? 2 : 1}
            strokeDasharray={isActive ? 'none' : '4 8'}
            className="transition-all duration-500"
          />
        </svg>
      )}

      {/* Planet */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: '50%',
          top: '50%',
          zIndex: isActive || isHovered ? 20 : 10,
        }}
        animate={{
          x: config.id === 'sun' ? 0 : x,
          y: config.id === 'sun' ? 0 : y,
        }}
        transition={{
          type: 'tween',
          duration: isPaused ? 0 : 0.1,
          ease: 'linear'
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        <motion.div
          className={cn(
            "relative flex items-center justify-center rounded-full",
            "transition-shadow duration-300",
            config.id === 'sun' && "animate-pulse"
          )}
          style={{
            width: config.size,
            height: config.size,
            marginLeft: -config.size / 2,
            marginTop: -config.size / 2,
            background: config.id === 'sun' 
              ? `radial-gradient(circle at 30% 30%, #fff5e6, ${config.color}, #ff6600)`
              : `radial-gradient(circle at 30% 30%, ${config.color}dd, ${config.color}, ${config.color}88)`,
            boxShadow: isActive || isHovered
              ? `0 0 ${config.size / 2}px ${config.glowColor}, 0 0 ${config.size}px ${config.glowColor}66, inset -${config.size / 8}px -${config.size / 8}px ${config.size / 4}px rgba(0,0,0,0.3)`
              : `0 0 ${config.size / 4}px ${config.glowColor}44, inset -${config.size / 8}px -${config.size / 8}px ${config.size / 4}px rgba(0,0,0,0.3)`,
          }}
          variants={planetVariants}
          animate={isActive ? 'active' : isHovered ? 'hover' : 'idle'}
          whileTap={{ scale: 0.95 }}
        >
          {/* Planet surface texture */}
          <div 
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: `
                radial-gradient(circle at 70% 70%, transparent 0%, rgba(0,0,0,0.4) 100%),
                repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.1) 10deg 20deg)
              `
            }}
          />

          {/* Icon or letter */}
          <span 
            className="relative z-10 text-white font-bold select-none"
            style={{ 
              fontSize: config.size * 0.35,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {config.icon || config.name.charAt(0)}
          </span>

          {/* Saturn's rings */}
          {config.hasRings && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: config.size * 1.8,
                height: config.size * 0.4,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `
                    radial-gradient(ellipse, 
                      transparent 40%, 
                      ${config.color}44 45%, 
                      ${config.color}88 50%, 
                      ${config.color}44 55%, 
                      transparent 60%,
                      ${config.color}22 65%,
                      ${config.color}66 70%,
                      transparent 75%
                    )
                  `,
                }}
              />
            </div>
          )}

          {/* Moons */}
          {config.hasMoons && Array.from({ length: config.hasMoons }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gray-300"
              style={{
                width: config.size * 0.15,
                height: config.size * 0.15,
              }}
              animate={{
                x: Math.cos((Date.now() / 1000 + i * 2) * 2) * config.size * 0.7,
                y: Math.sin((Date.now() / 1000 + i * 2) * 2) * config.size * 0.3,
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + i,
                ease: 'linear'
              }}
            />
          ))}
        </motion.div>

        {/* Planet label */}
        <AnimatePresence>
          {(isHovered || isActive) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ top: config.size / 2 + 8 }}
            >
              <div className="px-3 py-1.5 rounded-lg bg-black/80 dark:bg-white/90 backdrop-blur-sm border border-white/20 dark:border-black/20">
                <p className="text-xs font-semibold text-white dark:text-black">
                  {config.name}
                </p>
                <p className="text-[10px] text-white/70 dark:text-black/70">
                  {config.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

// Planet configurations for the CRM Solar System
export const PLANET_CONFIGS: PlanetConfig[] = [
  {
    id: 'sun',
    name: 'Command Center',
    description: 'Your voice hub',
    color: '#ff9500',
    glowColor: '#ffcc00',
    size: 80,
    orbitRadius: 0,
    orbitSpeed: 0,
  },
  {
    id: 'mercury',
    name: 'Quick Actions',
    description: 'Fast tasks & shortcuts',
    color: '#a0a0a0',
    glowColor: '#c0c0c0',
    size: 28,
    orbitRadius: 100,
    orbitSpeed: 8,
  },
  {
    id: 'venus',
    name: 'Relationships',
    description: 'Customers & leads',
    color: '#e6c35c',
    glowColor: '#ffd700',
    size: 38,
    orbitRadius: 140,
    orbitSpeed: 12,
  },
  {
    id: 'earth',
    name: 'Home Base',
    description: 'Dashboard overview',
    color: '#4a90d9',
    glowColor: '#6eb5ff',
    size: 40,
    orbitRadius: 180,
    orbitSpeed: 20,
    hasMoons: 1,
  },
  {
    id: 'mars',
    name: 'Projects',
    description: 'Active work & jobs',
    color: '#cd5c5c',
    glowColor: '#ff6b6b',
    size: 34,
    orbitRadius: 230,
    orbitSpeed: 28,
  },
  {
    id: 'jupiter',
    name: 'Finance',
    description: 'Money & invoices',
    color: '#d4a574',
    glowColor: '#e8c49a',
    size: 60,
    orbitRadius: 300,
    orbitSpeed: 45,
  },
  {
    id: 'saturn',
    name: 'Analytics',
    description: 'Reports & insights',
    color: '#c9b896',
    glowColor: '#e8dcc8',
    size: 52,
    orbitRadius: 370,
    orbitSpeed: 60,
    hasRings: true,
  },
  {
    id: 'uranus',
    name: 'Integrations',
    description: 'Apps & connections',
    color: '#7de3f4',
    glowColor: '#a8f0ff',
    size: 44,
    orbitRadius: 430,
    orbitSpeed: 80,
    requiresPro: true,
  },
  {
    id: 'neptune',
    name: 'Archive',
    description: 'History & storage',
    color: '#4169e1',
    glowColor: '#6b8cff',
    size: 42,
    orbitRadius: 480,
    orbitSpeed: 100,
  },
]
