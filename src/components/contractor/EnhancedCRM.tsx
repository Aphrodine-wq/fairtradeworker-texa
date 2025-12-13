import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Kanban, TrendUp } from "@phosphor-icons/react"
import { EnhancedCRMDashboard } from "./EnhancedCRMDashboard"
import { CRMKanban } from "./CRMKanban"
import { FollowUpSequences } from "./FollowUpSequences"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer } from "@/lib/types"

interface EnhancedCRMProps {
  user: User
}

export function EnhancedCRM({ user }: EnhancedCRMProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  
  const { myCustomers, activeCustomers, totalLTV, repeatRate } = useMemo(() => {
    const mine = (customers || []).filter(c => c.contractorId === user.id)
    const active = mine.filter(c => c.status === 'active')
    const ltv = mine.reduce((sum, c) => sum + c.lifetimeValue, 0)
    const rate = mine.filter(c => c.status === 'completed' || c.status === 'advocate').length / Math.max(mine.length, 1) * 100
    
    return {
      myCustomers: mine,
      activeCustomers: active,
      totalLTV: ltv,
      repeatRate: rate
    }
  }, [customers, user.id])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-3">
              <Users weight="duotone" size={40} className="text-primary" />
              CRM Command Center
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your complete customer relationship management hub
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-muted-foreground mb-2">Total Customers</span>
                  <span className="text-4xl font-bold text-primary">{myCustomers.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-muted-foreground mb-2">Active</span>
                  <span className="text-4xl font-bold text-green-600">{activeCustomers.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-muted-foreground mb-2">Total LTV</span>
                  <span className="text-4xl font-bold text-amber-600">${totalLTV.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-muted-foreground mb-2">Repeat Rate</span>
                  <span className="text-4xl font-bold text-purple-600">{repeatRate.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="list" className="w-full max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users weight="duotone" size={18} />
                <span className="hidden sm:inline">Customer List</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban weight="duotone" size={18} />
                <span className="hidden sm:inline">Kanban Board</span>
                <span className="sm:hidden">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="sequences" className="flex items-center gap-2">
                <Calendar weight="duotone" size={18} />
                <span className="hidden sm:inline">Follow-Ups {!user.isPro && '🔒'}</span>
                <span className="sm:hidden">Follow-Ups {!user.isPro && '🔒'}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-8">
              <EnhancedCRMDashboard user={user} />
            </TabsContent>

            <TabsContent value="kanban" className="mt-8">
              <CRMKanban user={user} />
            </TabsContent>

            <TabsContent value="sequences" className="mt-8">
              <FollowUpSequences user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
