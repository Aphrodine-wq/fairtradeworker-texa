import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ReactNode, useCallback, useState } from 'react'
import { PushPin, PushPinSlash, DotsSixVertical } from '@phosphor-icons/react'
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
  // Drag-and-drop props
  customPosition?: { x: number; y: number }
  onDragEnd?: (position: { x: number; y: number }) => void
  isDraggable?: boolean
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
  customPosition,
  onDragEnd,
  isDraggable = true,
}: MainMenuCircleProps) {
  // Calculate default position from angle and radius (only if radius > 0, otherwise use 0,0)
  const defaultX = radius > 0 ? Math.cos((angle * Math.PI) / 180) * radius : 0
  const defaultY = radius > 0 ? Math.sin((angle * Math.PI) / 180) * radius : 0
  
  // Use custom position if available, otherwise use calculated position
  const x = customPosition?.x ?? defaultX
  const y = customPosition?.y ?? defaultY
  
  const [isDragging, setIsDragging] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    if (onDragEnd) {
      // Calculate new position based on drag offset
      const newX = x + info.offset.x
      const newY = y + info.offset.y
      onDragEnd({ x: newX, y: newY })
    }
  }, [x, y, onDragEnd])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Get click position relative to the button
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left - rect.width / 2
    const clickY = e.clientY - rect.top - rect.height / 2
    
    // Add ripple
    const rippleId = Date.now()
    setRipples(prev => [...prev, { id: rippleId, x: clickX, y: clickY }])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 600)
    
    // Call original onClick
    onClick()
  }, [onClick])

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        zIndex: isActive ? 20 : isDragging ? 25 : 15,
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
      }}
      initial={false}
      animate={{ 
        x, 
        y, 
        opacity: 1, 
        scale: isDragging ? 1.1 : 1,
      }}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.15, zIndex: 30 }}
      transition={{ 
        type: 'spring', 
        stiffness: 900, 
        damping: 18,
        mass: 0.35,
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
        onClick={handleClick}
        data-main-menu={id}
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden",
          "w-24 h-24 -ml-12 -mt-12 rounded-2xl",
          "transition-all duration-300",
          "shadow-lg hover:shadow-2xl",
          "backdrop-blur-md",
          isActive 
            ? "bg-gradient-to-br from-black to-gray-900 dark:from-white dark:to-gray-100" 
            : "bg-white/90 dark:bg-black/90 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
          isPinned && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent"
        )}
        whileHover={{ 
          scale: 1.15,
          rotate: [0, -2, 2, -2, 0],
          transition: { duration: 0.5 }
        }}
        whileTap={{ scale: 0.9 }}
        style={{ willChange: 'transform' }}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                x: ripple.x,
                y: ripple.y,
                width: 4,
                height: 4,
                background: isActive 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : 'rgba(0, 0, 0, 0.3)',
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ 
                scale: 25,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          ))}
        </AnimatePresence>
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
        {/* Icon with modern animation */}
        <motion.div 
          className={cn(
            "text-3xl mb-1",
            isActive ? "text-white dark:text-black" : "text-black dark:text-white"
          )}
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
        >
          {icon}
        </motion.div>
        
        {/* Label with modern styling */}
        <motion.span 
          className={cn(
            "text-[11px] font-bold text-center leading-tight tracking-wide",
            isActive ? "text-white dark:text-black" : "text-black dark:text-white"
          )}
          animate={isActive ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        >
          {label}
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
