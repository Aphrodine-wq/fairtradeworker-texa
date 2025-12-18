import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainMenuCircleProps {
  id: string
  label: string
  icon: ReactNode
  angle: number
  radius: number
  isActive: boolean
  onClick: () => void
  color: string
  bgColor: string
  borderColor: string
}

export function MainMenuCircle({
  id,
  label,
  icon,
  angle,
  radius,
  isActive,
  onClick,
  color,
  bgColor,
  borderColor,
}: MainMenuCircleProps) {
  // Calculate position from angle and radius
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius

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
        delay: angle / 360 * 0.2
      }}
    >
      <motion.button
        onClick={onClick}
        data-main-menu={id}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-20 h-20 -ml-10 -mt-10 rounded-full",
          "transition-all duration-300",
          "border-2",
          isActive 
            ? "bg-black dark:bg-white border-black dark:border-white shadow-lg shadow-white/20" 
            : `${bgColor} ${borderColor} hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black`,
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Icon */}
        <div className={cn(
          "text-2xl mb-1",
          isActive ? "text-white dark:text-black" : color
        )}>
          {icon}
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-[10px] font-medium text-center leading-tight",
          isActive ? "text-white dark:text-black" : "text-black dark:text-white"
        )}>
          {label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white dark:border-black"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>

      {/* Connection line to center */}
      <svg
        className="absolute pointer-events-none"
        style={{
          width: Math.abs(x) + 50,
          height: Math.abs(y) + 50,
          left: x < 0 ? x : -25,
          top: y < 0 ? y : -25,
        }}
      >
        <motion.line
          x1={x < 0 ? Math.abs(x) + 25 : 25}
          y1={y < 0 ? Math.abs(y) + 25 : 25}
          x2={x < 0 ? 25 : Math.abs(x) + 25}
          y2={y < 0 ? 25 : Math.abs(y) + 25}
          stroke={isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
          className="dark:stroke-white/30 dark:stroke-white/10"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: angle / 360 * 0.3 }}
        />
      </svg>
    </motion.div>
  )
}
