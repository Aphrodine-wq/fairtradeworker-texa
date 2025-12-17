import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { itemVariants, universalCardHover } from "@/lib/animations"
import { useMemo, useState, useEffect } from "react"
import { Check, X } from "@phosphor-icons/react"
import {
  Warning,
  Wrench,
  Lightning,
  Thermometer,
  Hammer,
  Tree,
  House,
  Broom,
  Clock,
  Calendar,
} from "@phosphor-icons/react"

// Main categories structure
export interface ServiceItem {
  id: string
  title: string
  icon: typeof Wrench
}

export interface MainCategory {
  id: string
  title: string
  icon: typeof Wrench
  services: ServiceItem[]
}

// All services organized by category
export const allServicesByCategory: Record<string, ServiceItem[]> = {
  emergency: [
    { id: 'emergency-plumbing', title: 'Emergency Plumbing Leak', icon: Wrench },
    { id: 'lockout', title: 'Lockout / Lost Keys', icon: Warning },
    { id: 'electrical-outage', title: 'Electrical Outage or Spark', icon: Lightning },
    { id: 'ac-heat', title: 'AC or Heat Not Working', icon: Thermometer },
    { id: 'clogged-toilet', title: 'Clogged Toilet or Drain', icon: Wrench },
    { id: 'broken-window', title: 'Broken Window or Door Lock', icon: Warning },
    { id: 'water-damage', title: 'Water Damage Emergency', icon: Warning },
    { id: 'gas-leak', title: 'Gas Leak Detection', icon: Warning },
    { id: 'storm-damage', title: 'Storm Damage Repair', icon: Warning },
    { id: 'burst-pipe', title: 'Burst Pipe Emergency', icon: Wrench },
    { id: 'power-outage', title: 'Power Outage Troubleshooting', icon: Lightning },
    { id: 'hvac-emergency', title: 'HVAC Emergency (Extreme Temps)', icon: Thermometer },
  ],
  plumbing: [
    { id: 'plumbing-repair', title: 'Plumbing Repair', icon: Wrench },
    { id: 'faucet-sink', title: 'Faucet or Sink Install', icon: Wrench },
    { id: 'toilet-install', title: 'Toilet Install or Repair', icon: Wrench },
    { id: 'drain-cleaning', title: 'Drain Cleaning', icon: Wrench },
    { id: 'water-heater', title: 'Water Heater Repair/Install', icon: Wrench },
    { id: 'shower-bath', title: 'Shower or Bath Remodel', icon: Wrench },
    { id: 'pipe-replacement', title: 'Pipe Replacement', icon: Wrench },
    { id: 'water-softener', title: 'Water Softener', icon: Wrench },
    { id: 'sump-pump', title: 'Sump Pump', icon: Wrench },
    { id: 'septic-service', title: 'Septic Service', icon: Wrench },
  ],
  electrical: [
    { id: 'electrical-repair', title: 'Electrical Repair/Wiring', icon: Lightning },
    { id: 'outlet-switch', title: 'Outlet or Switch Install', icon: Lightning },
    { id: 'lighting-fixture', title: 'Lighting Fixture Install', icon: Lightning },
    { id: 'ceiling-fan', title: 'Ceiling Fan Setup', icon: Lightning },
    { id: 'smart-home', title: 'Smart Home Devices', icon: Lightning },
    { id: 'panel-upgrade', title: 'Panel Upgrade', icon: Lightning },
    { id: 'ev-charger', title: 'EV Charger Install', icon: Lightning },
    { id: 'security-camera', title: 'Security Camera/Lights', icon: Lightning },
    { id: 'generator-hookup', title: 'Generator Hookup', icon: Lightning },
  ],
  hvac: [
    { id: 'ac-repair', title: 'Air Conditioning Repair', icon: Thermometer },
    { id: 'heating-furnace', title: 'Heating/Furnace Service', icon: Thermometer },
    { id: 'furnace-ac-install', title: 'Furnace or AC Install', icon: Thermometer },
    { id: 'duct-cleaning', title: 'Duct Cleaning', icon: Thermometer },
    { id: 'thermostat-upgrade', title: 'Thermostat Upgrade', icon: Thermometer },
    { id: 'ductless-mini-split', title: 'Ductless Mini-Split', icon: Thermometer },
    { id: 'air-purifier', title: 'Air Purifier/Humidifier', icon: Thermometer },
  ],
  repair: [
    { id: 'handyman', title: 'Handyman Services', icon: Hammer },
    { id: 'drywall-repair', title: 'Drywall Repair', icon: Hammer },
    { id: 'interior-painting', title: 'Interior Painting', icon: Hammer },
    { id: 'flooring-repair', title: 'Flooring Repair/Install', icon: Hammer },
    { id: 'door-window-fix', title: 'Door or Window Fix', icon: Hammer },
    { id: 'appliance-install', title: 'Appliance Install/Repair', icon: Hammer },
    { id: 'gutter-cleaning', title: 'Gutter Cleaning', icon: Hammer },
    { id: 'garage-door', title: 'Garage Door Repair', icon: Hammer },
    { id: 'furniture-assembly', title: 'Furniture Assembly', icon: Hammer },
    { id: 'tile-repair', title: 'Tile Repair', icon: Hammer },
  ],
  outdoor: [
    { id: 'lawn-mowing', title: 'Lawn Mowing & Care', icon: Tree },
    { id: 'tree-trimming', title: 'Tree Trimming', icon: Tree },
    { id: 'fence-install', title: 'Fence Install/Repair', icon: Tree },
    { id: 'deck-patio', title: 'Deck or Patio Build', icon: Tree },
    { id: 'pressure-washing', title: 'Pressure Washing', icon: Tree },
    { id: 'snow-removal', title: 'Snow Removal', icon: Tree },
    { id: 'holiday-lighting', title: 'Holiday Lighting', icon: Tree },
    { id: 'irrigation-sprinkler', title: 'Irrigation/Sprinkler', icon: Tree },
    { id: 'pool-opening', title: 'Pool Opening/Closing', icon: Tree },
    { id: 'landscaping', title: 'Landscaping', icon: Tree },
  ],
  remodeling: [
    { id: 'kitchen-remodel', title: 'Kitchen Remodel', icon: House },
    { id: 'bathroom-remodel', title: 'Bathroom Remodel', icon: House },
    { id: 'basement-finishing', title: 'Basement Finishing', icon: House },
    { id: 'roofing', title: 'Roofing', icon: House },
    { id: 'siding', title: 'Siding', icon: House },
    { id: 'window-replacement', title: 'Window Replacement', icon: House },
    { id: 'home-addition', title: 'Home Addition', icon: House },
    { id: 'countertop-cabinet', title: 'Countertop/Cabinet Install', icon: House },
    { id: 'hardwood-carpet', title: 'Hardwood or Carpet Flooring', icon: House },
    { id: 'general-contracting', title: 'General Contracting', icon: House },
  ],
  cleaning: [
    { id: 'house-cleaning', title: 'House Cleaning', icon: Broom },
    { id: 'carpet-upholstery', title: 'Carpet or Upholstery Cleaning', icon: Broom },
    { id: 'window-washing', title: 'Window Washing', icon: Broom },
    { id: 'move-in-out', title: 'Move-In/Move-Out Clean', icon: Broom },
    { id: 'air-duct-cleaning', title: 'Air Duct Cleaning', icon: Broom },
    { id: 'chimney-sweep', title: 'Chimney Sweep', icon: Broom },
    { id: 'pest-control', title: 'Pest Control', icon: Broom },
    { id: 'mold-removal', title: 'Mold Removal', icon: Broom },
    { id: 'junk-removal', title: 'Junk Removal', icon: Broom },
    { id: 'pressure-washing-clean', title: 'Pressure Washing', icon: Broom },
  ],
  'quick-services': [
    { id: 'same-day-service', title: 'Same-Day Service Requests', icon: Clock },
    { id: 'weekend-service', title: 'Weekend Service', icon: Calendar },
    { id: 'after-hours-service', title: 'After-Hours Service', icon: Clock },
    { id: 'express-quotes', title: 'Express Quotes', icon: Lightning },
    { id: 'priority-booking', title: 'Priority Booking', icon: Warning },
  ],
}

