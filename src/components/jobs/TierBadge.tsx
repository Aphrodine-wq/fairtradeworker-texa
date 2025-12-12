import { getTierBadge, type JobTier } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface TierBadgeProps {
  tier: JobTier
  showRange?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tier, showRange = true, size = 'md' }: TierBadgeProps) {
  const badge = getTierBadge(tier)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`${badge.color} font-medium border-current ${sizeClasses[size]}`}
    >
      <span className="mr-1">{badge.emoji}</span>
      {badge.label}
      {showRange && <span className="ml-1 opacity-70">— {badge.range}</span>}
    </Badge>
  )
}
