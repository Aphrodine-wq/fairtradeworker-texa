import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { PushPin, PushPinSlash } from '@phosphor-icons/react'
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
  isPinned?: boolean
  onPinToggle?: () => void
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
  isPinned = false,
  onPinToggle,
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
        stiffness: 900, 
        damping: 18,
        mass: 0.35,
        delay: angle / 360 * 0.05
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
              stiffness: 800,
              damping: 18,
              mass: 0.35
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
            ? "bg-black dark:bg-white border-black dark:border-black shadow-lg" 
            : "bg-white dark:bg-black border-black dark:border-black hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
          isPinned && "ring-2 ring-black dark:ring-black ring-offset-2"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform' }}
      >
        {/* Pin button */}
        {onPinToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPinToggle()
            }}
            className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10",
              "bg-black dark:bg-white text-white dark:text-black",
              "hover:scale-110 transition-transform",
              "shadow-sm"
            )}
            aria-label={isPinned ? "Unpin menu" : "Pin menu"}
          >
            {isPinned ? (
              <PushPin size={12} weight="fill" />
            ) : (
              <PushPinSlash size={12} weight="fill" />
            )}
          </button>
        )}
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
