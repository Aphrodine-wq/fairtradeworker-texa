import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CheckCircle, Globe } from "@phosphor-icons/react"
import { itemVariants } from "@/lib/animations"
import type { Territory } from "@/lib/types"

interface TerritoryStatsProps {
  myTerritories: Territory[]
  availableTerritories: Territory[]
  totalCounties: number
}

export function TerritoryStats({ 
  myTerritories, 
  availableTerritories, 
  totalCounties 
}: TerritoryStatsProps) {
  const stats = [
    {
      label: 'My Territories',
      value: myTerritories.length,
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Available',
      value: availableTerritories.length,
      icon: MapPin,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Counties',
      value: totalCounties,
      icon: Globe,
      color: 'text-gray-600 dark:text-gray-400',
    },
  ]
  
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            custom={index}
          >
            <Card className="border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                    <Icon size={24} className={stat.color} weight="duotone" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
