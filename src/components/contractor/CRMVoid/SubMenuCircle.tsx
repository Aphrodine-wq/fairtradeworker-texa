import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import type { SubMenuSize } from './MainMenuConfig'

interface SubMenuCircleProps {
  id: string
  label: string
  icon: ReactNode
  parentX: number
  parentY: number
  index: number
  total: number
  size?: SubMenuSize
  tooltip?: string
  onClick: () => void
  color: string
  bgColor: string
  borderColor: string
}

// Size mapping
const SIZE_MAP = {
  important: { size: 100, iconSize: 28 }, // 100px
  standard: { size: 80, iconSize: 24 },   // 80px
  secondary: { size: 60, iconSize: 20 },  // 60px
}

// Expansion distance - increased for more spacing
const EXPANSION_DISTANCE = 240 // Increased from 160px

export function SubMenuCircle({
  id,
  label,
  icon,
  parentX,
  parentY,
  index,
  total,
  size = 'standard',
  tooltip,
  onClick,
  color,
  bgColor,
  borderColor,
}: SubMenuCircleProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Get size configuration
  const sizeConfig = SIZE_MAP[size]
  const itemSize = sizeConfig.size
  
  // Circular expansion pattern: rotate(360deg / total * index) translateX(-distance)
  const angle = (360 / total) * index
  const angleRad = (angle * Math.PI) / 180
  
  // Calculate position using rotation and translation
  const translateX = -EXPANSION_DISTANCE - 30 // Extra spacing
  const relativeX = Math.cos(angleRad) * translateX
  const relativeY = Math.sin(angleRad) * translateX
  
  // Absolute position from center
  const x = parentX + relativeX
  const y = parentY + relativeY
  
  // Counter-rotation to keep content upright
  const counterRotation = -angle

  // Staggered animation delay
  const delay = index * 0.05

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
        x: parentX, 
        y: parentY, 
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
        x: parentX,
        y: parentY,
        opacity: 0, 
        scale: 0.8,
        transition: {
          duration: 0.3,
          ease: 'easeIn'
        }
      }}
      transition={{ 
        duration: 0.5,
        delay,
        ease: [0.175, 0.885, 0.32, 1.275], // cubic-bezier matching SCSS
      }}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && tooltip && (
        <motion.div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
        >
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
        </motion.div>
      )}
      
      <motion.div
        style={{
          transform: `rotate(${counterRotation}deg)`,
          width: `${itemSize}px`,
          height: `${itemSize}px`,
        }}
        className="flex items-center justify-center"
      >
        <motion.button
          onClick={onClick}
          data-sub-menu={id}
          className={cn(
            "relative flex flex-col items-center justify-center",
            "rounded-full",
            "border-0 transition-all duration-200",
            "bg-white/20",
            "text-white/70",
            "cursor-pointer"
          )}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            fontSize: `${itemSize / 2}px`,
          }}
          whileHover={{ 
            scale: 1.1,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            color: 'rgba(255, 255, 255, 1)',
            boxShadow: `0 0 0 ${itemSize / 40}px rgba(255, 255, 255, 0.3)`,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Icon */}
          <div 
            className="flex items-center justify-center mb-1"
            style={{ 
              transform: `scale(${sizeConfig.iconSize / 20})`,
              transformOrigin: 'center',
            }}
          >
            {icon}
          </div>
          
          {/* Label */}
          <span className="text-center leading-tight px-1 font-medium" style={{ fontSize: `${itemSize / 4.5}px` }}>
            {label}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
