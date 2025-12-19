import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode, memo } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

// GPU-optimized page transition with reduced motion support
export const PageTransition = memo(function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()
  
  // Skip animation entirely if user prefers reduced motion
  if (shouldReduceMotion) {
    return <div className="gpu-layer">{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        type: "tween",
        duration: 0.15,
        ease: [0.2, 0, 0.2, 1] // Optimized easing
      }}
      style={{ 
        willChange: 'opacity, transform',
        transform: 'translate3d(0, 0, 0)', // Force GPU composite layer
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  )
})
