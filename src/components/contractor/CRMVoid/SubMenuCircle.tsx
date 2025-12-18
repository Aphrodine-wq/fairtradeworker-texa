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
  // Calculate position in a circle around the parent
  // Sub-menus are positioned at 100px radius from parent
  const subMenuRadius = 100
  const subMenuAngle = (360 / total) * index
  const subMenuRad = (subMenuAngle * Math.PI) / 180
  
  // Position relative to parent
  const relativeX = Math.cos(subMenuRad) * subMenuRadius
  const relativeY = Math.sin(subMenuRad) * subMenuRadius
  
  // Absolute position from center
  const x = parentX + relativeX
  const y = parentY + relativeY

  // Staggered animation delay - faster for sleek animations
  const delay = index * 0.08

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
        stiffness: 400, 
        damping: 30,
        mass: 0.6,
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
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Icon container matching UnifiedPostJob style */}
        <motion.div
          className="w-14 h-14 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-2"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className={cn("text-2xl", color)}>
            {icon}
          </div>
        </motion.div>
        
        {/* Label */}
        <span className={cn(
          "text-xs font-semibold text-center leading-tight px-1",
          "text-gray-900 dark:text-white"
        )}>
          {label}
        </span>
      </motion.button>

      {/* Connection line to parent - subtle and fast */}
      <svg
        className="absolute pointer-events-none"
        style={{
          width: Math.abs(relativeX) + 50,
          height: Math.abs(relativeY) + 50,
          left: relativeX < 0 ? relativeX : -25,
          top: relativeY < 0 ? relativeY : -25,
        }}
      >
        <motion.line
          x1={relativeX < 0 ? Math.abs(relativeX) + 25 : 25}
          y1={relativeY < 0 ? Math.abs(relativeY) + 25 : 25}
          x2={relativeX < 0 ? 25 : Math.abs(relativeX) + 25}
          y2={relativeY < 0 ? 25 : Math.abs(relativeY) + 25}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.05, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}
