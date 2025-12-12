import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { motion } from "framer-motion"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  animated?: boolean
}

export function GlassCard({ children, className, hover = true, animated = true }: GlassCardProps) {
  if (!animated) {
    return (
      <div 
        className={cn(
          "bg-card backdrop-blur-12 border border-border rounded-2xl shadow-sm transition-all duration-200",
          hover && "hover:shadow-xl hover:-translate-y-1",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div 
      className={cn(
        "bg-card backdrop-blur-12 border border-border rounded-2xl shadow-sm",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? {
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.15 }
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  )
}
