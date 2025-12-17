import { ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  onClick: () => void
  label?: string
  className?: string
  variant?: "default" | "ghost" | "outline"
}

export function BackButton({ 
  onClick, 
  label = "Back",
  className,
  variant = "ghost"
}: BackButtonProps) {
  return (
    <motion.div
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Button
        variant={variant}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 font-medium transition-all",
          "hover:gap-3",
          className
        )}
      >
        <ArrowLeft size={18} weight="bold" />
        <span>{label}</span>
      </Button>
    </motion.div>
  )
}