import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Receipt,
  ChartLine,
  FileText,
  CreditCard,
  Folder,
  Calendar,
  ChatCircleDots,
  Bell,
  Users,
  ClipboardText,
  Package,
  ShieldCheck,
  CheckCircle,
  Gear,
  Lightning,
  Phone,
  Target,
  Calculator,
  Note,
  Heart,
  Microphone,
  MapPin,
  Swap,
  Ruler,
  WifiSlash,
  Image,
  CalendarDots,
  Crown,
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { HeroSection, StatsSection, GlassCard } from "@/components/ui/MarketingSections"
import { cn } from "@/lib/utils"

interface BusinessToolsProps {
  user: User
  onNavigate: (page: string) => void
}

export function BusinessTools({ user, onNavigate }: BusinessToolsProps) {
  const isPro = user?.isPro || false
  const [selectedFreeTool, setSelectedFreeTool] = useState<string | null>(null)

  const contractorFreeTools = [
    { id: "cost-calculator", title: "Job Cost Calculator", description: "Calculate profit margins and hourly rates instantly. Free forever.", icon: Calculator, status: "complete", category: "free", isFree: true },
    { id: "warranty-tracker", title: "Warranty Tracker", description: "Never lose track of warranties you've given. Always free.", icon: ShieldCheck, status: "complete", category: "free", isFree: true },
    { id: "quick-notes", title: "Quick Notes", description: "Capture job details and customer info on the go. Zero cost.", icon: Note, status: "complete", category: "free", isFree: true },
  ]

  const homeownerFreeTools = [
    { id: "saved-contractors", title: "Saved Contractors", description: "Quick access to your trusted contractors. Free forever.", icon: Heart, status: "complete", category: "free", isFree: true },
    { id: "quick-notes", title: "Quick Notes", description: "Keep track of project info. Always free.", icon: Note, status: "complete", category: "free", isFree: true },
    { id: "project-budget-calculator", title: "Project Budget Calculator", description: "Estimate costs and compare bids. Free forever.", icon: Calculator, status: "complete", category: "free", isFree: true },
    { id: "warranty-tracker", title: "Warranty Tracker", description: "Track warranties and guarantees from contractors. Always free.", icon: ShieldCheck, status: "complete", category: "free", isFree: true },
  ]

  const businessTools = user.role === "contractor" || user.role === "operator"
    ? [
        { id: "receptionist", title: "AI Receptionist", description: "24/7 AI phone answering with lead capture and CRM sync.", icon: Phone, status: "new", category: "sales", isPro: true },
        { id: "invoices", title: "Invoice Generator", description: "Auto-populated invoices, recurring billing, late fees, and reminders.", icon: Receipt, status: "complete", category: "finance" },
        { id: "expenses", title: "Expense Tracker", description: "AI categorization, receipt scan, mileage, vendor management, tax prep.", icon: ChartLine, status: "complete", category: "finance" },
        { id: "tax-helper", title: "Tax Helper", description: "Deduction finder, quarterly estimates, prep helpers, year-end reports.", icon: FileText, status: "new", category: "finance" },
        { id: "payments", title: "Payment Processing", description: "Cards/ACH/wallets, payment plans, refunds, realtime tracking.", icon: CreditCard, status: "complete", category: "finance" },
        { id: "documents", title: "Document Manager", description: "Structured storage, versioning, OCR, sharing, backups.", icon: Folder, status: "new", category: "management" },
        { id: "calendar", title: "Scheduling Calendar", description: "Drag/drop scheduling, reminders, routes, recurring jobs, sync.", icon: Calendar, status: "enhanced", category: "management" },
        { id: "communication", title: "Communication Hub", description: "Messaging, SMS, video scheduling, templates, follow-ups.", icon: ChatCircleDots, status: "new", category: "management" },
        { id: "notifications", title: "Notification Center", description: "Smart filters, priority, digests, push, quiet hours.", icon: Bell, status: "new", category: "management" },
        { id: "leads", title: "Lead Management", description: "AI lead scoring, follow-ups, attribution, conversion analytics.", icon: Users, status: "enhanced", category: "sales" },
        { id: "crm", title: "Customer Relationship Manager", description: "Profiles, history, boards, segments, LTV, insights.", icon: Users, status: "complete", category: "sales" },
        { id: "reports", title: "Reporting Suite", description: "Financials, ops, BI, CLV, seasonal trends, scheduled emails.", icon: ClipboardText, status: "new", category: "analytics" },
        { id: "inventory", title: "Inventory Management", description: "Stock levels, reorder points, vendor mgmt, valuation, alerts.", icon: Package, status: "new", category: "operations" },
        { id: "quality", title: "Quality Assurance", description: "Checklists, scoring, photos, compliance, trend analysis.", icon: CheckCircle, status: "new", category: "operations" },
        { id: "compliance", title: "Compliance Tracker", description: "Licenses, insurance, permits, reminders, storage, reports.", icon: ShieldCheck, status: "new", category: "operations" },
        { id: "automation", title: "Workflow Automation", description: "Triggers/actions, multi-step flows, conditional logic, scheduling.", icon: Gear, status: "complete", category: "automation" },
        { id: "bid-optimizer", title: "AI Bid Optimizer", description: "Analyze wins/losses → optimal pricing + auto-bid with guardrails.", icon: Target, status: "new", category: "sales", isPro: true },
        { id: "change-order", title: "Change Order Generator", description: "Photo → AI scope → PDF change order → digital approval.", icon: FileText, status: "new", category: "operations", isPro: true },
        { id: "crew-dispatcher", title: "Crew Dispatcher", description: "Assign subs by skill/availability/location + SMS check-ins.", icon: Users, status: "new", category: "operations", isPro: true },
        { id: "follow-up", title: "Follow-Up Automator", description: "Sequences with AI personalization from transcripts; boosts win rate.", icon: Calendar, status: "enhanced", category: "sales", isPro: true },
        // New Zero-Cost Defensible Features
        { id: "voice-bids", title: "Voice Bid Recorder", description: "Record voice bids, AI extracts price/timeline/materials automatically.", icon: Microphone, status: "new", category: "sales" },
        { id: "neighborhood-alerts", title: "Neighborhood Job Alerts", description: "Get alerts when multiple jobs cluster in your area - route efficiently.", icon: MapPin, status: "new", category: "sales" },
        { id: "skill-trading", title: "Skill Trading Marketplace", description: "Barter skills with other contractors using trade credits.", icon: Swap, status: "new", category: "operations" },
        { id: "material-calc", title: "Smart Material Calculator", description: "AI estimates materials from room dimensions or photos.", icon: Ruler, status: "new", category: "operations" },
        { id: "offline-mode", title: "Offline Field Mode", description: "Work offline on job sites - photos, notes, checklists sync later.", icon: WifiSlash, status: "new", category: "operations" },
        { id: "project-stories", title: "Project Story Generator", description: "Auto-generate shareable before/after stories for social media.", icon: Image, status: "new", category: "sales" },
        { id: "seasonal-clubs", title: "Seasonal Maintenance Clubs", description: "Bid on neighborhood group maintenance - guaranteed volume.", icon: CalendarDots, status: "new", category: "sales" },
      ]
    : []

  const tools = [
    ...(user.role === "contractor" ? contractorFreeTools : []),
    ...(user.role === "homeowner" ? homeownerFreeTools : []),
    ...businessTools,
  ]

  const categories = [
    { id: "all", label: "All Tools", count: tools.length },
    { id: "free", label: "Free Tools", count: tools.filter((t) => !t.isPro).length },
    { id: "pro", label: "Pro Tools", count: tools.filter((t) => t.isPro).length },
    { id: "finance", label: "Finance", count: tools.filter((t) => t.category === "finance").length },
    { id: "sales", label: "Sales & CRM", count: tools.filter((t) => t.category === "sales").length },
    { id: "management", label: "Management", count: tools.filter((t) => t.category === "management").length },
    { id: "operations", label: "Operations", count: tools.filter((t) => t.category === "operations").length },
    { id: "analytics", label: "Analytics", count: tools.filter((t) => t.category === "analytics").length },
    { id: "automation", label: "Automation", count: tools.filter((t) => t.category === "automation").length },
  ]

  const handleToolClick = (toolId: string) => {
    const routeMap: Record<string, string> = {
      receptionist: "receptionist",
      invoices: "invoices",
      expenses: "expenses",
      "tax-helper": "tax-helper",
      payments: "payments",
      documents: "documents",
      calendar: "calendar",
      communication: "communication",
      notifications: "notifications",
      leads: "leads",
      crm: "crm",
      reports: "reports",
      inventory: "inventory",
      quality: "quality",
      compliance: "compliance",
      automation: "automation",
      "bid-optimizer": "bid-optimizer",
      "change-order": "change-order",
      "crew-dispatcher": "crew-dispatcher",
      "follow-up": "crm",
      "lead-import": "lead-import",
      "quote-builder": "quote-builder",
      "seasonal-forecast": "seasonal-forecast",
      "priority-alerts": "priority-alerts",
      "multi-invoice": "multi-invoice",
      "bid-analytics": "bid-analytics",
      "custom-fields": "custom-fields",
      export: "export",
      "client-portal": "client-portal",
      "profit-calc": "profit-calc",
      "insurance-verify": "insurance-verify",
      "pro-filters": "pro-filters",
      "cost-calculator": "free-tools",
      "warranty-tracker": "free-tools",
      "quick-notes": "free-tools",
      "saved-contractors": "free-tools",
      "project-budget-calculator": "free-tools",
      // New Zero-Cost Defensible Features
      "voice-bids": "voice-bids",
      "neighborhood-alerts": "neighborhood-alerts",
      "skill-trading": "skill-trading",
      "material-calc": "material-calc",
      "offline-mode": "offline-mode",
      "project-stories": "project-stories",
      "seasonal-clubs": "seasonal-clubs",
    }
    onNavigate(routeMap[toolId] || toolId)
  }

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <HeroSection
          title="All-in-one toolkit for contractors and operators"
          subtitle="Finance, CRM, operations, and automation—most tools are free; PRO unlocks AI-powered growth."
          primaryAction={{ label: "Open free tools", onClick: () => onNavigate("free-tools") }}
          secondaryAction={{ label: "View automation", onClick: () => onNavigate("automation") }}
        />

        <StatsSection
          stats={[
            { label: "Total Tools", value: String(tools.length), icon: Lightning },
            { label: "Free Tools", value: String(tools.filter((t) => !t.isPro).length), icon: Heart },
            { label: "PRO Automations", value: String(tools.filter((t) => t.isPro).length), icon: Gear },
            { label: "Categories", value: String(categories.length), icon: ClipboardText },
          ]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{tools.length}</div>
            <div className="text-sm text-muted-foreground">Total tools</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{tools.filter((t) => t.status === "complete").length}</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{tools.filter((t) => t.status === "enhanced").length}</div>
            <div className="text-sm text-muted-foreground">Enhanced</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{tools.filter((t) => t.status === "new").length}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </GlassCard>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 p-2">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs md:text-sm px-4 py-2">
                {cat.label} ({cat.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools
                  .filter((tool) => {
                    if (category.id === "all") return true
                    if (category.id === "free") return !tool.isPro
                    if (category.id === "pro") return tool.isPro
                    return tool.category === category.id
                  })
                  .map((tool) => {
                    const Icon = tool.icon
                    return (
                      <Card
                        key={tool.id}
                        className={cn(
                          "hover:shadow-lg transition-all cursor-pointer",
                          tool.isPro && "bg-green-50/30 dark:bg-green-950/20"
                        )}
                        onClick={() => handleToolClick(tool.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={cn(
                              "p-3 rounded-lg",
                              tool.isPro ? "bg-green-100/50 dark:bg-green-900/30" : "bg-white/60 dark:bg-black/40"
                            )}>
                              <Icon size={32} weight="duotone" />
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              {tool.isPro ? (
                                <Badge variant="default" className="text-xs bg-[#00FF00] text-black">
                                  PRO
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-600 dark:text-green-400">
                                  FREE
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  tool.status === "complete" ? "default" : tool.status === "enhanced" ? "secondary" : "outline"
                                }
                                className="text-xs"
                              >
                                {tool.status === "complete" && "✓ Complete"}
                                {tool.status === "enhanced" && "↑ Enhanced"}
                                {tool.status === "new" && "✨ New"}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-xl mt-4">{tool.title}</CardTitle>
                          <CardDescription className="text-base mt-2">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {tool.isPro && !isPro ? (
                            <Button 
                              className="w-full" 
                              onClick={(e) => {
                                e.stopPropagation()
                                onNavigate("pro-upgrade")
                              }}
                            >
                              <Crown size={16} className="mr-2" weight="fill" />
                              Upgrade to Access
                            </Button>
                          ) : (
                            <Button className="w-full" variant="outline">
                              Open Tool
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
