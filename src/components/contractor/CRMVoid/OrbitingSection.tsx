import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Lock, Crown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type SectionId = 
  | 'business-tools'
  | 'kanban'
  | 'pro-tools'
  | 'customers'
  | 'ai-insights'
  | 'reports'
  | 'customize'
  | 'settings'
  | 'documents'

interface OrbitingSectionProps {
  id: SectionId
  label: string
  icon: ReactNode
  angle: number
  radius: number
  isActive: boolean
  isLocked?: boolean
  isPro?: boolean
  onClick: () => void
  onDragEnd?: (x: number, y: number) => void
  customizable?: boolean
}

export function OrbitingSection({
  id,
  label,
  icon,
  angle,
  radius,
  isActive,
  isLocked = false,
  isPro = false,
  onClick,
  onDragEnd,
  customizable = false
}: OrbitingSectionProps) {
  // Calculate position from angle and radius
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
      }}
      initial={{ x, y, opacity: 0, scale: 0 }}
      animate={{ 
        x, 
        y, 
        opacity: 1, 
        scale: 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        delay: angle / 360 * 0.5
      }}
      drag={customizable}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (onDragEnd) {
          onDragEnd(info.point.x, info.point.y)
        }
      }}
    >
      <motion.button
        onClick={onClick}
        disabled={isLocked && !isPro}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-20 h-20 -ml-10 -mt-10 rounded-lg",
          "transition-all duration-300",
<<<<<<< Updated upstream
          "border backdrop-blur-sm",
          isActive 
            ? "bg-primary/20 border-primary shadow-lg shadow-primary/20" 
            : "bg-card border-border hover:bg-muted hover:border-primary/50",
=======
          "border-2",
          isActive 
            ? "bg-black dark:bg-white border-black dark:border-white shadow-lg" 
            : "bg-white dark:bg-black border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
>>>>>>> Stashed changes
          isLocked && !isPro && "opacity-50 cursor-not-allowed",
          customizable && "cursor-grab active:cursor-grabbing"
        )}
        whileHover={{ scale: isLocked && !isPro ? 1 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Icon */}
        <div className={cn(
          "text-2xl mb-1",
<<<<<<< Updated upstream
          isActive ? "text-primary" : "text-muted-foreground"
=======
          isActive ? "text-white dark:text-black" : "text-black dark:text-white"
>>>>>>> Stashed changes
        )}>
          {icon}
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-[10px] font-medium text-center leading-tight",
<<<<<<< Updated upstream
          isActive ? "text-primary" : "text-muted-foreground"
=======
          isActive ? "text-white dark:text-black" : "text-black dark:text-white"
>>>>>>> Stashed changes
        )}>
          {label}
        </span>

        {/* Lock icon for Pro features */}
        {isLocked && !isPro && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
            <Lock size={10} weight="fill" className="text-muted-foreground" />
          </div>
        )}

        {/* Pro badge */}
        {isLocked && isPro && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Crown size={10} weight="fill" className="text-primary-foreground" />
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <motion.div
<<<<<<< Updated upstream
            className="absolute inset-0 rounded-2xl bg-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
=======
            className="absolute inset-0 rounded-lg border-2 border-black dark:border-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
>>>>>>> Stashed changes
          />
        )}
      </motion.button>

      {/* Connection line to center */}
      <svg
        className="absolute pointer-events-none"
        style={{
          width: Math.abs(x) + 40,
          height: Math.abs(y) + 40,
          left: x < 0 ? x : -20,
          top: y < 0 ? y : -20,
        }}
      >
        <motion.line
          x1={x < 0 ? Math.abs(x) + 20 : 20}
          y1={y < 0 ? Math.abs(y) + 20 : 20}
          x2={x < 0 ? 20 : Math.abs(x) + 20}
          y2={y < 0 ? 20 : Math.abs(y) + 20}
<<<<<<< Updated upstream
          stroke={isActive ? 'rgba(var(--primary), 0.3)' : 'rgba(0, 0, 0, 0.1)'}
          className={cn(isActive ? 'stroke-primary/30' : 'stroke-muted-foreground/10')}
=======
          stroke={isActive ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
          className="dark:stroke-white/30 dark:stroke-white/10"
>>>>>>> Stashed changes
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: angle / 360 * 0.5 }}
        />
      </svg>
    </motion.div>
  )
}

// Preset section configurations
export const DEFAULT_SECTIONS: Array<{
  id: SectionId
  label: string
  angle: number
  requiresPro: boolean
}> = [
  { id: 'business-tools', label: 'Business Tools', angle: 0, requiresPro: false },
  { id: 'kanban', label: 'Kanban', angle: 40, requiresPro: false },
  { id: 'pro-tools', label: 'Pro Tools', angle: 80, requiresPro: true },
  { id: 'customers', label: 'Customers', angle: 120, requiresPro: false },
  { id: 'ai-insights', label: 'AI Insights', angle: 160, requiresPro: false },
  { id: 'reports', label: 'Reports', angle: 200, requiresPro: false },
  { id: 'customize', label: 'Customize', angle: 240, requiresPro: false },
  { id: 'settings', label: 'Settings', angle: 280, requiresPro: false },
  { id: 'documents', label: 'Documents', angle: 320, requiresPro: false },
]
