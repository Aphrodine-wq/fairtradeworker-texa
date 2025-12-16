/**
 * Deep Integration Demo Page
 * Showcases the integrated system with sample workflow
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { UnifiedCustomerProfile } from "@/components/contractor/UnifiedCustomerProfile"
import { IntegratedScheduler } from "@/components/contractor/IntegratedScheduler"
import { QuickNotes } from "@/components/contractor/QuickNotes"
import { OwnerDashboard } from "@/components/contractor/OwnerDashboard"
import { ProjectManagerDashboard } from "@/components/contractor/ProjectManagerDashboard"
import { FieldLeadDashboard } from "@/components/contractor/FieldLeadDashboard"
import { ProactiveBusinessIntelligence } from "@/components/contractor/ProactiveBusinessIntelligence"
import { PredictiveInventory } from "@/components/contractor/PredictiveInventory"
import { AIEnhancedFollowUp } from "@/components/contractor/AIEnhancedFollowUp"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Sparkle, Users, Calendar, Note, ChartLine, 
  Package, DeviceMobile, ArrowRight, CheckCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface DeepIntegrationDemoProps {
  user: User
}

export function DeepIntegrationDemo({ user }: DeepIntegrationDemoProps) {
  const [activeView, setActiveView] = useState<'owner' | 'manager' | 'field'>('owner')
  const [showCustomerProfile, setShowCustomerProfile] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customers] = useKV<any[]>("crm-customers", [])

  const sampleCustomer = customers?.[0]

  const workflowSteps = [
    {
      icon: <DeviceMobile className="w-6 h-6" />,
      title: "AI Receptionist Call",
      description: "Customer calls about leaky faucet. AI captures details and creates lead.",
      status: "completed"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "CRM Auto-Population",
      description: "Lead automatically added to CRM with call transcript and urgency score.",
      status: "completed"
    },
    {
      icon: <Note className="w-6 h-6" />,
      title: "Notification & Assignment",
      description: "Owner receives push notification: 'New High-Urgency Lead: Leaky Faucet'",
      status: "completed"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule & Crew Assignment",
      description: "Owner drags job to calendar and assigns best-placed plumber.",
      status: "in-progress"
    },
    {
      icon: <DeviceMobile className="w-6 h-6" />,
      title: "Auto SMS to Crew",
      description: "SMS sent to plumber with job details and check-in link.",
      status: "pending"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Complete Integration",
      description: "10-minute admin task becomes 10-second review and click.",
      status: "pending"
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-t-purple-500">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Deep Integration & Single Source of Truth</CardTitle>
              <CardDescription>
                A unified system where every tool is connected and data flows automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Sample Integrated Workflow: The Leaky Faucet Call</h3>
            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in-progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'}
                  `}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Dashboards */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Customizable Role-Based Dashboards</CardTitle>
          <CardDescription>Different views for Owner, Project Manager, and Field Lead</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="owner">Owner Dashboard</TabsTrigger>
              <TabsTrigger value="manager">Project Manager</TabsTrigger>
              <TabsTrigger value="field">Field Lead</TabsTrigger>
            </TabsList>
            
            <TabsContent value="owner" className="mt-6">
              <OwnerDashboard user={user} />
            </TabsContent>
            
            <TabsContent value="manager" className="mt-6">
              <ProjectManagerDashboard user={user} />
            </TabsContent>
            
            <TabsContent value="field" className="mt-6">
              <FieldLeadDashboard user={user} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unified Customer Profile */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Unified Customer Profile
            </CardTitle>
            <CardDescription>
              Single view with timeline, documents, financials, and schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Click on any customer to see a complete dashboard with all interactions, documents, 
              financial data, and scheduled jobs in one place.
            </p>
            {sampleCustomer && (
              <Button onClick={() => {
                setSelectedCustomerId(sampleCustomer.id)
                setShowCustomerProfile(true)
              }}>
                View Sample Customer Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Integrated Scheduler */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Integrated Scheduler
            </CardTitle>
            <CardDescription>
              Drag-drop scheduling with crew assignment and auto-SMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Drag jobs to calendar dates, assign crews with one click, and automatically send 
              SMS notifications with job details.
            </p>
          </CardContent>
        </Card>

        {/* Quick Notes */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Note className="w-5 h-5" />
              Quick Notes System
            </CardTitle>
            <CardDescription>
              Field-to-office notes with job tagging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Notes like "Client asked about hardwood floor option" are logged to the job's 
              timeline and can create follow-up tasks.
            </p>
          </CardContent>
        </Card>

        {/* AI Business Intelligence */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-purple-500" />
              AI Business Intelligence
            </CardTitle>
            <CardDescription>
              Proactive insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              AI analyzes your data to provide insights like: "Your profit margins on bathroom 
              remodels are 15% higher than kitchen remodels."
            </p>
          </CardContent>
        </Card>

        {/* Predictive Inventory */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Predictive Inventory
            </CardTitle>
            <CardDescription>
              Forecast needs based on scheduled jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              "You have 3 kitchen remodels scheduled next month. Current lumber inventory is 
              insufficient." - Proactive alerts prevent delays.
            </p>
          </CardContent>
        </Card>

        {/* AI Follow-Up */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DeviceMobile className="w-5 h-5" />
              AI-Enhanced Follow-Up
            </CardTitle>
            <CardDescription>
              Intelligent sequences based on call analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              AI analyzes receptionist call transcripts for urgency and intent, then triggers 
              personalized follow-up sequences automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Demos */}
      <Tabs defaultValue="scheduler" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="notes">Quick Notes</TabsTrigger>
          <TabsTrigger value="intelligence">AI Insights</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="followup">Follow-Up</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduler">
          <IntegratedScheduler user={user} />
        </TabsContent>

        <TabsContent value="notes">
          <QuickNotes user={user} />
        </TabsContent>

        <TabsContent value="intelligence">
          <ProactiveBusinessIntelligence user={user} />
        </TabsContent>

        <TabsContent value="inventory">
          <PredictiveInventory user={user} />
        </TabsContent>

        <TabsContent value="followup">
          <AIEnhancedFollowUp user={user} />
        </TabsContent>
      </Tabs>

      {/* Customer Profile Dialog/Overlay */}
      {showCustomerProfile && selectedCustomerId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto">
          <div className="bg-white w-full max-w-7xl m-4 rounded-lg shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Customer Profile</h2>
              <Button variant="outline" onClick={() => setShowCustomerProfile(false)}>
                Close
              </Button>
            </div>
            <UnifiedCustomerProfile 
              customerId={selectedCustomerId} 
              user={user}
              onClose={() => setShowCustomerProfile(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
