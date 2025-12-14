import { CheckCircle, Warning, SealCheck } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ConfidenceScoreProps {
  score: number
  detectedObjects?: string[]
  showDetails?: boolean
}

export function ConfidenceScore({ score, detectedObjects, showDetails = false }: ConfidenceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-orange-600'
  }
  
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-300'
    if (score >= 70) return 'bg-yellow-100 border-yellow-300'
    return 'bg-orange-100 border-orange-300'
  }
  
  const getIcon = (score: number) => {
    if (score >= 90) return <SealCheck weight="fill" size={20} />
    if (score >= 70) return <CheckCircle weight="fill" size={20} />
    return <Warning weight="fill" size={20} />
  }
  
  const getLabel = (score: number) => {
    if (score >= 90) return 'Verified Scope'
    if (score >= 70) return 'High Confidence'
    return 'Moderate Confidence'
  }
  
  return (
    <div className="space-y-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getScoreBg(score)}`}
      >
        <span className={getScoreColor(score)}>
          {getIcon(score)}
        </span>
        <div>
          <p className={`text-sm font-semibold ${getScoreColor(score)}`}>
            {getLabel(score)}
          </p>
          <p className={`text-xs ${getScoreColor(score)}`}>
            {score}% confidence
          </p>
        </div>
      </motion.div>
      
      {showDetails && detectedObjects && detectedObjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 bg-muted/30 rounded-lg"
        >
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Identified objects:
          </p>
          <div className="flex flex-wrap gap-1">
            {detectedObjects.map((obj, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-background rounded text-xs font-medium"
              >
                {obj}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      
      {score >= 90 && (
        <p className="text-xs text-muted-foreground">
          ✓ AI analysis highly confident. Contractors/Subcontractors trust these estimates.
        </p>
      )}
      
      {score < 70 && (
        <p className="text-xs text-muted-foreground">
          💡 Consider requesting a Pro Assessment for more accurate scoping
        </p>
      )}
    </div>
  )
}
