import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'text' | 'circle' | 'button'
}

export function LoadingSkeleton({ className, variant = 'card' }: LoadingSkeletonProps) {
  const baseClasses = 'bg-muted animate-pulse'
  
  const variantClasses = {
    card: 'h-32 rounded-2xl',
    text: 'h-4 rounded',
    circle: 'h-12 w-12 rounded-full',
    button: 'h-10 rounded-lg px-4 py-2'
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 border rounded-2xl">
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <LoadingSkeleton variant="text" className="w-full" />
      <LoadingSkeleton variant="text" className="w-5/6" />
    </div>
  )
}
