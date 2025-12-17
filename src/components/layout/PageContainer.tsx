import { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends ComponentProps<'div'> {
  children: ReactNode
  className?: string
}

/**
 * Standardized page container component for consistent page widths across the platform
 * Uses max-w-7xl to match homepage and ensure visual consistency
 */
export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
