import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapTrifold, List, MapPin } from "@phosphor-icons/react"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
import type { User, Territory, TerritoryView, TerritoryFilter } from "@/lib/types"
import { useState, useEffect, useMemo } from "react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { TerritoryFilters } from "@/components/territory/TerritoryFilters"
import { CountyMapView } from "@/components/territory/CountyMapView"
import { CountyListView } from "@/components/territory/CountyListView"
import { ClaimTerritoryModal } from "@/components/territory/ClaimTerritoryModal"
import { TerritoryStats } from "@/components/territory/TerritoryStats"
import { generateInitialCounties, searchCounties } from "@/lib/data/counties"
import { migrateTerritoriesData } from "@/lib/territory/migration"
import { toast } from "sonner"

interface TerritoryClaimProps {
  user?: User | null
  onNavigate: (page: string) => void
}

export function TerritoryClaim({ user, onNavigate }: TerritoryClaimProps) {
  const [view, setView] = useState<TerritoryView>('map')
  const [filters, setFilters] = useState<TerritoryFilter>({})
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  
  // Load territories from localStorage (backward compatible)
  const [territories, setTerritories] = useKV<Territory[]>("territories", [])
  
  // Initialize counties data
  useEffect(() => {
    // Migrate existing territories to new format
    if (territories && territories.length > 0) {
      const migrated = migrateTerritoriesData(territories)
      if (migrated !== territories) {
        setTerritories(migrated)
      }
    }
    
    // Generate initial county data if not exists
    // In production, this would load from Supabase
    if (!territories || territories.length === 0) {
      const initialCounties = generateInitialCounties()
      setTerritories(initialCounties)
    }
  }, [])
  
  // Get all counties (merge existing territories with generated counties)
  const allCounties = useMemo(() => {
    const existing = territories || []
    const generated = generateInitialCounties()
    
    // Merge: use existing if found by id, otherwise use generated
    const merged = new Map<number, Territory>()
    
    // Add generated counties first
    generated.forEach(county => {
      merged.set(county.id, county)
    })
    
    // Override with existing territories (preserves claims, etc.)
    existing.forEach(territory => {
      merged.set(territory.id, territory)
    })
    
    return Array.from(merged.values())
  }, [territories])
  
  // Apply filters
  const filteredCounties = useMemo(() => {
    let filtered = allCounties
    
    // State filter
    if (filters.state) {
      filtered = filtered.filter(c => c.stateCode === filters.state)
    }
    
    // Rurality filter
    if (filters.rurality && filters.rurality.length > 0) {
      filtered = filtered.filter(c => 
        c.ruralityClassification && filters.rurality!.includes(c.ruralityClassification)
      )
    }
    
    // Population range filter
    if (filters.populationMin !== undefined) {
      filtered = filtered.filter(c => (c.population || 0) >= filters.populationMin!)
    }
    if (filters.populationMax !== undefined) {
      filtered = filtered.filter(c => (c.population || 0) <= filters.populationMax!)
    }
    
    // Search filter
    if (filters.search) {
      filtered = searchCounties(filtered, filters.search)
    }
    
    return filtered
  }, [allCounties, filters])
  
  // Get user's territories
  const myTerritories = useMemo(() => {
    if (!user) return []
    return allCounties.filter(t => 
      t.operatorId === user.id || t.claimedBy === user.id
    )
  }, [allCounties, user])
  
  // Get available territories
  const availableTerritories = useMemo(() => {
    return filteredCounties.filter(t => t.status === 'available')
  }, [filteredCounties])
  
  const handleTerritoryClick = (territory: Territory) => {
    if (territory.status === 'available') {
      setSelectedTerritory(territory)
      setClaimModalOpen(true)
    }
  }
  
  const handleClaimSuccess = () => {
    setClaimModalOpen(false)
    setSelectedTerritory(null)
    toast.success("Territory claimed successfully!")
    // Refresh territories
    // In production, this would sync from Supabase
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="text-center mb-8"
          style={{ willChange: 'transform, opacity' }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Claim Your Territory
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Browse and claim exclusive service territories across all 3,144 U.S. counties
          </p>
        </motion.div>
        
        {/* Stats Cards */}
        <TerritoryStats 
          myTerritories={myTerritories}
          availableTerritories={availableTerritories}
          totalCounties={allCounties.length}
        />
        
        {/* View Toggle and Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('map')}
                className={`
                  px-4 py-2 rounded-lg transition-all
                  ${view === 'map' 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white'
                  }
                `}
              >
                <MapTrifold size={20} className="inline mr-2" />
                Map View
              </button>
              <button
                onClick={() => setView('list')}
                className={`
                  px-4 py-2 rounded-lg transition-all
                  ${view === 'list' 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white'
                  }
                `}
              >
                <List size={20} className="inline mr-2" />
                List View
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <TerritoryFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </motion.div>
        
        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          {view === 'map' ? (
            <CountyMapView
              counties={filteredCounties}
              myTerritories={myTerritories}
              onTerritoryClick={handleTerritoryClick}
              selectedState={filters.state}
            />
          ) : (
            <CountyListView
              counties={filteredCounties}
              myTerritories={myTerritories}
              onTerritoryClick={handleTerritoryClick}
            />
          )}
        </motion.div>
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
      
      {/* Claim Modal */}
      {selectedTerritory && (
        <ClaimTerritoryModal
          open={claimModalOpen}
          onClose={() => {
            setClaimModalOpen(false)
            setSelectedTerritory(null)
          }}
          territory={selectedTerritory}
          user={user}
          onClaimSuccess={handleClaimSuccess}
        />
      )}
    </div>
  )
}
