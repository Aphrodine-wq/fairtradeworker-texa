import { useMemo, useEffect, useState } from "react"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, Calendar, Kanban, TrendUp, CurrencyDollar, ChartLine, Target, Clock, Gear,
  Brain, BarChart, Plug, Shield, MapTrifold, FlowArrow, PuzzlePiece, Database, DeviceMobile,
  Funnel, FileText, Calculator, Users as UsersIcon
} from "@phosphor-icons/react"
import { SimpleCRMDashboard } from "./SimpleCRMDashboard"
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

  if (customersLoading) {
    return (
      <div className="w-full bg-white dark:bg-black py-12 text-center text-muted-foreground">
        Loading CRM…
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-black">
      <SimpleCRMDashboard user={user} />
    </div>
  )
}
