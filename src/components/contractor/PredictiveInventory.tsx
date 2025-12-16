/**
 * Predictive Inventory Management
 * Forecasts inventory needs based on scheduled jobs and historical usage patterns
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Package, WarningCircle, CheckCircle, TrendUp, 
  Calendar, ShoppingCart, ChartLine
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  unit: string
  reorderPoint: number
  avgUsagePerJob: Record<string, number> // jobType -> quantity
  supplier: string
  lastOrdered?: string
}

interface InventoryForecast {
  item: InventoryItem
  currentStock: number
  projectedUsage: number
  daysUntilReorder: number
  recommendedOrder: number
  urgency: 'critical' | 'warning' | 'normal' | 'good'
  scheduledJobs: Job[]
}

interface PredictiveInventoryProps {
  user: User
}

export function PredictiveInventory({ user }: PredictiveInventoryProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [inventory, setInventory] = useKV<InventoryItem[]>("inventory", [])
  const [scheduledJobs] = useKV<any[]>("scheduled-jobs", [])
  const [forecastDays, setForecastDays] = useState(30)

  // Get scheduled jobs for forecast period
  const upcomingJobs = useMemo(() => {
    const today = new Date()
    const forecastEnd = new Date()
    forecastEnd.setDate(forecastEnd.getDate() + forecastDays)

    return scheduledJobs?.filter(sj => {
      const job = jobs?.find(j => j.id === sj.jobId)
      if (!job || job.contractorId !== user.id) return false
      
      const jobDate = new Date(sj.date)
      return jobDate >= today && jobDate <= forecastEnd
    }).map(sj => ({
      ...sj,
      jobDetails: jobs?.find(j => j.id === sj.jobId)
    })) || []
  }, [scheduledJobs, jobs, user.id, forecastDays])

  // Calculate inventory forecasts
  const forecasts = useMemo(() => {
    if (!inventory || inventory.length === 0) return []

    return inventory.map(item => {
      let projectedUsage = 0
      const relevantJobs: Job[] = []

      // Calculate projected usage based on scheduled jobs
      upcomingJobs.forEach(sj => {
        const job = sj.jobDetails
        if (!job) return

        // Determine job type
        const jobType = job.title.toLowerCase().includes('kitchen') ? 'kitchen' :
                        job.title.toLowerCase().includes('bathroom') ? 'bathroom' :
                        job.title.toLowerCase().includes('roof') ? 'roof' :
                        job.title.toLowerCase().includes('floor') ? 'floor' : 'general'

        // Get average usage for this job type
        const usage = item.avgUsagePerJob[jobType] || item.avgUsagePerJob['general'] || 0
        
        if (usage > 0) {
          projectedUsage += usage
          relevantJobs.push(job)
        }
      })

      // Calculate days until reorder point
      const deficit = item.currentStock - projectedUsage
      const daysUntilReorder = deficit < item.reorderPoint ? 0 : forecastDays

      // Determine urgency
      let urgency: InventoryForecast['urgency'] = 'good'
      if (item.currentStock < item.reorderPoint) {
        urgency = 'critical'
      } else if (deficit < item.reorderPoint) {
        urgency = 'warning'
      } else if (deficit < item.reorderPoint * 1.5) {
        urgency = 'normal'
      }

      // Calculate recommended order quantity
      const recommendedOrder = urgency === 'good' 
        ? 0 
        : Math.max(0, projectedUsage + item.reorderPoint - item.currentStock)

      const forecast: InventoryForecast = {
        item,
        currentStock: item.currentStock,
        projectedUsage,
        daysUntilReorder,
        recommendedOrder,
        urgency,
        scheduledJobs: relevantJobs
      }

      return forecast
    }).sort((a, b) => {
      // Sort by urgency
      const urgencyOrder = { critical: 0, warning: 1, normal: 2, good: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }, [inventory, upcomingJobs, forecastDays])

  const getUrgencyColor = (urgency: InventoryForecast['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'normal': return 'bg-blue-50 border-blue-200'
      default: return 'bg-green-50 border-green-200'
    }
  }

  const getUrgencyBadge = (urgency: InventoryForecast['urgency']) => {
    switch (urgency) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'default'
    }
  }

  const getUrgencyIcon = (urgency: InventoryForecast['urgency']) => {
    switch (urgency) {
      case 'critical':
      case 'warning':
        return <WarningCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  // Summary statistics
  const summary = useMemo(() => {
    const critical = forecasts.filter(f => f.urgency === 'critical').length
    const warning = forecasts.filter(f => f.urgency === 'warning').length
    const totalOrderCost = forecasts.reduce((sum, f) => sum + f.recommendedOrder, 0)

    return { critical, warning, totalOrderCost }
  }, [forecasts])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical Items</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{summary.critical}</p>
                <p className="text-xs text-gray-500 mt-1">Below reorder point</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <WarningCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Warning Items</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">{summary.warning}</p>
                <p className="text-xs text-gray-500 mt-1">Running low soon</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming Jobs</p>
                <p className="text-3xl font-bold mt-2">{upcomingJobs.length}</p>
                <p className="text-xs text-gray-500 mt-1">Next {forecastDays} days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Settings */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="w-5 h-5" />
            Forecast Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Forecast Period:</label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Forecasts */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Forecast
              </CardTitle>
              <CardDescription>
                Projected inventory needs based on scheduled jobs
              </CardDescription>
            </div>
            {(summary.critical > 0 || summary.warning > 0) && (
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generate Order
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecasts.map(forecast => (
              <Card 
                key={forecast.item.id}
                className={`border-l-4 ${getUrgencyColor(forecast.urgency)} shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getUrgencyIcon(forecast.urgency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{forecast.item.name}</h3>
                          <p className="text-sm text-gray-500">{forecast.item.category}</p>
                        </div>
                        <Badge variant={getUrgencyBadge(forecast.urgency)}>
                          {forecast.urgency}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Current Stock</p>
                          <p className="text-sm font-medium">
                            {forecast.currentStock} {forecast.item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Projected Usage</p>
                          <p className="text-sm font-medium text-orange-600">
                            {forecast.projectedUsage} {forecast.item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">After Usage</p>
                          <p className="text-sm font-medium">
                            {forecast.currentStock - forecast.projectedUsage} {forecast.item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reorder Point</p>
                          <p className="text-sm font-medium">
                            {forecast.item.reorderPoint} {forecast.item.unit}
                          </p>
                        </div>
                      </div>

                      {forecast.scheduledJobs.length > 0 && (
                        <div className="mt-3 p-3 bg-white/50 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Required for {forecast.scheduledJobs.length} upcoming job(s):
                          </p>
                          <div className="space-y-1">
                            {forecast.scheduledJobs.slice(0, 3).map(job => (
                              <div key={job.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {job.title}
                              </div>
                            ))}
                            {forecast.scheduledJobs.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{forecast.scheduledJobs.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {forecast.recommendedOrder > 0 && (
                        <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-xs font-medium text-gray-700">Recommended Order</p>
                            <p className="text-sm font-semibold text-blue-600">
                              {forecast.recommendedOrder} {forecast.item.unit}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order from {forecast.item.supplier}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {forecasts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No inventory items configured</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add inventory items to enable forecasting
                </p>
                <Button className="mt-4">
                  Add Inventory Items
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
