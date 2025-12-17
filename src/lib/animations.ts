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
      staggerChildren: 0.1, // Increased for smoother cascade
      delayChildren: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] // Smooth easing
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
      stiffness: 300, // Reduced for smoother motion
      damping: 30, // Maintained for controlled motion
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

// Morph animation variants for Post My Job button
// Optimized for 60fps with GPU acceleration - no layoutId, only transform/opacity
export const morphVariants = {
  initial: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    willChange: 'transform, opacity',
    transform: 'translateZ(0)' // Force GPU acceleration
  },
  morphing: {
    scale: 0.8,
    opacity: 0.7,
    rotate: 5,
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.6
    }
  },
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -10,
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    transition: {
      duration: 0.15, // Faster exit
      ease: [0.4, 0, 0.2, 1] // Smooth ease
    }
  }
}

// Pulse and glow variants for enhanced Post a Job button
export const pulseGlowVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
    willChange: 'transform, box-shadow'
  },
  hover: {
    scale: 1.05,
    boxShadow: [
      '0 0 20px rgba(0, 0, 0, 0.3)',
      '0 0 40px rgba(0, 0, 0, 0.2)',
      '0 0 20px rgba(0, 0, 0, 0.3)'
    ],
    transition: {
      scale: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        mass: 0.5
      },
      boxShadow: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    willChange: 'transform, box-shadow'
  },
  tap: {
    scale: 0.95,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.4)',
    transition: {
      duration: 0.1
    },
    willChange: 'transform, box-shadow'
  }
}

// Universal card hover variant - smooth and consistent
export const universalCardHover = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    willChange: 'transform, box-shadow'
  },
  hover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8
    },
    willChange: 'transform, box-shadow'
  }
}

// Universal button hover variant - enhanced smooth animations
export const universalButtonHover = {
  rest: {
    scale: 1,
    y: 0,
    willChange: 'transform'
  },
  hover: {
    scale: 1.03,
    y: -3,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
      mass: 0.5
    },
    willChange: 'transform'
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: {
      duration: 0.1
    },
    willChange: 'transform'
  }
}

// Staggered grid entrance for 2x2 button grid
// Optimized with reduced delays for faster animation
export const staggerGridVariants = {
  hidden: { 
    opacity: 0,
    willChange: 'opacity'
  },
  visible: {
    opacity: 1,
    willChange: 'auto',
    transition: {
      staggerChildren: 0.05, // Reduced from 0.1 for faster animation
      delayChildren: 0.05, // Reduced from 0.2
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Grid item variants - optimized spring physics for smooth 60fps
export const gridItemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, // Less dramatic scale for smoother animation
    y: 10, // Reduced from 20 for less movement
    willChange: 'opacity, transform',
    transform: 'translateZ(0)' // GPU acceleration
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    willChange: 'auto',
    transform: 'translateZ(0)',
    transition: {
      type: "spring",
      stiffness: 500, // Increased for snappier response
      damping: 35, // Increased for less bounce, smoother motion
      mass: 0.5 // Reduced mass for faster response
    }
  }
}
