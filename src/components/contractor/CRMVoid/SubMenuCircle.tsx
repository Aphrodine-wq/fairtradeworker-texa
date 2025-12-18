import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SubMenuCircleProps {
  id: string
  label: string
  icon: ReactNode
  parentAngle: number
  parentRadius: number
  parentX: number
  parentY: number
  index: number
  total: number
  onClick: () => void
  color: string
  bgColor: string
  borderColor: string
}

export function SubMenuCircle({
  id,
  label,
  icon,
  parentAngle,
  parentRadius,
  parentX,
  parentY,
  index,
  total,
  onClick,
  color,
  bgColor,
  borderColor,
}: SubMenuCircleProps) {
  // Arc positioning pattern - tighter grouping
  // Position items in a circular pattern around parent with reduced spacing
  // Using rotation-based positioning: rotate(360deg / total * index) translateX(-distance)
  const itemSize = 80 // Base item size
  const translateDistance = -180 // Reduced from -240 for tighter grouping
  const anglePerItem = (360 / total) * index
  const angleRad = (anglePerItem * Math.PI) / 180
  
  // Calculate position using rotation transform
  const relativeX = Math.cos(angleRad) * Math.abs(translateDistance)
  const relativeY = Math.sin(angleRad) * Math.abs(translateDistance)

  // Absolute position from center
  const x = parentX + relativeX
  const y = parentY + relativeY

  // Staggered animation delay - dramatically reduced for smoother animations
  const delay = index * 0.02

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        zIndex: 18,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      initial={{ 
        x, 
        y, 
        opacity: 0, 
        scale: 0.8,
      }}
      animate={{ 
        x, 
        y, 
        opacity: 1, 
        scale: 1,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8,
        transition: {
          duration: 0.1,
          ease: 'easeIn'
        }
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 900, 
        damping: 18,
        mass: 0.35,
        delay,
      }}
    >
      <motion.button
        onClick={onClick}
        data-sub-menu={id}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-20 h-20 -ml-10 -mt-10 rounded-xl",
          "border-0 hover:shadow-xl transition-shadow",
          "bg-white dark:bg-black",
          "cursor-pointer"
        )}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          willChange: 'transform', 
          transform: 'translateZ(0)'
        }}
        transition={{ type: "spring", stiffness: 900, damping: 18, mass: 0.35 }}
      >
        {/* Icon container */}
        <motion.div
          className="w-14 h-14 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-2"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: 'transform' }}
          transition={{ type: "spring", stiffness: 900, damping: 18, mass: 0.35 }}
        >
          <div className="text-2xl text-black dark:text-white">
            {icon}
          </div>
        </motion.div>
        
        {/* Label */}
        <span className={cn(
          "text-xs font-semibold text-center leading-tight px-1",
          "text-black dark:text-white"
        )}>
          {label}
        </span>
      </motion.button>
    </motion.div>
  )
}
