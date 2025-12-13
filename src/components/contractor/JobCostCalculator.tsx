import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  CurrencyDollar, 
  Clock, 
  Package, 
  TrendUp, 
  TrendDown,
  Calculator,
  CheckCircle
} from "@phosphor-icons/react"
import { toast } from "sonner"

interface CostBreakdown {
  laborCost: number
  materialsCost: number
  overhead: number
  totalCost: number
  profit: number
  profitMargin: number
  effectiveHourlyRate: number
}

export function JobCostCalculator() {
  const [bidAmount, setBidAmount] = useState<string>("")
  const [estimatedHours, setEstimatedHours] = useState<string>("")
  const [materialsCost, setMaterialsCost] = useState<string>("")
  const [overheadPercent, setOverheadPercent] = useState<string>("15")

  const breakdown = useMemo((): CostBreakdown | null => {
    const bid = parseFloat(bidAmount)
    const hours = parseFloat(estimatedHours)
    const materials = parseFloat(materialsCost)
    const overhead = parseFloat(overheadPercent)

    if (isNaN(bid) || isNaN(hours) || isNaN(materials) || isNaN(overhead)) {
      return null
    }

    if (bid <= 0 || hours <= 0 || materials < 0 || overhead < 0) {
      return null
    }

    const overheadCost = (bid * overhead) / 100
    const totalCost = materials + overheadCost
    const profit = bid - totalCost
    const profitMargin = (profit / bid) * 100
    const laborCost = profit
    const effectiveHourlyRate = laborCost / hours

    return {
      laborCost,
      materialsCost: materials,
      overhead: overheadCost,
      totalCost,
      profit,
      profitMargin,
      effectiveHourlyRate
    }
  }, [bidAmount, estimatedHours, materialsCost, overheadPercent])

  const handleSaveQuickRef = () => {
    if (breakdown) {
      const saved = {
        bidAmount: parseFloat(bidAmount),
        hours: parseFloat(estimatedHours),
        materials: parseFloat(materialsCost),
        effectiveRate: breakdown.effectiveHourlyRate,
        margin: breakdown.profitMargin,
        timestamp: new Date().toISOString()
      }
      
      const existing = localStorage.getItem('recentCalculations') || '[]'
      const calcs = JSON.parse(existing)
      calcs.unshift(saved)
      localStorage.setItem('recentCalculations', JSON.stringify(calcs.slice(0, 10)))
      
      toast.success("Calculation saved for quick reference!")
    }
  }

  const getProfitQuality = (margin: number) => {
    if (margin >= 40) return { text: "Excellent", color: "bg-green-500", icon: TrendUp }
    if (margin >= 25) return { text: "Good", color: "bg-blue-500", icon: TrendUp }
    if (margin >= 15) return { text: "Fair", color: "bg-yellow-500", icon: TrendUp }
    return { text: "Low", color: "bg-red-500", icon: TrendDown }
  }

  const getHourlyRateQuality = (rate: number) => {
    if (rate >= 100) return { text: "Excellent", color: "text-green-500" }
    if (rate >= 60) return { text: "Good", color: "text-blue-500" }
    if (rate >= 40) return { text: "Fair", color: "text-yellow-500" }
    return { text: "Low", color: "text-red-500" }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Calculator weight="fill" className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Job Cost Calculator</h2>
            <p className="text-sm text-muted-foreground">
              Calculate your profit margin and effective hourly rate
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="flex items-center gap-2">
              <CurrencyDollar size={16} />
              Bid Amount
            </Label>
            <Input
              id="bidAmount"
              type="number"
              placeholder="500"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours" className="flex items-center gap-2">
              <Clock size={16} />
              Estimated Hours
            </Label>
            <Input
              id="estimatedHours"
              type="number"
              placeholder="4"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialsCost" className="flex items-center gap-2">
              <Package size={16} />
              Materials Cost
            </Label>
            <Input
              id="materialsCost"
              type="number"
              placeholder="150"
              value={materialsCost}
              onChange={(e) => setMaterialsCost(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overheadPercent" className="flex items-center gap-2">
              <TrendUp size={16} />
              Overhead % (gas, insurance, etc.)
            </Label>
            <Input
              id="overheadPercent"
              type="number"
              placeholder="15"
              value={overheadPercent}
              onChange={(e) => setOverheadPercent(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>
      </Card>

      {breakdown && (
        <Card className="p-6 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Cost Breakdown</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSaveQuickRef}
            >
              <CheckCircle size={16} className="mr-2" />
              Save for Reference
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Materials</p>
              <p className="text-2xl font-bold">
                ${breakdown.materialsCost.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overhead ({overheadPercent}%)</p>
              <p className="text-2xl font-bold">
                ${breakdown.overhead.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-red-500">
                ${breakdown.totalCost.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Your Labor Pay</p>
              <p className="text-2xl font-bold text-green-500">
                ${breakdown.profit.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
                <p className="text-3xl font-bold">{breakdown.profitMargin.toFixed(1)}%</p>
              </div>
              <Badge 
                className={`${getProfitQuality(breakdown.profitMargin).color} text-white px-3 py-1`}
              >
                {getProfitQuality(breakdown.profitMargin).text}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Effective Hourly Rate</p>
                <p className="text-3xl font-bold">
                  ${breakdown.effectiveHourlyRate.toFixed(2)}/hr
                </p>
              </div>
              <Badge 
                variant="outline"
                className={`${getHourlyRateQuality(breakdown.effectiveHourlyRate).color} px-3 py-1 border-current`}
              >
                {getHourlyRateQuality(breakdown.effectiveHourlyRate).text}
              </Badge>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Tip:</strong> Industry standard margins are 25-40%. 
              If your margin is below 20%, consider increasing your bid or reducing costs.
              Target at least $50-75/hr for skilled trades.
            </p>
          </div>
        </Card>
      )}

      {!breakdown && (
        <Card className="p-12 text-center border-dashed border-2">
          <Calculator size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Enter your job details above to see the cost breakdown
          </p>
        </Card>
      )}
    </div>
  )
}
