/**
 * VOID Sales Window - Sales and deals management
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, DollarSign, Calendar } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Deal {
  id: string
  name: string
  customer: string
  value: number
  stage: 'lead' | 'contacted' | 'quote' | 'negotiation' | 'won' | 'lost'
  probability: number
  closeDate: string
}

export function SalesWindow() {
  const [selectedView, setSelectedView] = useState<'deals' | 'quotes' | 'reports'>('deals')

  // Mock data
  const deals: Deal[] = [
    {
      id: '1',
      name: 'Kitchen Remodel - Smith',
      customer: 'John Smith',
      value: 45000,
      stage: 'negotiation',
      probability: 75,
      closeDate: '2025-01-15',
    },
    {
      id: '2',
      name: 'Bathroom Renovation - Johnson',
      customer: 'Sarah Johnson',
      value: 28000,
      stage: 'quote',
      probability: 60,
      closeDate: '2025-01-20',
    },
    {
      id: '3',
      name: 'Deck Installation - Davis',
      customer: 'Mike Davis',
      value: 15000,
      stage: 'won',
      probability: 100,
      closeDate: '2025-01-10',
    },
  ]

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, deal) => sum + deal.value, 0)
  const forecastedValue = deals
    .filter(d => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-[#00f0ff] text-black',
      contacted: 'bg-[#8b5cf6] text-white',
      quote: 'bg-[#f59e0b] text-white',
      negotiation: 'bg-[#f59e0b] text-white',
      won: 'bg-[#10b981] text-white',
      lost: 'bg-gray-600 text-white',
    }
    return colors[stage] || 'bg-gray-500 text-white'
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Sales</h2>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Total Value: </span>
                <span className="text-[#00f0ff] font-bold">${totalValue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Won: </span>
                <span className="text-[#10b981] font-bold">${wonValue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Forecasted: </span>
                <span className="text-[#8b5cf6] font-bold">${forecastedValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
          >
            <Plus size={16} className="mr-2" />
            New Deal
          </Button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          {(['deals', 'quotes', 'reports'] as const).map(view => (
            <Button
              key={view}
              variant={selectedView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView(view)}
              className={cn(
                selectedView === view
                  ? 'bg-[#00f0ff] text-black'
                  : 'border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10',
                'capitalize'
              )}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {selectedView === 'deals' && (
          <div className="space-y-3">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border border-[#00f0ff]/20 bg-black/30",
                  "hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 transition-all cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{deal.name}</h3>
                      <Badge className={cn("text-xs", getStageColor(deal.stage))}>
                        {deal.stage}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#00f0ff] text-[#00f0ff]">
                        {deal.probability}% probability
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{deal.customer}</span>
                      <span>•</span>
                      <span>Close: {deal.closeDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#00f0ff]">
                      ${deal.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Deal Value</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${deal.probability}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedView === 'quotes' && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Quotes view coming soon</p>
          </div>
        )}

        {selectedView === 'reports' && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Reports view coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
