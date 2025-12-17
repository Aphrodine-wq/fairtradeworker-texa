import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { motion } from "framer-motion"
import { universalCardHover } from "@/lib/animations"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  animated?: boolean
  blueAccent?: boolean
}

export function GlassCard({ children, className, hover = true, animated = true, blueAccent = false }: GlassCardProps) {
  if (!animated) {
    return (
      <div 
        className={cn(
          "glass rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden group",
          hover && "hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1",
          className
        )}
      >
        {blueAccent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        {children}
      </div>
    )
  }

  return (
    <motion.div 
      className={cn(
        "glass rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8
      }}
      variants={hover ? universalCardHover : undefined}
      whileHover={hover ? "hover" : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      style={{ willChange: hover ? 'transform, box-shadow' : 'auto' }}
    >
      {blueAccent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      {children}
    </motion.div>
  )
}
