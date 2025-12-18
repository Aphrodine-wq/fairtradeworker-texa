import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChartLine, ChartBar, TrendUp, CurrencyDollar, Users,
  Calendar, Target, Download,
  Plus, X, Settings
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer, CRMInteraction, CustomDashboard, SalesForecast } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface AdvancedAnalyticsCRMProps {
  user: User
}

export function AdvancedAnalyticsCRM({ user }: AdvancedAnalyticsCRMProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [dashboards, setDashboards] = useKV<CustomDashboard[]>("crm-dashboards", [])
  const [forecasts, setForecasts] = useKV<SalesForecast[]>("crm-forecasts", [])
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)
  const myInteractions = (interactions || []).filter(i => 
    myCustomers.some(c => c.id === i.customerId)
  )

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const periodInteractions = myInteractions.filter(i => new Date(i.date) >= startDate)
    const periodCustomers = myCustomers.filter(c => new Date(c.createdAt) >= startDate)

    const totalRevenue = myCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0)
    const periodRevenue = periodCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0)
    
    const conversionRate = myCustomers.length > 0
      ? (myCustomers.filter(c => c.status === 'completed' || c.status === 'advocate').length / myCustomers.length) * 100
      : 0

    const avgDealSize = myCustomers.length > 0
      ? totalRevenue / myCustomers.length
      : 0

    const salesCycle = myCustomers.length > 0
      ? myCustomers.reduce((sum, c) => {
          const created = new Date(c.createdAt)
          const lastContact = new Date(c.lastContact)
          return sum + (lastContact.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / myCustomers.length
      : 0

    return {
      totalRevenue,
      periodRevenue,
      conversionRate,
      avgDealSize,
      salesCycle,
      totalCustomers: myCustomers.length,
      activeCustomers: myCustomers.filter(c => c.status === 'active').length,
      periodInteractions: periodInteractions.length,
      periodCustomers: periodCustomers.length
    }
  }, [myCustomers, myInteractions, timeRange])

  // Generate forecast
  const generateForecast = () => {
    const now = new Date()
    const endDate = new Date()
    endDate.setMonth(now.getMonth() + 1)

    const historicalAvg = metrics.avgDealSize
    const pipelineValue = myCustomers
      .filter(c => c.status === 'lead' || c.status === 'active')
      .reduce((sum, c) => sum + c.lifetimeValue, 0)

    const forecastedRevenue = (historicalAvg * metrics.activeCustomers * 0.3) + (pipelineValue * 0.7)
    const confidence = Math.min(85, 50 + (myCustomers.length * 2))

    const newForecast: SalesForecast = {
      id: `forecast-${Date.now()}`,
      contractorId: user.id,
      period: 'month',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      forecastedRevenue: Math.round(forecastedRevenue),
      confidence: Math.round(confidence),
      factors: {
        pipeline: Math.round(pipelineValue * 0.7),
        historical: Math.round(historicalAvg * metrics.activeCustomers * 0.3),
        seasonality: Math.round(forecastedRevenue * 0.1),
        market: Math.round(forecastedRevenue * 0.05)
      },
      createdAt: new Date().toISOString()
    }

    setForecasts((current) => [...(current || []), newForecast])
  }

  // Status distribution
  const statusDistribution = useMemo(() => {
    const statuses = ['lead', 'active', 'completed', 'advocate'] as const
    return statuses.map(status => ({
      status,
      count: myCustomers.filter(c => c.status === status).length,
      percentage: myCustomers.length > 0
        ? (myCustomers.filter(c => c.status === status).length / myCustomers.length) * 100
        : 0
    }))
  }, [myCustomers])

  // Revenue by source
  const revenueBySource = useMemo(() => {
    const sources = ['bid', 'manual_invite', 'referral'] as const
    return sources.map(source => ({
      source,
      revenue: myCustomers
        .filter(c => c.source === source)
        .reduce((sum, c) => sum + c.lifetimeValue, 0),
      count: myCustomers.filter(c => c.source === source).length
    }))
  }, [myCustomers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <ChartBar weight="duotone" size={28} className="text-black dark:text-white" />
            Advanced Analytics & Business Intelligence
          </h2>
          <p className="text-muted-foreground mt-1">
            Deep-dive reporting, custom dashboards, and sales forecasting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CurrencyDollar weight="duotone" size={24} className="text-black dark:text-white" />
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${metrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Period: ${metrics.periodRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users weight="duotone" size={24} className="text-black dark:text-white" />
                  <span className="text-xs text-muted-foreground">Total Customers</span>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {metrics.totalCustomers}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.activeCustomers} active
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target weight="duotone" size={24} className="text-black dark:text-white" />
                  <span className="text-xs text-muted-foreground">Conversion Rate</span>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {metrics.conversionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg deal: ${metrics.avgDealSize.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar weight="duotone" size={24} className="text-black dark:text-white" />
                  <span className="text-xs text-muted-foreground">Sales Cycle</span>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {metrics.salesCycle.toFixed(0)}d
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg days to close
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Customer Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusDistribution.map(item => (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-black dark:text-white capitalize">
                          {item.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBySource.map(item => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-black dark:text-white capitalize">
                          {item.source.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${item.revenue.toLocaleString()} ({item.count})
                        </span>
                      </div>
                      <Progress 
                        value={metrics.totalRevenue > 0 ? (item.revenue / metrics.totalRevenue) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-black dark:text-white">Sales Forecasts</h3>
            <Button onClick={generateForecast} size="sm">
              <Plus size={16} className="mr-2" />
              Generate Forecast
            </Button>
          </div>

          {forecasts.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
              <ChartLine size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground mb-4">No forecasts generated yet</p>
              <Button onClick={generateForecast}>Generate Your First Forecast</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {forecasts.slice().reverse().map(forecast => (
                <Card key={forecast.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {new Date(forecast.startDate).toLocaleDateString()} - {new Date(forecast.endDate).toLocaleDateString()}
                      </CardTitle>
                      <Badge variant="outline">{forecast.confidence}% confidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Forecasted Revenue</span>
                          <span className="text-2xl font-bold text-black dark:text-white">
                            ${forecast.forecastedRevenue.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={forecast.confidence} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Pipeline Value</div>
                          <div className="font-semibold text-black dark:text-white">
                            ${forecast.factors.pipeline.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Historical Avg</div>
                          <div className="font-semibold text-black dark:text-white">
                            ${forecast.factors.historical.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Seasonality</div>
                          <div className="font-semibold text-black dark:text-white">
                            ${forecast.factors.seasonality.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Market Factors</div>
                          <div className="font-semibold text-black dark:text-white">
                            ${forecast.factors.market.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-black dark:text-white">Custom Dashboards</h3>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Create Dashboard
            </Button>
          </div>

          {dashboards.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
              <ChartBar size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground mb-4">No custom dashboards yet</p>
              <Button>Create Your First Dashboard</Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {dashboards.map(dashboard => (
                <Card 
                  key={dashboard.id} 
                  className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedDashboard(dashboard.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      {dashboard.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {dashboard.widgets.length} widgets • {dashboard.layout} layout
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-6">
                <ChartBar weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Sales Performance</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revenue, conversion rates, and sales cycle analysis
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-6">
                <Users weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Customer Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customer lifetime value, segmentation, and behavior
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-6">
                <TrendUp weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Pipeline Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pipeline health, stage analysis, and conversion metrics
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
