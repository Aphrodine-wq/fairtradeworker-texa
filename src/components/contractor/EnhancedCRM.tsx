import { useMemo, useEffect, useState } from "react"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, Calendar, Kanban, TrendUp, CurrencyDollar, ChartLine, Target, Clock, Gear,
  Brain, BarChart, Plug, Shield, MapTrifold, FlowArrow, PuzzlePiece, Database, DeviceMobile,
  Funnel, FileText, Calculator, Users as UsersIcon
} from "@phosphor-icons/react"
import { EnhancedCRMDashboard } from "./EnhancedCRMDashboard"
import { CRMKanban } from "./CRMKanban"
import { FollowUpSequences } from "./FollowUpSequences"
import { CustomizableCRM } from "./CustomizableCRM"
import { AIInsightsCRM } from "./AIInsightsCRM"
import { AdvancedAnalyticsCRM } from "./AdvancedAnalyticsCRM"
import { IntegrationHub } from "./IntegrationHub"
import { EnterpriseSecurity } from "./EnterpriseSecurity"
import { TerritoryManager } from "./TerritoryManager"
import { AdvancedWorkflows } from "./AdvancedWorkflows"
import { CustomObjectsBuilder } from "./CustomObjectsBuilder"
import { DataWarehouse } from "./DataWarehouse"
import { MobileCRM } from "./MobileCRM"
import { ConstructionPipeline } from "./ConstructionPipeline"
import { ConstructionDocuments } from "./ConstructionDocuments"
import { ConstructionFinancials } from "./ConstructionFinancials"
import { ConstructionCollaboration } from "./ConstructionCollaboration"
import { ConstructionReporting } from "./ConstructionReporting"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer } from "@/lib/types"

interface EnhancedCRMProps {
  user: User
}

export function EnhancedCRM({ user }: EnhancedCRMProps) {
  const [customers, , customersLoading] = useKV<CRMCustomer[]>("crm-customers", [])
  const [isInitializing, setIsInitializing] = useState(true)
  
  useEffect(() => {
    if (!customersLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [customersLoading])
  
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
              Construction CRM: Manage projects, bids, documents, finances, and team collaboration
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
          {isInitializing ? (
            <div className="space-y-6">
              <SkeletonLoader variant="text" className="h-8 w-64" />
              <SkeletonLoader variant="card" className="h-32" />
              <SkeletonLoader variant="card" className="h-32" />
              <SkeletonLoader variant="card" className="h-32" />
            </div>
          ) : (
            <Tabs defaultValue="pipeline" className="w-full">
              <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 p-4 rounded-lg">
                <TabsTrigger 
                  value="pipeline" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Funnel weight="duotone" size={20} />
                  <span className="hidden lg:inline">Pipeline</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <FileText weight="duotone" size={20} />
                  <span className="hidden lg:inline">Documents</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financials" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Calculator weight="duotone" size={20} />
                  <span className="hidden lg:inline">Financials</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="collaboration" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <UsersIcon weight="duotone" size={20} />
                  <span className="hidden lg:inline">Team</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reporting" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <ChartLine weight="duotone" size={20} />
                  <span className="hidden lg:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Users weight="duotone" size={20} />
                  <span className="hidden lg:inline">Customers</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="kanban" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Kanban weight="duotone" size={20} />
                  <span className="hidden lg:inline">Kanban</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="followups" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Calendar weight="duotone" size={20} />
                  <span className="hidden lg:inline">Follow-Ups</span>
                  {!user.isPro && <span className="ml-1">🔒</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Brain weight="duotone" size={20} />
                  <span className="hidden lg:inline">AI Insights</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <BarChart weight="duotone" size={20} />
                  <span className="hidden lg:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Plug weight="duotone" size={20} />
                  <span className="hidden lg:inline">Integrations</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Shield weight="duotone" size={20} />
                  <span className="hidden lg:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="territories" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <MapTrifold weight="duotone" size={20} />
                  <span className="hidden lg:inline">Territories</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="workflows" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <FlowArrow weight="duotone" size={20} />
                  <span className="hidden lg:inline">Workflows</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customize" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Gear weight="duotone" size={20} />
                  <span className="hidden lg:inline">Customize</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="objects" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <PuzzlePiece weight="duotone" size={20} />
                  <span className="hidden lg:inline">Objects</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="warehouse" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <Database weight="duotone" size={20} />
                  <span className="hidden lg:inline">Warehouse</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="mobile" 
                  className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 text-base md:text-lg font-medium rounded-md data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
                >
                  <DeviceMobile weight="duotone" size={20} />
                  <span className="hidden lg:inline">Mobile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pipeline" className="mt-6">
                <ConstructionPipeline user={user} />
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <ConstructionDocuments user={user} />
              </TabsContent>

              <TabsContent value="financials" className="mt-6">
                <ConstructionFinancials user={user} />
              </TabsContent>

              <TabsContent value="collaboration" className="mt-6">
                <ConstructionCollaboration user={user} />
              </TabsContent>

              <TabsContent value="reporting" className="mt-6">
                <ConstructionReporting user={user} />
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                <EnhancedCRMDashboard user={user} />
              </TabsContent>

              <TabsContent value="kanban" className="mt-6">
                <CRMKanban user={user} />
              </TabsContent>

              <TabsContent value="followups" className="mt-6">
                <FollowUpSequences user={user} />
              </TabsContent>

              <TabsContent value="ai" className="mt-6">
                <AIInsightsCRM user={user} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AdvancedAnalyticsCRM user={user} />
              </TabsContent>

              <TabsContent value="integrations" className="mt-6">
                <IntegrationHub user={user} />
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <EnterpriseSecurity user={user} />
              </TabsContent>

              <TabsContent value="territories" className="mt-6">
                <TerritoryManager user={user} />
              </TabsContent>

              <TabsContent value="workflows" className="mt-6">
                <AdvancedWorkflows user={user} />
              </TabsContent>

              <TabsContent value="customize" className="mt-6">
                <CustomizableCRM user={user} />
              </TabsContent>

              <TabsContent value="objects" className="mt-6">
                <CustomObjectsBuilder user={user} />
              </TabsContent>

              <TabsContent value="warehouse" className="mt-6">
                <DataWarehouse user={user} />
              </TabsContent>

              <TabsContent value="mobile" className="mt-6">
                <MobileCRM user={user} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
