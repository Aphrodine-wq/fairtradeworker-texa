import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
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
  // Bold rainbow color scheme for all categories
  const categoryStyles: Record<string, string> = {
    emergency: "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300",
    plumbing: "bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300",
    electrical: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300",
    hvac: "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300",
    repair: "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300",
    outdoor: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300",
    remodeling: "bg-violet-100 dark:bg-violet-950/30 text-violet-800 dark:text-violet-300",
    cleaning: "bg-teal-100 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300",
    'quick-services': "bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300"
  }

  const handleCategoryClick = (categoryId: string) => {
    sessionStorage.setItem('selectedCategory', categoryId)
    onNavigate(`service-category/${categoryId}`)
  }

  return (
    <div className="w-full py-8">
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Browse Services
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {mainCategories.map((category, index) => {
          const Icon = category.icon
          // Center Quick Services (9th item) in 4-column grid
          const isQuickServices = category.id === 'quick-services'
          const centerClass = isQuickServices ? "lg:col-start-2" : ""
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={universalCardHover.hover}
              whileTap={{ scale: 0.98 }}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              className={centerClass}
            >
              <Card
                className="cursor-pointer h-full border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors"
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border border-black/10 dark:border-white/10 ${
                        categoryStyles[category.id] || "bg-neutral-100 dark:bg-neutral-900"
                      }`}
                    >
                      <Icon 
                        size={28} 
                        weight="fill" 
                        className={
                          categoryStyles[category.id] 
                            ? category.id === 'emergency' ? "text-red-800 dark:text-red-300" :
                              category.id === 'plumbing' ? "text-orange-800 dark:text-orange-300" :
                              category.id === 'electrical' ? "text-yellow-800 dark:text-yellow-300" :
                              category.id === 'hvac' ? "text-green-800 dark:text-green-300" :
                              category.id === 'repair' ? "text-blue-800 dark:text-blue-300" :
                              category.id === 'outdoor' ? "text-indigo-800 dark:text-indigo-300" :
                              category.id === 'remodeling' ? "text-violet-800 dark:text-violet-300" :
                              category.id === 'cleaning' ? "text-teal-800 dark:text-teal-300" :
                              category.id === 'quick-services' ? "text-purple-800 dark:text-purple-300" :
                              "text-slate-800 dark:text-slate-200"
                            : "text-slate-800 dark:text-slate-200"
                        }
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
      </motion.div>
    </div>
  )
}
