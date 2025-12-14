/**
 * Animation variants and utilities for Framer Motion
 * Optimized for 60fps with GPU acceleration
 */

// GPU-accelerated transforms (use transform3d for hardware acceleration)
export const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    willChange: 'opacity, transform'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    willChange: 'auto',
    transition: {
      duration: 0.2, // Reduced from 0.3 for faster animations
      ease: [0.25, 0.46, 0.45, 0.94],
      // Use transform3d for GPU acceleration
      transform: 'translate3d(0, 0, 0)'
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    willChange: 'opacity, transform',
    transition: { 
      duration: 0.15, // Reduced from 0.2
      ease: 'easeIn'
    }
  }
}

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

export const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    willChange: 'opacity, transform'
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    willChange: 'auto',
    transition: {
      type: "spring",
      stiffness: 400, // Increased for snappier animations
      damping: 30, // Increased for less bounce
      mass: 0.8 // Reduced mass for faster response
    }
  }
}

export const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, // Reduced from 0.9 for less movement
    y: 10, // Reduced from 20
    willChange: 'opacity, transform'
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    willChange: 'auto',
    transition: {
      type: "spring",
      damping: 30, // Increased for less bounce
      stiffness: 400, // Increased for snappier response
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 5, // Reduced from 10
    willChange: 'opacity, transform',
    transition: { 
      duration: 0.15, // Reduced from 0.2
      ease: 'easeIn'
    }
  }
}

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

export const cardHoverVariants = {
  hover: {
    y: -4,
    willChange: 'transform',
    transition: {
      duration: 0.2, // Reduced from 0.3
      ease: [0.19, 1, 0.22, 1]
    }
  },
  rest: {
    y: 0,
    willChange: 'auto',
    transition: {
      duration: 0.2
    }
  }
}

export const buttonHoverVariants = {
  hover: {
    scale: 1.02,
    y: -2,
    willChange: 'transform',
    transition: {
      duration: 0.15, // Reduced from 0.2
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1
    }
  },
  rest: {
    scale: 1,
    y: 0,
    willChange: 'auto'
  }
}

export const dropdownItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2
    }
  })
}
