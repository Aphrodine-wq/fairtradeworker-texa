import { Card } from '@/components/ui/card'
import { calculateBidIntelligence } from '@/lib/competitiveAdvantage'
import { ChartBar, TrendUp, Clock, Target } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface BidIntelligenceProps {
  jobCategory: string
  jobPriceLow: number
  jobPriceHigh: number
  contractorWinRate?: number
}

export function BidIntelligence({
  jobCategory,
  jobPriceLow,
  jobPriceHigh,
  contractorWinRate,
}: BidIntelligenceProps) {
  const intelligence = calculateBidIntelligence(
    jobCategory,
    jobPriceLow,
    jobPriceHigh,
    contractorWinRate
  )
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <ChartBar className="text-primary" size={20} weight="bold" />
        <h3 className="text-sm font-semibold">Bid Intelligence</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
        >
          <div className="flex items-center gap-1 mb-1">
            <Target size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Similar jobs</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            ${intelligence.similarJobsRange.low}-{intelligence.similarJobsRange.high}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
        >
          <div className="flex items-center gap-1 mb-1">
            <TrendUp size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Your win rate</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {(intelligence.yourWinRate * 100).toFixed(0)}%
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 p-3 bg-black dark:bg-white text-white dark:text-black rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] font-mono"
        >
          <div className="flex items-center gap-1 mb-1">
            <Clock size={14} className="text-primary" />
            <p className="text-xs text-primary font-medium">Best time to bid</p>
          </div>
          <p className="text-sm font-bold text-primary">
            {intelligence.optimalBidTime} 
            <span className="text-xs ml-1 font-normal">
              (+{(intelligence.optimalBidTimeBoost * 100).toFixed(0)}% win rate)
            </span>
          </p>
        </motion.div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Bids submitted before 9am have a {(intelligence.optimalBidTimeBoost * 100).toFixed(0)}% higher win rate
        </p>
      </div>
    </Card>
  )
}
