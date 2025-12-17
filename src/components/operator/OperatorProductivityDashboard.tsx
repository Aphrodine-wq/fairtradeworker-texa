import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  NavigationArrow, 
  Package, 
  ChatText, 
  ChartLine, 
  Users,
  Calendar,
  Task,
  MessageCircle,
  CheckCircle
} from '@phosphor-icons/react'
import type { User, Job } from '@/lib/types'
import { RouteBuilder } from '@/components/contractor/RouteBuilder'

interface OperatorProductivityDashboardProps {
  user: User
  jobs: Job[]
  contractors: User[]
}

export function OperatorProductivityDashboard({ user, jobs, contractors }: OperatorProductivityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const territoryJobs = useMemo(() => 
    jobs.filter(j => j.territoryId === user.territoryId),
    [jobs, user.territoryId]
  )

  const activeJobsCount = useMemo(() => 
    territoryJobs.filter(j => j.status === 'in-progress').length,
    [territoryJobs]
  )

  const completedJobsCount = useMemo(() => 
    territoryJobs.filter(j => j.status === 'completed').length,
    [territoryJobs]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Productivity Tools</h2>
          <p className="text-muted-foreground">Manage routes, inventory, and team resources</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Jobs</span>
                  <Calendar size={20} className="text-primary" />
                </div>
                <p className="text-3xl font-bold">{activeJobsCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold">{completedJobsCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Contractors</span>
                  <Users size={20} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold">{contractors.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NavigationArrow size={24} />
                  Quick Route Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize routes for service appointments with multi-stop routing.
                </p>
                <Button variant="outline" className="w-full">
                  Open Route Builder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={24} />
                  Inventory Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track materials and supplies with low stock alerts.
                </p>
                <Button variant="outline" className="w-full">
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteBuilder user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track materials, supplies, and equipment for your territory.
              </p>
              <div className="space-y-3">
                <div className="p-4 border border-black/10 dark:border-white/10 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Common Materials</span>
                    <Badge variant="secondary">In Stock</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Track inventory levels and low stock alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pre-written message templates for common communications with contractors and homeowners.
              </p>
              <div className="space-y-3">
                <div className="p-4 border border-black/10 dark:border-white/10 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <ChatText size={20} />
                    <span className="font-medium">Welcome Message</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Template for new contractor onboarding</p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={20} />
                    <span className="font-medium">Job Assignment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Template for assigning jobs to contractors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Territory-specific metrics, contractor performance, and revenue trends.
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-black/10 dark:border-white/10 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Territory Performance</span>
                    <ChartLine size={20} />
                  </div>
                  <p className="text-sm text-muted-foreground">View detailed analytics and trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
