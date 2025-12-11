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
        "bg-card backdrop-blur-12 border border-border rounded-2xl shadow-sm transition-all duration-300",
        hover && "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  )
}
