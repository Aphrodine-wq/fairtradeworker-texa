import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Kanban, TrendUp, CurrencyDollar, ChartLine, Target, Clock, Gear } from "@phosphor-icons/react"
import { EnhancedCRMDashboard } from "./EnhancedCRMDashboard"
import { CRMKanban } from "./CRMKanban"
import { FollowUpSequences } from "./FollowUpSequences"
import { CustomizableCRM } from "./CustomizableCRM"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer } from "@/lib/types"

interface EnhancedCRMProps {
  user: User
}

export function EnhancedCRM({ user }: EnhancedCRMProps) {
  const [customers, , customersLoading] = useKV<CRMCustomer[]>("crm-customers", [])
  
  const { myCustomers, activeCustomers, totalLTV, conversionRate } = useMemo(() => {
    const mine = (customers || []).filter(c => c.contractorId === user.id)
    const active = mine.filter(c => c.status === 'active')
    const ltv = mine.reduce((sum, c) => sum + c.lifetimeValue, 0)
    const completed = mine.filter(c => c.status === 'completed' || c.status === 'advocate').length
    const rate = mine.length > 0 ? (completed / mine.length) * 100 : 0
    
    return {
      myCustomers: mine,
      activeCustomers: active,
      totalLTV: ltv,
      conversionRate: rate
    }
  }, [customers, user.id])

  return (
    <div className="w-full bg-white dark:bg-black">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <Users weight="duotone" size={40} className="text-black dark:text-white" />
              <span className="text-black dark:text-white">CRM</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Manage your customers, track relationships, and grow your business
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Users weight="duotone" size={24} className="text-black dark:text-white mb-2" />
                  <span className="text-3xl font-bold text-black dark:text-white">{myCustomers.length}</span>
                  <span className="text-sm text-muted-foreground mt-1">Total Customers</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Target weight="duotone" size={24} className="text-black dark:text-white mb-2" />
                  <span className="text-3xl font-bold text-black dark:text-white">{activeCustomers.length}</span>
                  <span className="text-sm text-muted-foreground mt-1">Active</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <CurrencyDollar weight="duotone" size={24} className="text-black dark:text-white mb-2" />
                  <span className="text-3xl font-bold text-black dark:text-white">${totalLTV.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground mt-1">Total LTV</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <TrendUp weight="duotone" size={24} className="text-black dark:text-white mb-2" />
                  <span className="text-3xl font-bold text-black dark:text-white">{conversionRate.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground mt-1">Conversion</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <TabsTrigger 
                value="customers" 
                className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                <Users weight="duotone" size={18} />
                <span className="hidden sm:inline">Customers</span>
                <span className="sm:hidden">List</span>
              </TabsTrigger>
              <TabsTrigger 
                value="kanban" 
                className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                <Kanban weight="duotone" size={18} />
                <span className="hidden sm:inline">Kanban</span>
                <span className="sm:hidden">Board</span>
              </TabsTrigger>
              <TabsTrigger 
                value="followups" 
                className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                <Calendar weight="duotone" size={18} />
                <span className="hidden sm:inline">Follow-Ups</span>
                <span className="sm:hidden">Auto</span>
                {!user.isPro && <span className="ml-1">🔒</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="customize" 
                className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
              >
                <Gear weight="duotone" size={18} />
                <span className="hidden sm:inline">Customize</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="mt-6">
              <EnhancedCRMDashboard user={user} />
            </TabsContent>

            <TabsContent value="kanban" className="mt-6">
              <CRMKanban user={user} />
            </TabsContent>

            <TabsContent value="followups" className="mt-6">
              <FollowUpSequences user={user} />
            </TabsContent>

            <TabsContent value="customize" className="mt-6">
              <CustomizableCRM user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
