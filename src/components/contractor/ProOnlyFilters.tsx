/**
 * Pro-Only Filters
 * Additional Pro Feature - "Only show jobs from repeat homeowners"
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Funnel,
  Crown
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ProOnlyFiltersProps {
  user: User
  onFiltersChange?: (filters: ProFilters) => void
}

interface ProFilters {
  repeatHomeowners: boolean
  highBudgetOnly: boolean
  verifiedHomeowners: boolean
  noCompetitorBids: boolean
  withinRadius: number
}

export function ProOnlyFilters({ user, onFiltersChange }: ProOnlyFiltersProps) {
  const isPro = user.isPro || false
  const [filters, setFilters] = useState<ProFilters>({
    repeatHomeowners: false,
    highBudgetOnly: false,
    verifiedHomeowners: false,
    noCompetitorBids: false,
    withinRadius: 50
  })

  const updateFilter = (key: keyof ProFilters, value: boolean | number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Funnel weight="duotone" size={24} />
            Pro-Only Filters
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to unlock premium job filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="p-4 border-0 shadow-md hover:shadow-lg opacity-50">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} />
                <span className="font-semibold text-black dark:text-white">Repeat Homeowners Only</span>
              </div>
              <p className="text-xs text-black dark:text-white">Filter to jobs from homeowners who've posted before</p>
            </div>
            <div className="p-4 border-0 shadow-md hover:shadow-lg opacity-50">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} />
                <span className="font-semibold text-black dark:text-white">High Budget Only</span>
              </div>
              <p className="text-xs text-black dark:text-white">Only show jobs above your minimum budget</p>
            </div>
            <div className="p-4 border-0 shadow-md hover:shadow-lg opacity-50">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} />
                <span className="font-semibold text-black dark:text-white">Verified Homeowners</span>
              </div>
              <p className="text-xs text-black dark:text-white">Only show jobs from verified homeowners</p>
            </div>
          </div>
          <Button onClick={() => window.location.href = '/pro-upgrade'} className="w-full">
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown weight="duotone" size={24} />
          Pro-Only Filters
        </CardTitle>
        <CardDescription>
          Exclusive filters for Pro members - get better quality leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 flex items-start gap-3">
            <Checkbox
              checked={filters.repeatHomeowners}
              onCheckedChange={(checked) => updateFilter('repeatHomeowners', checked as boolean)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="repeat" className="font-semibold text-black dark:text-white cursor-pointer">
                  Repeat Homeowners Only
                </Label>
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </div>
              <p className="text-xs text-black dark:text-white">
                Filter to jobs from homeowners who've posted before. These are more likely to convert.
              </p>
            </div>
          </div>

          <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 flex items-start gap-3">
            <Checkbox
              checked={filters.highBudgetOnly}
              onCheckedChange={(checked) => updateFilter('highBudgetOnly', checked as boolean)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="high-budget" className="font-semibold text-black dark:text-white cursor-pointer">
                  High Budget Only
                </Label>
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </div>
              <p className="text-xs text-black dark:text-white">
                Only show jobs above your minimum budget threshold.
              </p>
            </div>
          </div>

          <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 flex items-start gap-3">
            <Checkbox
              checked={filters.verifiedHomeowners}
              onCheckedChange={(checked) => updateFilter('verifiedHomeowners', checked as boolean)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="verified" className="font-semibold text-black dark:text-white cursor-pointer">
                  Verified Homeowners Only
                </Label>
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </div>
              <p className="text-xs text-black dark:text-white">
                Only show jobs from verified homeowners who've completed jobs before.
              </p>
            </div>
          </div>

          <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 flex items-start gap-3">
            <Checkbox
              checked={filters.noCompetitorBids}
              onCheckedChange={(checked) => updateFilter('noCompetitorBids', checked as boolean)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="no-bids" className="font-semibold text-black dark:text-white cursor-pointer">
                  No Competitor Bids Yet
                </Label>
                <Badge variant="outline" className="text-xs">PRO</Badge>
              </div>
              <p className="text-xs text-black dark:text-white">
                Only show jobs that don't have any bids yet. Be the first!
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-0 shadow-md hover:shadow-lg bg-white dark:bg-black">
          <p className="text-sm font-semibold text-black dark:text-white mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.repeatHomeowners && <Badge>Repeat Homeowners</Badge>}
            {filters.highBudgetOnly && <Badge>High Budget</Badge>}
            {filters.verifiedHomeowners && <Badge>Verified Only</Badge>}
            {filters.noCompetitorBids && <Badge>No Bids Yet</Badge>}
            {!filters.repeatHomeowners && !filters.highBudgetOnly && !filters.verifiedHomeowners && !filters.noCompetitorBids && (
              <span className="text-sm text-black dark:text-white opacity-70">No filters active</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
