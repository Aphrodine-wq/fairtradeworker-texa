/**
 * Optimized Framer Motion Configuration
 * GPU-accelerated animations with performance best practices
 */

// GPU-accelerated transition presets
export const gpuTransition = {
  type: "tween",
  duration: 0.15,
  ease: [0.2, 0, 0.2, 1], // Optimized easing curve
}

export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
}

export const quickSpring = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.5,
}

// Reduced motion check
export const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

// Animation variants optimized for GPU
export const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20,
    // Force GPU layer
    transform: "translate3d(0, 20px, 0)",
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: "translate3d(0, 0, 0)",
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transform: "translate3d(0, -10px, 0)",
    transition: { ...gpuTransition, duration: 0.1 },
  },
}

export const fadeIn = {
  initial: { 
    opacity: 0,
  },
  animate: { 
    opacity: 1,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    transition: { ...gpuTransition, duration: 0.1 },
  },
}

export const scaleIn = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    transform: "scale3d(0.95, 0.95, 1)",
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transform: "scale3d(1, 1, 1)",
    transition: quickSpring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transform: "scale3d(0.95, 0.95, 1)",
    transition: { duration: 0.1 },
  },
}

export const slideInLeft = {
  initial: { 
    opacity: 0, 
    x: -20,
    transform: "translate3d(-20px, 0, 0)",
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: "translate3d(0, 0, 0)",
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transform: "translate3d(20px, 0, 0)",
    transition: { ...gpuTransition, duration: 0.1 },
  },
}

export const slideInRight = {
  initial: { 
    opacity: 0, 
    x: 20,
    transform: "translate3d(20px, 0, 0)",
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: "translate3d(0, 0, 0)",
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transform: "translate3d(-20px, 0, 0)",
    transition: { ...gpuTransition, duration: 0.1 },
  },
}

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: gpuTransition,
  },
}

// Hover animations (GPU-optimized)
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.15 },
}

export const hoverLift = {
  y: -2,
  transition: { duration: 0.15 },
}

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
}

// Page transition variants
export const pageTransition = {
  initial: { 
    opacity: 0,
    y: 8,
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.2, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.2, 0, 0.2, 1],
    },
  },
}

// Modal/Dialog transitions
export const modalTransition = {
  initial: { 
    opacity: 0, 
    scale: 0.96,
    y: 10,
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: quickSpring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    y: 10,
    transition: { duration: 0.15 },
  },
}

// Optimized drag configuration
export const dragConfig = {
  dragMomentum: false,
  dragElastic: 0.1,
  dragTransition: {
    bounceStiffness: 300,
    bounceDamping: 30,
  },
}

// List animation config for virtual scrolling
export const listAnimation = {
  layout: true,
  layoutDependency: false, // Disable layout dependency tracking for perf
  transition: {
    type: "tween",
    duration: 0.2,
    ease: [0.2, 0, 0.2, 1],
  },
}

// Reduced motion variants (instant, no animation)
export const reducedMotionVariants = {
  initial: {},
  animate: {},
  exit: {},
}

// Helper to get motion props based on reduced motion preference
export function getMotionProps(variants: any) {
  if (prefersReducedMotion) {
    return reducedMotionVariants
  }
  return variants
}

// Performance-optimized AnimatePresence props
export const animatePresenceProps = {
  mode: "wait" as const,
  initial: false, // Disable initial animation on mount
}
