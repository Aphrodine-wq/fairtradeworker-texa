import { Lightning, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface LightningBadgeProps {
  responseTimeMinutes: number
  position?: number
}

export function LightningBadge({ responseTimeMinutes, position }: LightningBadgeProps) {
  if (responseTimeMinutes > 10) return null
  
  const isTop3 = position !== undefined && position <= 3
  
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
        isTop3
          ? 'bg-yellow-400 text-yellow-900'
          : 'bg-primary/20 text-primary'
      }`}
    >
      <Lightning weight="fill" size={14} />
      <span>{Math.round(responseTimeMinutes)}min</span>
      {isTop3 && <span>• Top 3</span>}
    </motion.div>
  )
}

interface ResponseTimeBadgeProps {
  averageResponseMinutes: number | undefined
}

export function ResponseTimeBadge({ averageResponseMinutes }: ResponseTimeBadgeProps) {
  if (!averageResponseMinutes) return null
  
  if (averageResponseMinutes < 15) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <Lightning weight="fill" size={12} />
        <span>Fast responder</span>
      </div>
    )
  }
  
  if (averageResponseMinutes < 30) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
        <Clock weight="fill" size={12} />
        <span>Quick responder</span>
      </div>
    )
  }
  
  return null
}
