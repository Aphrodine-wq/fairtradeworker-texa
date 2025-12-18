import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapPin, Bell, BellRinging, TrendUp, House, Lightning, Eye, EyeSlash, Crown, Star, Clock, CurrencyDollar } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface NeighborhoodAlert {
  id: string
  type: 'cluster' | 'high_activity' | 'premium' | 'trend'
  area: string
  zipCode: string
  streetName?: string
  jobCount: number
  avgValue: number
  trades: string[]
  timestamp: Date
  expiresAt?: Date
  isPremium: boolean
  distanceFromCurrentJob?: number
}

interface NeighborhoodInsight {
  area: string
  zipCode: string
  stats: {
    activeJobs: number
    avgBudget: number
    topTrades: { trade: string; count: number }[]
    recentGrowth: number // percentage
    historicalPattern?: string
  }
  predictions: {
    expectedJobs: number
    bestTime: string
    recommendation: string
  }
}

interface NeighborhoodJobAlertsProps {
  contractorId: string
  currentLocation?: { lat: number; lon: number }
  isPro?: boolean
  onUpgrade?: () => void
}

export function NeighborhoodJobAlerts({
  contractorId,
  currentLocation,
  isPro = false,
  onUpgrade
}: NeighborhoodJobAlertsProps) {
  const [alerts, setAlerts] = useState<NeighborhoodAlert[]>([])
  const [insights, setInsights] = useState<NeighborhoodInsight[]>([])
  const [settings, setSettings] = useState({
    enabled: true,
    radius: 5, // miles
    minJobValue: 200,
    preferredTrades: [] as string[],
    instantAlerts: false, // Premium feature
    morningDigest: true
  })
  const [loading, setLoading] = useState(true)

  // Load alerts and insights
  useEffect(() => {
    loadAlerts()
    loadInsights()
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadAlerts()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [contractorId, settings.radius])

  const loadAlerts = useCallback(async () => {
    try {
      // In production, this would fetch from your API
      // For demo, generate sample alerts
      const demoAlerts: NeighborhoodAlert[] = [
        {
          id: '1',
          type: 'cluster',
          area: 'Oak Hill',
          zipCode: '78749',
          streetName: 'Maple Street',
          jobCount: 4,
          avgValue: 425,
          trades: ['Plumbing', 'HVAC'],
          timestamp: new Date(Date.now() - 15 * 60000),
          isPremium: false,
          distanceFromCurrentJob: 0.3
        },
        {
          id: '2',
          type: 'high_activity',
          area: 'Circle C Ranch',
          zipCode: '78748',
          jobCount: 7,
          avgValue: 650,
          trades: ['Roofing', 'Fencing', 'Painting'],
          timestamp: new Date(Date.now() - 45 * 60000),
          isPremium: false
        },
        {
          id: '3',
          type: 'premium',
          area: 'Barton Creek',
          zipCode: '78735',
          streetName: 'Ridge Oak Dr',
          jobCount: 2,
          avgValue: 1200,
          trades: ['Remodeling'],
          timestamp: new Date(Date.now() - 5 * 60000),
          expiresAt: new Date(Date.now() + 10 * 60000),
          isPremium: true,
          distanceFromCurrentJob: 0.5
        },
        {
          id: '4',
          type: 'trend',
          area: 'South Austin',
          zipCode: '78745',
          jobCount: 12,
          avgValue: 380,
          trades: ['HVAC', 'Electrical'],
          timestamp: new Date(Date.now() - 2 * 3600000),
          isPremium: false
        }
      ]
      
      setAlerts(demoAlerts)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [contractorId, settings.radius])

  const loadInsights = useCallback(async () => {
    // Load neighborhood insights (Pro feature)
    const demoInsights: NeighborhoodInsight[] = [
      {
        area: 'Oak Hill',
        zipCode: '78749',
        stats: {
          activeJobs: 23,
          avgBudget: 485,
          topTrades: [
            { trade: 'Plumbing', count: 8 },
            { trade: 'HVAC', count: 6 },
            { trade: 'Electrical', count: 5 }
          ],
          recentGrowth: 15,
          historicalPattern: 'HVAC demand spikes in May-June'
        },
        predictions: {
          expectedJobs: 8,
          bestTime: 'Tuesday-Thursday mornings',
          recommendation: 'High potential for bundled HVAC jobs'
        }
      },
      {
        area: 'Circle C Ranch',
        zipCode: '78748',
        stats: {
          activeJobs: 31,
          avgBudget: 720,
          topTrades: [
            { trade: 'Landscaping', count: 12 },
            { trade: 'Fencing', count: 9 },
            { trade: 'Painting', count: 6 }
          ],
          recentGrowth: 22,
          historicalPattern: 'Exterior work peaks in spring'
        },
        predictions: {
          expectedJobs: 12,
          bestTime: 'Weekday afternoons',
          recommendation: 'New development = new homeowner projects'
        }
      },
      {
        area: 'Mueller',
        zipCode: '78723',
        stats: {
          activeJobs: 18,
          avgBudget: 550,
          topTrades: [
            { trade: 'Smart Home', count: 5 },
            { trade: 'Electrical', count: 5 },
            { trade: 'Painting', count: 4 }
          ],
          recentGrowth: 8,
          historicalPattern: 'Tech-forward homeowners prefer smart upgrades'
        },
        predictions: {
          expectedJobs: 6,
          bestTime: 'Weekends',
          recommendation: 'Focus on smart home installations'
        }
      }
    ]
    
    setInsights(demoInsights)
  }, [contractorId])

  const claimExclusiveWindow = useCallback(async (alertId: string) => {
    if (!isPro) {
      toast.error('Premium alerts require Pro subscription')
      onUpgrade?.()
      return
    }
    
    // In production, this would claim the exclusive window
    toast.success('Exclusive 15-minute window claimed! Jobs revealed.')
    
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isPremium: false } : a
    ))
  }, [isPro, onUpgrade])

  const alertTypeIcon = (type: NeighborhoodAlert['type']) => {
    switch (type) {
      case 'cluster': return <MapPin className="h-4 w-4" />
      case 'high_activity': return <TrendUp className="h-4 w-4" />
      case 'premium': return <Lightning className="h-4 w-4" />
      case 'trend': return <House className="h-4 w-4" />
    }
  }

  const alertTypeLabel = (type: NeighborhoodAlert['type']) => {
    switch (type) {
      case 'cluster': return 'Job Cluster'
      case 'high_activity': return 'High Activity'
      case 'premium': return 'Premium Alert'
      case 'trend': return 'Trending Area'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const formatTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const mins = Math.floor(diff / 60000)
    return `${mins}m left`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BellRinging className="h-5 w-5 text-primary" />
              Neighborhood Job Alerts
            </CardTitle>
            <CardDescription>
              Get notified when jobs cluster near you
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, enabled: checked }))}
            />
            <Label className="text-sm">Alerts</Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights
              {!isPro && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts in your area</p>
                <p className="text-sm">We'll notify you when jobs cluster nearby</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card 
                      key={alert.id} 
                      className={`${alert.isPremium ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={alert.isPremium ? 'default' : 'secondary'} className="gap-1">
                                {alertTypeIcon(alert.type)}
                                {alertTypeLabel(alert.type)}
                              </Badge>
                              {alert.distanceFromCurrentJob !== undefined && (
                                <Badge variant="outline" className="gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.distanceFromCurrentJob.toFixed(1)} mi
                                </Badge>
                              )}
                              {alert.isPremium && alert.expiresAt && (
                                <Badge variant="destructive" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeRemaining(alert.expiresAt)}
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <p className="font-medium">
                                {alert.area}
                                {alert.streetName && !alert.isPremium && (
                                  <span className="text-muted-foreground"> • {alert.streetName}</span>
                                )}
                                {alert.streetName && alert.isPremium && (
                                  <span className="text-muted-foreground"> • ••••••</span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">{alert.zipCode}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <House className="h-4 w-4 text-blue-500" />
                                {alert.jobCount} jobs
                              </span>
                              <span className="flex items-center gap-1">
                                <CurrencyDollar className="h-4 w-4 text-green-500" />
                                ~${alert.avgValue} avg
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {alert.trades.map((trade, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {trade}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-muted-foreground">
                            {formatTimeAgo(alert.timestamp)}
                          </div>
                        </div>
                        
                        {alert.isPremium && (
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              size="sm" 
                              className="w-full gap-2"
                              onClick={() => claimExclusiveWindow(alert.id)}
                            >
                              {isPro ? (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Reveal Address ($5)
                                </>
                              ) : (
                                <>
                                  <Crown className="h-4 w-4" />
                                  Upgrade to Reveal
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-1">
                              15-minute exclusive window before general release
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-3">
            {!isPro ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Pro Insights</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get detailed neighborhood analytics, historical patterns, and job predictions
                  </p>
                  <ul className="text-sm text-left space-y-2 mb-4 max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Exact streets with high activity
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Historical patterns by season
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Predictive job forecasts
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Premium early alerts
                    </li>
                  </ul>
                  <Button onClick={onUpgrade}>
                    Upgrade to Pro - $29/mo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {insights.map((insight, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{insight.area}</h4>
                            <p className="text-sm text-muted-foreground">{insight.zipCode}</p>
                          </div>
                          <Badge variant={insight.stats.recentGrowth > 15 ? 'default' : 'secondary'}>
                            {insight.stats.recentGrowth > 0 ? '+' : ''}{insight.stats.recentGrowth}% growth
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Active Jobs</p>
                            <p className="text-xl font-bold">{insight.stats.activeJobs}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">Avg Budget</p>
                            <p className="text-xl font-bold">${insight.stats.avgBudget}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Top Trades</p>
                          <div className="flex flex-wrap gap-2">
                            {insight.stats.topTrades.map((t, j) => (
                              <Badge key={j} variant="outline">
                                {t.trade} ({t.count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {insight.stats.historicalPattern && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                              Historical Pattern
                            </p>
                            <p className="text-sm">{insight.stats.historicalPattern}</p>
                          </div>
                        )}
                        
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                            Prediction
                          </p>
                          <p className="text-sm">
                            ~{insight.predictions.expectedJobs} jobs expected this week
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Best time: {insight.predictions.bestTime}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            💡 {insight.predictions.recommendation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alert Radius: {settings.radius} miles</Label>
                <Slider
                  value={[settings.radius]}
                  onValueChange={([value]) => setSettings(s => ({ ...s, radius: value }))}
                  min={1}
                  max={25}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Minimum Job Value: ${settings.minJobValue}</Label>
                <Slider
                  value={[settings.minJobValue]}
                  onValueChange={([value]) => setSettings(s => ({ ...s, minJobValue: value }))}
                  min={0}
                  max={1000}
                  step={50}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Morning Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary of neighborhood activity
                  </p>
                </div>
                <Switch
                  checked={settings.morningDigest}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, morningDigest: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    Instant Alerts
                    {!isPro && <Crown className="h-3 w-3 text-yellow-500" />}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Real-time notifications for nearby jobs
                  </p>
                </div>
                <Switch
                  checked={settings.instantAlerts}
                  disabled={!isPro}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, instantAlerts: checked }))}
                />
              </div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => {
              toast.success('Settings saved!')
            }}>
              Save Settings
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default NeighborhoodJobAlerts
