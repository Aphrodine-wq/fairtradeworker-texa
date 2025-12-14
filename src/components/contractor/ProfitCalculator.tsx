/**
 * Profit Calculator
 * Additional Pro Feature - Real-time margin preview during bidding
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator,
  TrendingUp
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"

interface ProfitCalculatorProps {
  user: User
  job?: Job
  bidAmount?: number
}

export function ProfitCalculator({ user, job, bidAmount: initialBid }: ProfitCalculatorProps) {
  const isPro = user.isPro || false
  const [bidAmount, setBidAmount] = useState<number>(initialBid || job?.aiScope.priceLow || 0)
  const [materials, setMaterials] = useState<number>(0)
  const [laborHours, setLaborHours] = useState<number>(0)
  const [laborRate, setLaborRate] = useState<number>(75) // $75/hr default
  const [overhead, setOverhead] = useState<number>(15) // 15% default

  const laborCost = laborHours * laborRate
  const totalCost = materials + laborCost
  const overheadCost = (totalCost * overhead) / 100
  const totalExpenses = totalCost + overheadCost
  const grossMargin = bidAmount - totalExpenses
  const marginPercent = bidAmount > 0 ? (grossMargin / bidAmount) * 100 : 0
  const netProfit = grossMargin
  const hourlyRate = laborHours > 0 ? netProfit / laborHours : 0

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator weight="duotone" size={24} />
            Profit Calculator
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to calculate profit margins in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator weight="duotone" size={24} />
          Profit Calculator
        </CardTitle>
        <CardDescription>
          Real-time margin calculation while creating your bid
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bid-amount">Bid Amount</Label>
            <Input
              id="bid-amount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="materials">Materials Cost</Label>
            <Input
              id="materials"
              type="number"
              value={materials}
              onChange={(e) => setMaterials(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="labor-hours">Labor Hours</Label>
            <Input
              id="labor-hours"
              type="number"
              value={laborHours}
              onChange={(e) => setLaborHours(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="labor-rate">Labor Rate ($/hr)</Label>
            <Input
              id="labor-rate"
              type="number"
              value={laborRate}
              onChange={(e) => setLaborRate(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="overhead">Overhead %</Label>
            <Input
              id="overhead"
              type="number"
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="p-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white">Bid Amount</span>
              <span className="font-bold text-black dark:text-white">${bidAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white">Materials</span>
              <span className="text-black dark:text-white">-${materials.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white">Labor ({laborHours}hrs × ${laborRate})</span>
              <span className="text-black dark:text-white">-${laborCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white">Overhead ({overhead}%)</span>
              <span className="text-black dark:text-white">-${overheadCost.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-black dark:border-white pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-black dark:text-white">Net Profit</span>
                <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">Margin</span>
                <Badge variant={marginPercent >= 20 ? 'default' : marginPercent >= 10 ? 'secondary' : 'destructive'}>
                  {marginPercent.toFixed(1)}%
                </Badge>
              </div>
              {laborHours > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-black dark:text-white flex items-center gap-1">
                    <TrendingUp size={14} />
                    Equivalent Hourly Rate
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    ${hourlyRate.toFixed(2)}/hr
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {netProfit < 0 && (
          <div className="p-4 border-2 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-950">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              ⚠️ This bid results in a loss. Consider adjusting your bid amount or reducing costs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