// Main categories to display on home page
export const mainCategories: MainCategory[] = [
  {
    id: 'emergency',
    title: 'Emergency & Quick Fixes',
    icon: Warning,
    services: allServicesByCategory.emergency,
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Water',
    icon: Wrench,
    services: allServicesByCategory.plumbing,
  },
  {
    id: 'electrical',
    title: 'Electrical & Lighting',
    icon: Lightning,
    services: allServicesByCategory.electrical,
  },
  {
    id: 'hvac',
    title: 'HVAC & Air',
    icon: Thermometer,
    services: allServicesByCategory.hvac,
  },
  {
    id: 'repair',
    title: 'Home Repair & Maintenance',
    icon: Hammer,
    services: allServicesByCategory.repair,
  },
  {
    id: 'outdoor',
    title: 'Outdoor & Yard',
    icon: Tree,
    services: allServicesByCategory.outdoor,
  },
  {
    id: 'remodeling',
    title: 'Remodeling & Construction',
    icon: House,
    services: allServicesByCategory.remodeling,
  },
  {
    id: 'cleaning',
    title: 'Cleaning & Specialty',
    icon: Broom,
    services: allServicesByCategory.cleaning,
  },
  {
    id: 'quick-services',
    title: 'Quick Services',
    icon: Clock,
    services: allServicesByCategory['quick-services'],
  },
]

