import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-card backdrop-blur-12 border border-border rounded-2xl shadow-sm transition-all duration-200",
        hover && "hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  )
}
