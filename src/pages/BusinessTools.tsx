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
  Sparkle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface BusinessToolsProps {
  user: User
  onNavigate: (page: string) => void
}

export function BusinessTools({ user, onNavigate }: BusinessToolsProps) {
  const isPro = user?.isPro || false
  const [selectedFreeTool, setSelectedFreeTool] = useState<string | null>(null)
  
  // Free Tools for Contractors
  const contractorFreeTools = [
    {
      id: 'cost-calculator',
      title: 'Job Cost Calculator',
      description: 'Calculate profit margins and hourly rates instantly. Free forever.',
      icon: Calculator,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      status: 'complete',
      category: 'free',
      isFree: true
    },
    {
      id: 'warranty-tracker',
      title: 'Warranty Tracker',
      description: 'Never lose track of warranties you\'ve given. Always free.',
      icon: ShieldCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      status: 'complete',
      category: 'free',
      isFree: true
    },
    {
      id: 'quick-notes',
      title: 'Quick Notes',
      description: 'Capture job details and customer info on the go. Zero cost.',
      icon: Note,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      status: 'complete',
      category: 'free',
      isFree: true
    }
  ]
  
  // Free Tools for Homeowners
  const homeownerFreeTools = [
    {
      id: 'saved-contractors',
      title: 'Saved Contractors',
      description: 'Quick access to your trusted contractors. Free forever.',
      icon: Heart,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      status: 'complete',
      category: 'free',
      isFree: true
    },
    {
      id: 'quick-notes',
      title: 'Quick Notes',
      description: 'Keep track of important project information. Always free.',
      icon: Note,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      status: 'complete',
      category: 'free',
      isFree: true
    },
    {
      id: 'project-budget-calculator',
      title: 'Project Budget Calculator',
      description: 'Estimate costs for home improvement projects. Track your budget and compare contractor bids. Free forever.',
      icon: Calculator,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      status: 'complete',
      category: 'free',
      isFree: true
    },
    {
      id: 'warranty-tracker',
      title: 'Warranty Tracker',
      description: 'Track warranties and guarantees from contractors. Never lose important warranty information. Always free.',
      icon: ShieldCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      status: 'complete',
      category: 'free',
      isFree: true
    }
  ]
  
  // Business Tools (contractor/operator only - all are FREE unless marked PRO)
  const businessTools = user.role === 'contractor' || user.role === 'operator' ? [
    {
      id: 'receptionist',
      title: 'AI Receptionist',
      description: '24/7 AI-powered phone answering service that never misses a call. Automatically answers, transcribes, understands intent, creates private jobs in your CRM, and texts callers with onboarding links. Turns inbound calls into actionable leads with zero manual work. Includes context-aware conversations, calendar sync, and proactive upselling.',
      icon: Phone,
      color: 'text-[#00FF00] dark:text-[#00FF00]',
      bgColor: 'bg-[#00FF00]/10 dark:bg-[#00FF00]/10',
      status: 'new',
      category: 'sales',
      isPro: true,
      priority: 1
    },
    {
      id: 'invoices',
      title: 'Invoice Generator',
      description: 'Create professional invoices in seconds with auto-populated job details, customizable templates, PDF export, recurring billing, partial payment tracking, late fee automation, and smart payment reminders. Track invoice status with real-time updates.',
      icon: Receipt,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'expenses',
      title: 'Expense Tracker',
      description: 'Comprehensive expense management with AI-powered categorization, receipt scanning, tax deduction identification, mileage tracking, vendor management, multi-category reporting, and seamless tax integration for year-end filing.',
      icon: ChartLine,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'tax-helper',
      title: 'Tax Helper',
      description: 'Smart tax assistance with deduction finder, quarterly estimated tax calculator, expense categorization guidance, tax form preparation helpers, year-end summary reports, and integration with popular tax software for seamless filing.',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      status: 'new',
      category: 'finance'
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      description: 'Accept payments via credit cards, ACH transfers, and digital wallets. Track all transactions in real-time, set up payment plans, process partial payments, handle refunds, and get instant notifications when payments are received.',
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'documents',
      title: 'Document Manager',
      description: 'Organize all your business documents with intelligent folder structures, secure cloud storage, version control, quick search, client document sharing, automated backups, and OCR text extraction for easy document retrieval.',
      icon: Folder,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'calendar',
      title: 'Scheduling Calendar',
      description: 'Advanced scheduling with month/week/day views, drag-and-drop appointment management, automated reminders, route optimization, buffer time settings, recurring job scheduling, and sync with external calendars (Google, Outlook).',
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      status: 'enhanced',
      category: 'management'
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      description: 'Centralized communication with real-time messaging, SMS integration, video call scheduling, file sharing, message templates, automated follow-ups, conversation history, and multi-channel customer communication tracking.',
      icon: ChatCircleDots,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'notifications',
      title: 'Notification Center',
      description: 'Smart notification system with customizable filtering, priority levels, read/unread status tracking, notification preferences, email digest options, mobile push notifications, and quiet hours settings.',
      icon: Bell,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'leads',
      title: 'Lead Management',
      description: 'Comprehensive lead management with AI-powered lead scoring, status tracking, automated follow-up scheduling, lead source attribution, conversion analytics, lead nurturing workflows, and integration with your CRM system.',
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      status: 'enhanced',
      category: 'sales'
    },
    {
      id: 'crm',
      title: 'Customer Relationship Manager',
      description: 'Powerful CRM with detailed customer profiles, complete interaction history, Kanban boards, timeline views, customer segmentation, lifetime value tracking, repeat customer identification, and automated customer insights.',
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      status: 'complete',
      category: 'sales'
    },
    {
      id: 'reports',
      title: 'Reporting Suite',
      description: 'Comprehensive business intelligence with financial reports, performance analytics, operational dashboards, profit margin analysis, customer lifetime value reports, seasonal trends, custom report builder, and scheduled email reports.',
      icon: ClipboardText,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      status: 'new',
      category: 'analytics'
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Track materials and supplies with real-time stock levels, automated reorder points, vendor management, cost tracking, inventory valuation, low stock alerts, barcode scanning support, and integration with material ordering.',
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'quality',
      title: 'Quality Assurance',
      description: 'Maintain quality standards with customizable inspection checklists, quality scoring systems, photo documentation, compliance tracking, customer feedback integration, quality trend analysis, and corrective action workflows.',
      icon: CheckCircle,
      color: 'text-lime-600 dark:text-lime-400',
      bgColor: 'bg-lime-50 dark:bg-lime-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'compliance',
      title: 'Compliance Tracker',
      description: 'Never miss a renewal with automated tracking of licenses, insurance policies, permits, certifications, and training requirements. Get expiration reminders, document storage, compliance reports, and regulatory requirement updates.',
      icon: ShieldCheck,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks with custom triggers and actions, multi-step workflows, conditional logic, scheduled automation, email/SMS automation, invoice automation, follow-up sequences, and integration with all platform features.',
      icon: Gear,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950',
      status: 'complete',
      category: 'automation'
    },
    {
      id: 'bid-optimizer',
      title: 'AI Bid Optimizer',
      description: 'Upload past job data → AI analyzes win/loss patterns → suggests optimal prices + auto-places bids. "What-if" simulations included. Stops over/under-bidding (biggest profit killer). Increases win rate 30-50%. Auto-bid runs 24/7.',
      icon: Target,
      color: 'text-[#00FF00] dark:text-[#00FF00]',
      bgColor: 'bg-[#00FF00]/10 dark:bg-[#00FF00]/10',
      status: 'new',
      category: 'sales',
      isPro: true
    },
    {
      id: 'change-order',
      title: 'Change Order Generator',
      description: 'Mid-job discovery? Snap photo → AI scopes extra work → generates change order PDF → homeowner approves digitally. Captures 20-40% more revenue per job from extras. Eliminates disputes with signed approvals. Instant quotes.',
      icon: FileText,
      color: 'text-[#00FF00] dark:text-[#00FF00]',
      bgColor: 'bg-[#00FF00]/10 dark:bg-[#00FF00]/10',
      status: 'new',
      category: 'operations',
      isPro: true
    },
    {
      id: 'crew-dispatcher',
      title: 'Crew Dispatcher',
      description: 'AI assigns jobs to subs by skills/availability/location → SMS schedules → tracks progress with photo check-ins. Scales operations without chaos. Reduces no-shows. Real-time oversight = higher quality.',
      icon: Users,
      color: 'text-[#00FF00] dark:text-[#00FF00]',
      bgColor: 'bg-[#00FF00]/10 dark:bg-[#00FF00]/10',
      status: 'new',
      category: 'operations',
      isPro: true
    },
    {
      id: 'follow-up',
      title: 'Follow-Up Automator',
      description: 'Drag-and-drop sequence builder (SMS/email/in-app) → AI personalizes from transcripts → auto-sends on triggers. Turns "forgotten leads" into wins (most contractors lose 70% here). Personalizes at scale. Frees 10-20 hours/week.',
      icon: Calendar,
      color: 'text-[#00FF00] dark:text-[#00FF00]',
      bgColor: 'bg-[#00FF00]/10 dark:bg-[#00FF00]/10',
      status: 'enhanced',
      category: 'sales',
      isPro: true
    }
  ] : []
  
  // Combine all tools based on role
  const tools = [
    ...(user.role === 'contractor' ? contractorFreeTools : []),
    ...(user.role === 'homeowner' ? homeownerFreeTools : []),
    ...businessTools
  ]

  const categories = [
    { id: 'all', label: 'All Tools', count: tools.length },
    { id: 'free', label: 'Free Tools', count: tools.filter(t => !t.isPro).length },
    { id: 'finance', label: 'Finance', count: tools.filter(t => t.category === 'finance').length },
    { id: 'sales', label: 'Sales & CRM', count: tools.filter(t => t.category === 'sales').length },
    { id: 'management', label: 'Management', count: tools.filter(t => t.category === 'management').length },
    { id: 'operations', label: 'Operations', count: tools.filter(t => t.category === 'operations').length },
    { id: 'analytics', label: 'Analytics', count: tools.filter(t => t.category === 'analytics').length },
    { id: 'automation', label: 'Automation', count: tools.filter(t => t.category === 'automation').length }
  ]

  const handleToolClick = (toolId: string) => {
    // Map tool IDs to actual routes
    const routeMap: Record<string, string> = {
      'receptionist': 'receptionist',
      'invoices': 'invoices',
      'expenses': 'expenses',
      'tax-helper': 'tax-helper',
      'payments': 'payments',
      'documents': 'documents',
      'calendar': 'calendar',
      'communication': 'communication',
      'notifications': 'notifications',
      'leads': 'leads',
      'crm': 'crm',
      'reports': 'reports',
      'inventory': 'inventory',
      'quality': 'quality',
      'compliance': 'compliance',
      'automation': 'crm', // Customize tab in CRM
      'bid-optimizer': 'bid-optimizer',
      'change-order': 'change-order',
      'crew-dispatcher': 'crew-dispatcher',
      'follow-up': 'crm', // Show in CRM
      'lead-import': 'lead-import',
      'quote-builder': 'quote-builder',
      'seasonal-forecast': 'seasonal-forecast',
      'priority-alerts': 'priority-alerts',
      'multi-invoice': 'multi-invoice',
      'bid-analytics': 'bid-analytics',
      'custom-fields': 'custom-fields',
      'export': 'export',
      'client-portal': 'client-portal',
      'profit-calc': 'profit-calc',
      'insurance-verify': 'insurance-verify',
      'pro-filters': 'pro-filters',
      // Free Tools - navigate to free tools page (will be handled by FreeToolsPage component)
      'cost-calculator': 'free-tools',
      'warranty-tracker': 'free-tools',
      'quick-notes': 'free-tools',
      'saved-contractors': 'free-tools',
      'project-budget-calculator': 'free-tools'
    }
    onNavigate(routeMap[toolId] || toolId)
  }

  return (
    <div className="w-full bg-white dark:bg-black min-h-screen p-[1pt]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Lightning weight="duotone" size={48} className="text-black dark:text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
                Business Tools
              </h1>
            </div>
            <p className="text-black dark:text-white text-lg max-w-2xl mx-auto">
              {user.role === 'homeowner' 
                ? 'Free tools to help you manage your home projects'
                : 'All-in-one toolkit for running your business efficiently. Most tools are FREE - only PRO tools require subscription.'
              }
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">{tools.length}</div>
                <div className="text-sm text-black dark:text-white mt-1">Total Tools</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {tools.filter(t => t.status === 'complete').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Complete</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {tools.filter(t => t.status === 'enhanced').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Enhanced</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {tools.filter(t => t.status === 'new').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">New</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-8 bg-white dark:bg-black border border-black/20 dark:border-white/20">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="text-xs md:text-sm"
                >
                  {cat.label} ({cat.count})
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools
                    .filter(tool => {
                      if (category.id === 'all') return true
                      if (category.id === 'free') return !tool.isPro
                      return tool.category === category.id
                    })
                    .map(tool => {
                      const Icon = tool.icon
                      return (
                        <Card
                          key={tool.id}
                          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                          glass={isPro && tool.isPro}
                          onClick={() => handleToolClick(tool.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                                <Icon size={32} weight="duotone" className={tool.color} />
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
                                    tool.status === 'complete' ? 'default' :
                                    tool.status === 'enhanced' ? 'secondary' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {tool.status === 'complete' && '✓ Complete'}
                                  {tool.status === 'enhanced' && '↑ Enhanced'}
                                  {tool.status === 'new' && '✨ New'}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-xl mt-4 text-black dark:text-white">
                              {tool.title}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button className="w-full" variant="outline">
                              Open Tool
                            </Button>
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
    </div>
  )
}