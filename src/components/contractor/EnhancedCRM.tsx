import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Kanban, TrendUp } from "@phosphor-icons/react"
import { CRMDashboard } from "./CRMDashboard"
import { CRMKanban } from "./CRMKanban"
import { FollowUpSequences } from "./FollowUpSequences"
import { useKV } from "@github/spark/hooks"
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users weight="duotone" size={36} className="text-primary" />
          CRM Command Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Your complete customer relationship management hub
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Total Customers</span>
              <span className="text-3xl font-bold text-primary">{myCustomers.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Active</span>
              <span className="text-3xl font-bold text-green-600">{activeCustomers.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Total LTV</span>
              <span className="text-3xl font-bold text-amber-600">${totalLTV.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Repeat Rate</span>
              <span className="text-3xl font-bold text-purple-600">{repeatRate.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users weight="duotone" />
            Customer List
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban weight="duotone" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Calendar weight="duotone" />
            Follow-Ups {!user.isPro && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <CRMDashboard user={user} />
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <CRMKanban user={user} />
        </TabsContent>

        <TabsContent value="sequences" className="mt-6">
          <FollowUpSequences user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