interface ServiceCategoriesProps {
  onNavigate: (page: string) => void
}

export function ServiceCategories({ onNavigate }: ServiceCategoriesProps) {
  // Bold, vibrant color scheme - using 500 shades for boldness
  const boldColors = [
    { bg: "bg-red-500 dark:bg-red-600", text: "text-white dark:text-white", index: 0 },
    { bg: "bg-orange-500 dark:bg-orange-600", text: "text-white dark:text-white", index: 1 },
    { bg: "bg-amber-500 dark:bg-amber-600", text: "text-white dark:text-white", index: 2 },
    { bg: "bg-green-500 dark:bg-green-600", text: "text-white dark:text-white", index: 3 },
    { bg: "bg-teal-500 dark:bg-teal-600", text: "text-white dark:text-white", index: 4 },
    { bg: "bg-blue-500 dark:bg-blue-600", text: "text-white dark:text-white", index: 5 },
    { bg: "bg-indigo-500 dark:bg-indigo-600", text: "text-white dark:text-white", index: 6 },
    { bg: "bg-purple-500 dark:bg-purple-600", text: "text-white dark:text-white", index: 7 },
    { bg: "bg-pink-500 dark:bg-pink-600", text: "text-white dark:text-white", index: 8 },
  ]

  // Color similarity groups - colors that are too similar should not be adjacent
  const colorGroups = [
    [0, 1], // red, orange (similar)
    [1, 2], // orange, amber (similar)
    [5, 6], // blue, indigo (similar)
    [6, 7], // indigo, purple (similar)
    [7, 8], // purple, pink (similar)
  ]

  // Function to check if two colors are similar
  const areSimilar = (idx1: number, idx2: number): boolean => {
    return colorGroups.some(group => 
      (group.includes(idx1) && group.includes(idx2))
    )
  }

  // Assign colors ensuring no similar colors are adjacent
  // Grid is 3 columns, so we need to check horizontal and vertical neighbors
  const assignColors = (): Map<string, typeof boldColors[0]> => {
    const colorMap = new Map<string, typeof boldColors[0]>()
    const usedIndices = new Set<number>()
    
    // Try to assign colors with constraint checking
    const tryAssignColor = (categoryId: string, position: number): typeof boldColors[0] => {
      const row = Math.floor(position / 3)
      const col = position % 3
      
      // Get neighbors (horizontal and vertical)
      const neighbors: number[] = []
      if (col > 0) neighbors.push(position - 1) // left
      if (col < 2) neighbors.push(position + 1) // right
      if (row > 0) neighbors.push(position - 3) // top
      if (row < 2) neighbors.push(position + 3) // bottom
      
      // Get colors already assigned to neighbors
      const neighborColors = neighbors
        .map((pos, idx) => {
          const cat = mainCategories[pos]
          return cat ? colorMap.get(cat.id) : null
        })
        .filter(Boolean)
        .map(c => c!.index)
      
      // Find a color that's not similar to any neighbor
      const availableColors = boldColors.filter(color => {
        if (usedIndices.has(color.index)) return false
        return !neighborColors.some(neighborIdx => areSimilar(color.index, neighborIdx))
      })
      
      // If no perfect match, use any available color
      const selectedColor = availableColors.length > 0 
        ? availableColors[0]
        : boldColors.find(c => !usedIndices.has(c.index)) || boldColors[0]
      
      usedIndices.add(selectedColor.index)
      return selectedColor
    }
    
    mainCategories.forEach((category, index) => {
      const color = tryAssignColor(category.id, index)
      colorMap.set(category.id, color)
    })
    
    return colorMap
  }

  const categoryColorMap = useMemo(() => assignColors(), [])

  const getCategoryColor = (categoryId: string) => {
    return categoryColorMap.get(categoryId) || boldColors[0]
  }

  // Multi-select state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Load selected categories from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedCategories')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCategories(parsed)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(categoryId)
      let updated: string[]
      
      if (exists) {
        // Remove if already selected
        updated = prev.filter(id => id !== categoryId)
      } else {
        // Add if not selected
        updated = [...prev, categoryId]
      }
      
      // Store in sessionStorage
      if (updated.length > 0) {
        sessionStorage.setItem('selectedCategories', JSON.stringify(updated))
      } else {
        sessionStorage.removeItem('selectedCategories')
      }
      
      return updated
    })
  }

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      // If no categories selected, use old behavior - navigate to first category
      const firstCategory = mainCategories[0]
      sessionStorage.setItem('selectedCategory', firstCategory.id)
      onNavigate(`service-category/${firstCategory.id}`)
    } else if (selectedCategories.length === 1) {
      // Single category - navigate directly
      sessionStorage.setItem('selectedCategory', selectedCategories[0])
      onNavigate(`service-category/${selectedCategories[0]}`)
    } else {
      // Multiple categories - store all and navigate to first one
      // The ServiceCategoryDetail page will handle showing services from all selected categories
      sessionStorage.setItem('selectedCategory', selectedCategories[0])
      sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories))
      onNavigate(`service-category/${selectedCategories[0]}`)
    }
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    sessionStorage.removeItem('selectedCategories')
    sessionStorage.removeItem('selectedCategory')
  }

  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Browse Services
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select one or more service categories
        </p>
        {selectedCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {selectedCategories.map((categoryId) => {
              const category = mainCategories.find(c => c.id === categoryId)
              if (!category) return null
              return (
                <Badge key={categoryId} variant="secondary" className="text-sm px-3 py-1 flex items-center gap-2">
                  {category.title}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(categoryId)
                    }}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                    aria-label={`Remove ${category.title}`}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Symmetrical 3x3 grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {mainCategories.map((category) => {
          const Icon = category.icon
          const color = getCategoryColor(category.id)
          const isSelected = selectedCategories.includes(category.id)
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={universalCardHover.hover}
              whileTap={{ scale: 0.98 }}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            >
              <Card
                className={`cursor-pointer h-full border-0 hover:shadow-lg transition-all ${
                  isSelected ? 'ring-2 ring-black dark:ring-white shadow-lg' : ''
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={{ willChange: 'transform' }}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-0 ${color.bg} relative`}
                    >
                      <Icon 
                        size={28} 
                        weight="fill" 
                        className={color.text}
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center">
                          <Check size={12} weight="bold" className="text-white dark:text-black" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {category.title}
                    {isSelected && <Check size={18} weight="bold" className="text-black dark:text-white" />}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Continue button */}
      {selectedCategories.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-8"
          >
            Continue with {selectedCategories.length} Categor{selectedCategories.length > 1 ? 'ies' : 'y'}
          </Button>
        </div>
      )}
    </div>
  )
}
