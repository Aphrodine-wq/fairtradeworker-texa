import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle, Users } from "@phosphor-icons/react"
import { itemVariants, universalCardHover } from "@/lib/animations"
import type { Territory } from "@/lib/types"
import { getPricingTierLabel } from "@/lib/territory/pricing"
import { cn } from "@/lib/utils"

interface CountyListViewProps {
  counties: Territory[]
  myTerritories: Territory[]
  onTerritoryClick: (territory: Territory) => void
}

export function CountyListView({ 
  counties, 
  myTerritories, 
  onTerritoryClick 
}: CountyListViewProps) {
  const isMyTerritory = (territory: Territory) => {
    return myTerritories.some(t => t.id === territory.id)
  }
  
  const getTerritoryStatus = (territory: Territory) => {
    if (isMyTerritory(territory)) {
      return { label: 'My Territory', variant: 'default' as const, color: 'text-blue-600 dark:text-blue-400' }
    }
    if (territory.status === 'claimed') {
      return { label: 'Claimed', variant: 'secondary' as const, color: 'text-gray-600 dark:text-gray-400' }
    }
    return { label: 'Available', variant: 'outline' as const, color: 'text-green-600 dark:text-green-400' }
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {counties.map((county, index) => {
        const status = getTerritoryStatus(county)
        const isAvailable = county.status === 'available' && !isMyTerritory(county)
        
        return (
          <motion.div
            key={county.id}
            variants={itemVariants}
            custom={index}
            whileHover={isAvailable ? universalCardHover.hover : undefined}
            whileTap={isAvailable ? { scale: 0.98 } : undefined}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            <Card
              className={cn(
                "cursor-pointer h-full border-0 transition-shadow",
                isAvailable && "hover:shadow-xl",
                isMyTerritory(county) && "ring-2 ring-blue-500 dark:ring-blue-400"
              )}
              onClick={() => isAvailable && onTerritoryClick(county)}
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {county.countyName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {county.state || 'Unknown State'}
                      </p>
                    </div>
                    <MapPin 
                      size={20} 
                      className={cn(
                        "shrink-0",
                        isMyTerritory(county) ? "text-blue-600 dark:text-blue-400" :
                        isAvailable ? "text-green-600 dark:text-green-400" :
                        "text-gray-400"
                      )}
                      weight={isMyTerritory(county) ? "fill" : "regular"}
                    />
                  </div>
                  
                  {/* Status Badge */}
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                  
                  {/* Details */}
                  {county.population && (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Population:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {county.population.toLocaleString()}
                        </span>
                      </div>
                      {county.ruralityClassification && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {getPricingTierLabel(county.ruralityClassification)}
                          </span>
                        </div>
                      )}
                      {county.projectedJobOutput && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Projected Jobs:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {county.projectedJobOutput.toLocaleString()}/yr
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Pricing Preview (if available) */}
                  {isAvailable && county.oneTimeFee !== undefined && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {county.isFirst300Free ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            FREE - First 300
                          </span>
                        ) : (
                          <>
                            ${county.oneTimeFee?.toLocaleString()} one-time
                            {county.monthlyFee && (
                              <> + ${county.monthlyFee}/mo</>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
      
      {counties.length === 0 && (
        <div className="col-span-full text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No counties match your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}
