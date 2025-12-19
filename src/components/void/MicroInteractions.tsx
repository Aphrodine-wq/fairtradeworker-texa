import { ReactNode, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { use120fps } from '@/hooks/use120fps'

interface MicroInteractionsProps {
  children: ReactNode
  type?: 'icon' | 'window' | 'button'
  onHover?: () => void
  onDrag?: () => void
  onTap?: () => void
}

/**
 * Icon hover: scale(1) → scale(1.05) + glow(4px) [16ms]
 */
export function IconInteraction({ children, onHover, onDrag }: MicroInteractionsProps) {
  const { effectiveFps } = use120fps()
  const scale = useSpring(1, {
    stiffness: 400,
    damping: 30,
    mass: 0.5,
  })
  const glow = useSpring(0, {
    stiffness: 400,
    damping: 30,
  })

  const glowValue = useTransform(glow, [0, 1], [0, 4])

  return (
    <motion.div
      onHoverStart={() => {
        scale.set(1.05)
        glow.set(1)
        onHover?.()
      }}
      onHoverEnd={() => {
        scale.set(1)
        glow.set(0)
      }}
      onDragStart={() => {
        scale.set(1.1)
        onDrag?.()
      }}
      onDragEnd={() => {
        scale.set(1)
      }}
      style={{
        scale,
        filter: `drop-shadow(0 0 ${glowValue}px currentColor)`,
        willChange: 'transform, filter',
        transform: 'translateZ(0)',
      }}
      transition={{
        duration: 0.016, // 16ms for 120fps
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Icon drag: z-index++ + shadow-2xl + rotate(2deg) [16ms]
 */
export function DraggableIcon({ children, onDrag }: MicroInteractionsProps) {
  const { effectiveFps } = use120fps()
  const zIndex = useMotionValue(1)
  const rotate = useSpring(0, {
    stiffness: 300,
    damping: 25,
  })
  const shadow = useSpring(0, {
    stiffness: 300,
    damping: 25,
  })

  const shadowValue = useTransform(shadow, [0, 1], [0, 24])

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        zIndex.set(1000)
        rotate.set(2)
        shadow.set(1)
        onDrag?.()
      }}
      onDragEnd={() => {
        rotate.set(0)
        shadow.set(0)
        setTimeout(() => {
          zIndex.set(1)
        }, 200)
      }}
      style={{
        zIndex,
        rotate,
        boxShadow: `0 ${shadowValue}px ${shadowValue}px rgba(0, 0, 0, 0.3)`,
        willChange: 'transform, box-shadow',
        transform: 'translateZ(0)',
      }}
      transition={{
        duration: 0.016,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Window open: scale(0.9→1) + blur(10px→0) [spring, 200ms]
 */
interface WindowInteractionProps extends MicroInteractionsProps {
  isOpen: boolean
}

export function WindowInteraction({ children, isOpen }: WindowInteractionProps) {
  const scale = useSpring(isOpen ? 1 : 0.9, {
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  })
  const blur = useSpring(isOpen ? 0 : 10, {
    stiffness: 300,
    damping: 30,
  })

  const blurValue = useTransform(blur, [10, 0], [10, 0])

  useEffect(() => {
    scale.set(isOpen ? 1 : 0.9)
    blur.set(isOpen ? 0 : 10)
  }, [isOpen, scale, blur])

  return (
    <motion.div
      style={{
        scale,
        filter: `blur(${blurValue}px)`,
        willChange: 'transform, filter',
        transform: 'translateZ(0)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Window snap: Magnetic slide + haptic feedback (if supported)
 */
export function SnappableWindow({ children }: MicroInteractionsProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const snapThreshold = 50

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Short haptic feedback
    }
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.2}
      onDrag={(_, info) => {
        x.set(info.point.x)
        y.set(info.point.y)
      }}
      onDragEnd={(_, info) => {
        // Magnetic snap to grid
        const snapX = Math.round(info.point.x / snapThreshold) * snapThreshold
        const snapY = Math.round(info.point.y / snapThreshold) * snapThreshold

        if (Math.abs(snapX - info.point.x) < snapThreshold || Math.abs(snapY - info.point.y) < snapThreshold) {
          triggerHaptic()
        }

        x.set(snapX)
        y.set(snapY)
      }}
      style={{
        x,
        y,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Button tap: scale(0.98) + background shift [8ms]
 */
export function ButtonInteraction({ children, onTap }: MicroInteractionsProps) {
  const scale = useSpring(1, {
    stiffness: 500,
    damping: 30,
    mass: 0.3,
  })
  const backgroundShift = useSpring(0, {
    stiffness: 500,
    damping: 30,
  })

  const bgValue = useTransform(backgroundShift, [0, 1], [0, 0.05])

  return (
    <motion.button
      onTapStart={() => {
        scale.set(0.98)
        backgroundShift.set(1)
      }}
      onTapCancel={() => {
        scale.set(1)
        backgroundShift.set(0)
      }}
      onTap={() => {
        scale.set(1)
        backgroundShift.set(0)
        onTap?.()
      }}
      style={{
        scale,
        backgroundColor: `rgba(0, 0, 0, ${bgValue})`,
        willChange: 'transform, background-color',
        transform: 'translateZ(0)',
      }}
      transition={{
        duration: 0.008, // 8ms for 120fps
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.button>
  )
}

/**
 * Main component that wraps children with appropriate micro-interactions
 */
export function MicroInteractions({ children, type = 'button', ...props }: MicroInteractionsProps) {
  switch (type) {
    case 'icon':
      return <IconInteraction {...props}>{children}</IconInteraction>
    case 'window':
      return <WindowInteraction {...props}>{children}</WindowInteraction>
    case 'button':
    default:
      return <ButtonInteraction {...props}>{children}</ButtonInteraction>
  }
}
