import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ZoomIn, ZoomOut } from "@phosphor-icons/react"
import type { Territory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CountyMapViewProps {
  counties: Territory[]
  myTerritories: Territory[]
  onTerritoryClick: (territory: Territory) => void
  selectedState?: string
}

/**
 * Simplified map view using a grid-based visualization
 * In production, this would use Leaflet, Mapbox, or Google Maps
 */
export function CountyMapView({
  counties,
  myTerritories,
  onTerritoryClick,
  selectedState,
}: CountyMapViewProps) {
  const [hoveredCounty, setHoveredCounty] = useState<Territory | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  
  const isMyTerritory = (territory: Territory) => {
    return myTerritories.some(t => t.id === territory.id)
  }
  
  const getCountyColor = (county: Territory) => {
    if (isMyTerritory(county)) {
      return 'bg-blue-500 dark:bg-blue-400'
    }
    if (county.status === 'claimed') {
      return 'bg-red-500 dark:bg-red-400'
    }
    return 'bg-green-500 dark:bg-green-400'
  }
  
  // Group counties by state for better visualization
  const countiesByState = counties.reduce((acc, county) => {
    const state = county.stateCode || 'other'
    if (!acc[state]) {
      acc[state] = []
    }
    acc[state].push(county)
    return acc
  }, {} as Record<string, Territory[]>)
  
  // If state filter is active, show only that state
  const displayCounties = selectedState 
    ? countiesByState[selectedState] || []
    : counties
  
  return (
    <Card className="border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Map Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-400" />
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500 dark:bg-red-400" />
              <span className="text-gray-600 dark:text-gray-400">Claimed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500 dark:bg-blue-400" />
              <span className="text-gray-600 dark:text-gray-400">My Territory</span>
            </div>
          </div>
          
          {/* Simplified Grid Map */}
          <div 
            ref={mapRef}
            className="relative w-full h-[600px] border-2 border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"
          >
            {displayCounties.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedState 
                      ? `No counties found in ${selectedState}`
                      : 'No counties to display'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1 p-2 h-full overflow-auto">
                {displayCounties.slice(0, 200).map((county) => {
                  const isAvailable = county.status === 'available' && !isMyTerritory(county)
                  const isMine = isMyTerritory(county)
                  
                  return (
                    <motion.button
                      key={county.id}
                      onClick={() => isAvailable && onTerritoryClick(county)}
                      onMouseEnter={() => setHoveredCounty(county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      disabled={!isAvailable}
                      className={cn(
                        "aspect-square rounded text-xs font-semibold transition-all",
                        "hover:scale-110 hover:z-10 relative",
                        getCountyColor(county),
                        isAvailable && "cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white",
                        !isAvailable && "cursor-not-allowed opacity-60"
                      )}
                      whileHover={isAvailable ? { scale: 1.1 } : undefined}
                      whileTap={isAvailable ? { scale: 0.95 } : undefined}
                      title={`${county.countyName}, ${county.state || ''}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white dark:text-black text-[8px] md:text-[10px] font-bold">
                        {county.countyName.split(' ')[0].substring(0, 3)}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
          
          {/* Hover Tooltip */}
          {hoveredCounty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-lg shadow-xl p-4 min-w-[200px]"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {hoveredCounty.countyName}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">State:</span>
                  <span className="font-semibold">{hoveredCounty.state || 'N/A'}</span>
                </div>
                {hoveredCounty.population && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Population:</span>
                    <span className="font-semibold">{hoveredCounty.population.toLocaleString()}</span>
                  </div>
                )}
                {hoveredCounty.ruralityClassification && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                    <Badge variant="outline" className="text-xs">
                      {hoveredCounty.ruralityClassification}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge 
                    variant={isMyTerritory(hoveredCounty) ? 'default' : hoveredCounty.status === 'available' ? 'outline' : 'secondary'}
                    className="text-xs"
                  >
                    {isMyTerritory(hoveredCounty) ? 'My Territory' : hoveredCounty.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Info Text */}
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            Showing {displayCounties.length} of {counties.length} counties
            {selectedState && ` in ${selectedState}`}
            {displayCounties.length > 200 && ' (showing first 200)'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
