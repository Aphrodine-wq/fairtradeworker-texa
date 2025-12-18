import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MainMenuCircleProps {
  id: string
  label: string
  x: number
  y: number
  isActive: boolean
  onClick: () => void
  onDragEnd: (x: number, y: number) => void
  color: string
  bgColor: string
  borderColor: string
}

const TOGGLER_SIZE = 40 // 40px matching SCSS $toggler-size
const LINE_HEIGHT = TOGGLER_SIZE / 8 // 5px

export function MainMenuCircle({
  id,
  label,
  x,
  y,
  isActive,
  onClick,
  onDragEnd,
  color,
  bgColor,
  borderColor,
}: MainMenuCircleProps) {
  // Constrain drag to viewport - use ref to get actual viewport size
  const [dragConstraints, setDragConstraints] = useState({
    left: -500,
    right: 500,
    top: -500,
    bottom: 500,
  })
  
  useEffect(() => {
    const updateConstraints = () => {
      setDragConstraints({
        left: -window.innerWidth / 2 + TOGGLER_SIZE / 2,
        right: window.innerWidth / 2 - TOGGLER_SIZE / 2,
        top: -window.innerHeight / 2 + TOGGLER_SIZE / 2,
        bottom: window.innerHeight / 2 - TOGGLER_SIZE / 2,
      })
    }
    updateConstraints()
    window.addEventListener('resize', updateConstraints)
    return () => window.removeEventListener('resize', updateConstraints)
  }, [])

  const [isHovered, setIsHovered] = useState(false)
  const shouldPeek = isActive || isHovered

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        zIndex: isActive ? 20 : 15,
      }}
      initial={{ x, y, opacity: 0, scale: 0 }}
      animate={{ 
        x, 
        y, 
        opacity: 1, 
        scale: 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 0.6,
      }}
      drag={!isActive} // Only allow dragging when not active
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragEnd={(_, info) => {
        // Calculate new position relative to center
        const newX = x + info.offset.x
        const newY = y + info.offset.y
        onDragEnd(newX, newY)
      }}
      whileDrag={{ scale: 1.05, opacity: 0.8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Menu "Cover" - peek open effect */}
      <motion.div
        className="relative"
        style={{
          width: `${TOGGLER_SIZE * 2.5}px`,
          height: `${TOGGLER_SIZE * 2.5}px`,
          marginLeft: `-${TOGGLER_SIZE * 1.25}px`,
          marginTop: `-${TOGGLER_SIZE * 1.25}px`,
        }}
        animate={{
          x: shouldPeek ? -10 : 0,
          rotate: shouldPeek ? -2 : 0,
        }}
        transition={{ duration: 0.5, ease: 'ease-in-out' }}
      >
        {/* Cover container with depth effects */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
          style={{
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Gradient overlays for depth (like album cover) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1%, transparent 50%),
                linear-gradient(225deg, 
                  rgba(162, 162, 162, 0.1) 0%, 
                  rgba(162, 162, 162, 0.2) 4%,
                  rgba(255, 255, 255, 0.2) 6%,
                  rgba(255, 255, 255, 0.6) 7%,
                  rgba(255, 255, 255, 0.2) 7%,
                  rgba(218, 218, 218, 0.04) 7%,
                  transparent 6%),
                linear-gradient(45deg, 
                  rgba(14, 14, 14, 0.7),
                  rgba(0, 0, 0, 0.5) 0%, 
                  rgba(0, 0, 0, 0.2) 4%,
                  rgba(14, 14, 14, 0.2) 6%,
                  rgba(255, 255, 255, 0.3) 7%,
                  rgba(218, 218, 218, 0.4) 7%,
                  transparent 8%)
              `,
            }}
          />
        </div>
        
        {/* Toggle button on top */}
        <motion.button
          onClick={onClick}
          data-main-menu={id}
          className={cn(
            "relative flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "transition-all duration-300",
            "bg-transparent",
            "cursor-pointer",
            "group",
            "z-20"
          )}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: `-${TOGGLER_SIZE / 2}px`,
            marginTop: `-${TOGGLER_SIZE / 2}px`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Hamburger/Close Toggle Lines */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Top line */}
            <motion.div
              className="absolute w-10 h-1 rounded-full bg-white/70 group-hover:bg-white transition-colors"
              style={{ height: `${LINE_HEIGHT}px` }}
              animate={{
                y: isActive ? 0 : -10,
                rotate: isActive ? 45 : 0,
              }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Middle line */}
            <motion.div
              className="absolute w-10 h-1 rounded-full bg-white/70 group-hover:bg-white transition-colors"
              style={{ height: `${LINE_HEIGHT}px` }}
              animate={{
                opacity: isActive ? 0 : 1,
              }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Bottom line */}
            <motion.div
              className="absolute w-10 h-1 rounded-full bg-white/70 group-hover:bg-white transition-colors"
              style={{ height: `${LINE_HEIGHT}px` }}
              animate={{
                y: isActive ? 0 : 10,
                rotate: isActive ? -45 : 0,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
