import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function BackButton({ onClick, label = "Back", className }: BackButtonProps) {
  return (
    <motion.div
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
    <Button
      variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn("gap-2 group", className)}
      >
        <motion.div
          animate={{ x: [0, -2, 0] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
    >
          <ArrowLeft size={18} weight="bold" className="group-hover:text-primary transition-colors" />
        </motion.div>
        <span className="font-medium">{label}</span>
    </Button>
    </motion.div>
  )
}