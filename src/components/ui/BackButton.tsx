import { ArrowLeft } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"

interface BackButtonProps {
  onClick?: () => void
  onNavigate?: (page: string) => void
  defaultPage?: string
  label?: string
  className?: string
}

export function BackButton({ 
  onClick, 
  onNavigate, 
  defaultPage = 'home',
  label = "Back", 
  className = "" 
}: BackButtonProps) {
  const handleBack = useCallback(() => {
    if (onClick) {
      onClick()
    } else if (onNavigate) {
      onNavigate(defaultPage)
    } else {
      // Fallback to browser history
      if (window.history.length > 1) {
        window.history.back()
      }
    }
  }, [onClick, onNavigate, defaultPage])

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`flex items-center gap-2 text-black dark:text-white hover:bg-white dark:hover:bg-black ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={20} weight="bold" />
      <span>{label}</span>
    </Button>
  )
}
