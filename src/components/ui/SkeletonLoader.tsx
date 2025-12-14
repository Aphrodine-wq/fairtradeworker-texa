import { memo } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: number | string
  height?: number | string
  lines?: number
}

export const SkeletonLoader = memo(function SkeletonLoader({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-black/10 dark:bg-white/10"
  
  if (variant === 'card') {
    return (
      <div 
        className={cn("border-2 border-black dark:border-white bg-white dark:bg-black p-6 space-y-4", className)}
        style={{ width, height }}
      >
        <div className={cn(baseClasses, "h-6 w-3/4")} />
        <div className={cn(baseClasses, "h-4 w-full")} />
        <div className={cn(baseClasses, "h-4 w-5/6")} />
        <div className="flex gap-2">
          <div className={cn(baseClasses, "h-8 w-20")} />
          <div className={cn(baseClasses, "h-8 w-24")} />
        </div>
      </div>
    )
  }
  
  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)} style={{ width }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    )
  }
  
  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, "rounded-full", className)}
        style={{ width: width || 40, height: height || 40 }}
      />
    )
  }
  
  return (
    <div
      className={cn(baseClasses, className)}
      style={{ width, height }}
    />
  )
})

export const JobCardSkeleton = memo(function JobCardSkeleton() {
  return (
    <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-black/10 dark:bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-black/10 dark:bg-white/10 w-3/4" />
          <div className="h-4 bg-black/10 dark:bg-white/10 w-full" />
          <div className="h-4 bg-black/10 dark:bg-white/10 w-5/6" />
          <div className="flex gap-2">
            <div className="h-6 bg-black/10 dark:bg-white/10 w-20" />
            <div className="h-6 bg-black/10 dark:bg-white/10 w-24" />
          </div>
        </div>
      </div>
      <div className="border-t-2 border-black dark:border-white pt-4 space-y-2">
        <div className="h-4 bg-black/10 dark:bg-white/10 w-full" />
        <div className="h-4 bg-black/10 dark:bg-white/10 w-4/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-black/10 dark:bg-white/10 flex-1" />
        <div className="h-10 bg-black/10 dark:bg-white/10 w-24" />
      </div>
    </div>
  )
})

export const SkeletonGrid = memo(function SkeletonGrid({ 
  count = 6,
  columns = 3 
}: { 
  count?: number
  columns?: number 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
})
