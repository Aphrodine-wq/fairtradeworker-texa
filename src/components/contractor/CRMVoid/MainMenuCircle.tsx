import { motion, AnimatePresence } from 'framer-motion'
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
      {/* Circular expansion background - similar to CSS .circular-menu.active:after */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute rounded-full bg-black dark:bg-white"
            style={{
              width: '3.5em',
              height: '3.5em',
              left: '-1.75em',
              top: '-1.75em',
              zIndex: -1,
            }}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ 
              scale: 5.5, 
              opacity: 0.1,
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 0.8
            }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        data-main-menu={id}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-20 h-20 -ml-10 -mt-10 rounded-full",
          "transition-all duration-300",
          "border-2",
          isActive 
            ? "bg-black dark:bg-white border-black dark:border-white shadow-lg" 
            : "bg-white dark:bg-black border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Icon */}
        <div className={cn(
          "text-2xl mb-1",
          isActive ? "text-white dark:text-black" : "text-black dark:text-white"
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
      </motion.button>
    </motion.div>
  )
}
