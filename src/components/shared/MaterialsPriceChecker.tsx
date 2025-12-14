/**
 * Materials Price Checker
 * Free Feature - JSON of avg prices → show during bidding
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  MagnifyingGlass,
  Package,
  TrendingUp,
  TrendingDown
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface Material {
  category: string
  item: string
  lowPrice: number
  avgPrice: number
  highPrice: number
  lastUpdated: string
}

interface MaterialsPriceCheckerProps {
  user: User
}

// Mock materials data - in production, load from data/materials.json
const mockMaterials: Material[] = [
  { category: 'Lumber', item: '2x4x8', lowPrice: 3.50, avgPrice: 4.25, highPrice: 5.00, lastUpdated: '2025-01-15' },
  { category: 'Lumber', item: '2x6x8', lowPrice: 5.50, avgPrice: 6.75, highPrice: 8.00, lastUpdated: '2025-01-15' },
  { category: 'Lumber', item: 'Plywood 4x8', lowPrice: 45.00, avgPrice: 52.50, highPrice: 60.00, lastUpdated: '2025-01-15' },
  { category: 'Plumbing', item: 'Copper Pipe 1/2"', lowPrice: 8.00, avgPrice: 10.50, highPrice: 13.00, lastUpdated: '2025-01-15' },
  { category: 'Plumbing', item: 'PVC Pipe 1/2"', lowPrice: 2.50, avgPrice: 3.25, highPrice: 4.00, lastUpdated: '2025-01-15' },
  { category: 'Plumbing', item: 'Faucet Standard', lowPrice: 85.00, avgPrice: 125.00, highPrice: 200.00, lastUpdated: '2025-01-15' },
  { category: 'Electrical', item: '12/2 Wire (100ft)', lowPrice: 45.00, avgPrice: 65.00, highPrice: 85.00, lastUpdated: '2025-01-15' },
  { category: 'Electrical', item: 'Outlet GFCI', lowPrice: 12.00, avgPrice: 18.50, highPrice: 25.00, lastUpdated: '2025-01-15' },
  { category: 'Drywall', item: 'Sheetrock 4x8', lowPrice: 12.00, avgPrice: 15.50, highPrice: 18.00, lastUpdated: '2025-01-15' },
  { category: 'Drywall', item: 'Joint Compound', lowPrice: 8.00, avgPrice: 11.00, highPrice: 14.00, lastUpdated: '2025-01-15' },
  { category: 'Paint', item: 'Interior Paint Gallon', lowPrice: 25.00, avgPrice: 38.00, highPrice: 55.00, lastUpdated: '2025-01-15' },
  { category: 'Paint', item: 'Primer Gallon', lowPrice: 20.00, avgPrice: 28.00, highPrice: 40.00, lastUpdated: '2025-01-15' },
  { category: 'Flooring', item: 'Vinyl Plank (sqft)', lowPrice: 1.50, avgPrice: 2.75, highPrice: 4.50, lastUpdated: '2025-01-15' },
  { category: 'Flooring', item: 'Hardwood (sqft)', lowPrice: 4.00, avgPrice: 7.50, highPrice: 12.00, lastUpdated: '2025-01-15' },
  { category: 'Roofing', item: 'Asphalt Shingle (sqft)', lowPrice: 1.20, avgPrice: 1.80, highPrice: 2.50, lastUpdated: '2025-01-15' },
  { category: 'Roofing', item: 'Roofing Felt', lowPrice: 15.00, avgPrice: 22.00, highPrice: 30.00, lastUpdated: '2025-01-15' },
]

export function MaterialsPriceChecker({ user }: MaterialsPriceCheckerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = useMemo(() => {
    return Array.from(new Set(mockMaterials.map(m => m.category)))
  }, [])

  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(m => {
      const matchesSearch = m.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           m.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package weight="duotone" size={24} />
            Materials Price Checker
          </CardTitle>
          <CardDescription>
            Check average prices for common materials in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Materials</Label>
              <div className="relative mt-2">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" size={20} />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item or category..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-2 px-4 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded-none"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMaterials.length === 0 ? (
              <p className="text-center text-black dark:text-white py-8">No materials found</p>
            ) : (
              filteredMaterials.map((material, idx) => (
                <div key={idx} className="p-4 border-2 border-black dark:border-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">{material.item}</h3>
                      <Badge variant="outline" className="mt-1">{material.category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${material.avgPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-black dark:text-white">avg</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-black dark:text-white flex items-center gap-1">
                        <TrendingDown size={14} className="text-green-600 dark:text-green-400" />
                        Low: ${material.lowPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-black dark:text-white">
                        Avg: ${material.avgPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-black dark:text-white flex items-center gap-1 justify-end">
                        <TrendingUp size={14} className="text-red-600 dark:text-red-400" />
                        High: ${material.highPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-black dark:text-white mt-2 opacity-70">
                    Updated: {new Date(material.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
