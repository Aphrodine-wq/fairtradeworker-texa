import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { itemVariants, universalCardHover } from "@/lib/animations"
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
  // Rainbow color scheme - random colors for each category
  const rainbowColors = [
    { bg: "bg-red-100 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300" },
    { bg: "bg-orange-100 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300" },
    { bg: "bg-yellow-100 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-300" },
    { bg: "bg-green-100 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300" },
    { bg: "bg-blue-100 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300" },
    { bg: "bg-indigo-100 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300" },
    { bg: "bg-purple-100 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300" },
    { bg: "bg-pink-100 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300" },
  ]

  // Assign random colors to categories (consistent per session)
  const getCategoryColor = (categoryId: string) => {
    // Use a simple hash to get consistent color per category
    const hash = categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return rainbowColors[hash % rainbowColors.length]
  }

  const handleCategoryClick = (categoryId: string) => {
    sessionStorage.setItem('selectedCategory', categoryId)
    onNavigate(`service-category/${categoryId}`)
  }

  // Split categories into two rows with Quick Services in the middle column
  const categoriesWithoutQuick = mainCategories.filter(cat => cat.id !== 'quick-services')
  const firstRow = categoriesWithoutQuick.slice(0, 4)
  const quickServices = mainCategories.find(cat => cat.id === 'quick-services')
  const secondRow = categoriesWithoutQuick.slice(4)

  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Browse Services
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* First Row - 4 items */}
        {firstRow.map((category) => {
          const Icon = category.icon
          const color = getCategoryColor(category.id)
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
                className="cursor-pointer h-full border-0 hover:shadow-lg transition-shadow"
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-0 ${color.bg}`}
                    >
                      <Icon 
                        size={28} 
                        weight="fill" 
                        className={color.text}
                      />
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Quick Services - Middle Column spanning 2 rows */}
        {quickServices && (
          <motion.div
            key={quickServices.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={universalCardHover.hover}
            whileTap={{ scale: 0.98 }}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            className="hidden lg:block lg:row-span-2 lg:col-start-3"
          >
            <Card
              className="cursor-pointer h-full border-0 hover:shadow-lg transition-shadow"
              onClick={() => handleCategoryClick(quickServices.id)}
            >
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{ willChange: 'transform' }}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-0 ${getCategoryColor(quickServices.id).bg}`}
                  >
                    <quickServices.icon 
                      size={28} 
                      weight="fill" 
                      className={getCategoryColor(quickServices.id).text}
                    />
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {quickServices.title}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Second Row - remaining items (skip middle on lg) */}
        {secondRow.map((category, index) => {
          const Icon = category.icon
          const color = getCategoryColor(category.id)
          // On large screens, skip the middle column (col 3) for second row items
          const colClass = index === 0 ? "lg:col-start-1" : index === 1 ? "lg:col-start-2" : index === 2 ? "lg:col-start-4" : "lg:col-start-5"
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={universalCardHover.hover}
              whileTap={{ scale: 0.98 }}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              className={colClass}
            >
              <Card
                className="cursor-pointer h-full border-0 hover:shadow-lg transition-shadow"
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-0 ${color.bg}`}
                    >
                      <Icon 
                        size={28} 
                        weight="fill" 
                        className={color.text}
                      />
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Quick Services - Mobile/Tablet view (shown after other items) */}
        {quickServices && (
          <motion.div
            key={`${quickServices.id}-mobile`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={universalCardHover.hover}
            whileTap={{ scale: 0.98 }}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            className="lg:hidden"
          >
            <Card
              className="cursor-pointer h-full border-0 hover:shadow-lg transition-shadow"
              onClick={() => handleCategoryClick(quickServices.id)}
            >
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{ willChange: 'transform' }}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-0 ${getCategoryColor(quickServices.id).bg}`}
                  >
                    <quickServices.icon 
                      size={28} 
                      weight="fill" 
                      className={getCategoryColor(quickServices.id).text}
                    />
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {quickServices.title}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
