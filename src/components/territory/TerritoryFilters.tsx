import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MagnifyingGlass, Funnel } from "@phosphor-icons/react"
import type { TerritoryFilter, RuralityTier } from "@/lib/types"
import { US_STATES } from "@/lib/data/counties"
import { cn } from "@/lib/utils"

interface TerritoryFiltersProps {
  filters: TerritoryFilter
  onFiltersChange: (filters: TerritoryFilter) => void
}

const RURALITY_OPTIONS: Array<{ value: RuralityTier; label: string }> = [
  { value: 'rural', label: 'Rural (<50K)' },
  { value: 'small', label: 'Small (50K-150K)' },
  { value: 'medium', label: 'Medium (150K-500K)' },
  { value: 'metro', label: 'Metro (>500K)' },
]

export function TerritoryFilters({ filters, onFiltersChange }: TerritoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasActiveFilters = 
    !!filters.state || 
    (filters.rurality && filters.rurality.length > 0) ||
    filters.populationMin !== undefined ||
    filters.populationMax !== undefined ||
    !!filters.search
  
  const handleStateChange = (stateCode: string) => {
    onFiltersChange({
      ...filters,
      state: stateCode === 'all' ? undefined : stateCode,
    })
  }
  
  const handleRuralityToggle = (rurality: RuralityTier) => {
    const current = filters.rurality || []
    const updated = current.includes(rurality)
      ? current.filter(r => r !== rurality)
      : [...current, rurality]
    
    onFiltersChange({
      ...filters,
      rurality: updated.length > 0 ? updated : undefined,
    })
  }
  
  const handlePopulationMinChange = (value: string) => {
    const num = value ? parseInt(value, 10) : undefined
    onFiltersChange({
      ...filters,
      populationMin: num && !isNaN(num) ? num : undefined,
    })
  }
  
  const handlePopulationMaxChange = (value: string) => {
    const num = value ? parseInt(value, 10) : undefined
    onFiltersChange({
      ...filters,
      populationMax: num && !isNaN(num) ? num : undefined,
    })
  }
  
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    })
  }
  
  const clearFilters = () => {
    onFiltersChange({})
  }
  
  const removeFilter = (key: keyof TerritoryFilter) => {
    const updated = { ...filters }
    delete updated[key]
    onFiltersChange(updated)
  }
  
  return (
    <Card className="border-0">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar (Always Visible) */}
          <div className="relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <Input
              placeholder="Search by county name or FIPS code..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* State Selector */}
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.state || 'all'}
                onValueChange={handleStateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {US_STATES.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Expand/Collapse Button */}
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Funnel size={16} />
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </Button>
            
            {/* Clear All */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-600 dark:text-gray-400"
              >
                Clear All
              </Button>
            )}
          </div>
          
          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              {/* Rurality Checkboxes */}
              <div>
                <Label className="mb-2 block">Rurality Classification</Label>
                <div className="flex flex-wrap gap-2">
                  {RURALITY_OPTIONS.map(option => {
                    const isSelected = filters.rurality?.includes(option.value) || false
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleRuralityToggle(option.value)}
                        className={cn(
                          "px-3 py-1 rounded-md text-sm transition-all",
                          isSelected
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white"
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Population Range */}
              <div>
                <Label className="mb-2 block">Population Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.populationMin || ''}
                    onChange={(e) => handlePopulationMinChange(e.target.value)}
                    className="flex-1"
                  />
                  <span className="self-center text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.populationMax || ''}
                    onChange={(e) => handlePopulationMaxChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.state && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  State: {US_STATES.find(s => s.code === filters.state)?.name || filters.state}
                  <button
                    onClick={() => removeFilter('state')}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {filters.rurality && filters.rurality.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Rurality: {filters.rurality.length} selected
                  <button
                    onClick={() => removeFilter('rurality')}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {(filters.populationMin !== undefined || filters.populationMax !== undefined) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Population: {filters.populationMin || 0} - {filters.populationMax || '∞'}
                  <button
                    onClick={() => {
                      removeFilter('populationMin')
                      removeFilter('populationMax')
                    }}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <button
                    onClick={() => removeFilter('search')}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
