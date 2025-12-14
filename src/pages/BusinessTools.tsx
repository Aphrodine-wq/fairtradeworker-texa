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
  Lightning
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface BusinessToolsProps {
  user: User
  onNavigate: (page: string) => void
}

export function BusinessTools({ user, onNavigate }: BusinessToolsProps) {
  const tools = [
    {
      id: 'invoices',
      title: 'Invoice Generator',
      description: 'Professional invoices with PDF export',
      icon: Receipt,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'expenses',
      title: 'Expense Tracker',
      description: 'Categories, reports, tax integration',
      icon: ChartLine,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'tax-helper',
      title: 'Tax Helper',
      description: 'Deductions, forms, filing assistance',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
      status: 'new',
      category: 'finance'
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      description: 'Multiple payment methods, transaction tracking',
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      status: 'complete',
      category: 'finance'
    },
    {
      id: 'documents',
      title: 'Document Manager',
      description: 'Folder organization, file uploads, sharing',
      icon: Folder,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'calendar',
      title: 'Scheduling Calendar',
      description: 'Month/week/day views, appointment management',
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      status: 'enhanced',
      category: 'management'
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      description: 'Real-time messaging, video calls, file sharing',
      icon: ChatCircleDots,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'notifications',
      title: 'Notification Center',
      description: 'Filtering, priority levels, read/unread status',
      icon: Bell,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      status: 'new',
      category: 'management'
    },
    {
      id: 'leads',
      title: 'Lead Management',
      description: 'Lead scoring, status tracking, follow-up scheduling',
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      status: 'enhanced',
      category: 'sales'
    },
    {
      id: 'crm',
      title: 'Customer Relationship Manager',
      description: 'Customer profiles, interaction history',
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      status: 'complete',
      category: 'sales'
    },
    {
      id: 'reports',
      title: 'Reporting Suite',
      description: 'Financial, performance, operational reports',
      icon: ClipboardText,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      status: 'new',
      category: 'analytics'
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Materials tracking, stock levels, reorder points',
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'quality',
      title: 'Quality Assurance',
      description: 'Inspections, scoring, compliance tracking',
      icon: CheckCircle,
      color: 'text-lime-600 dark:text-lime-400',
      bgColor: 'bg-lime-50 dark:bg-lime-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'compliance',
      title: 'Compliance Tracker',
      description: 'Licenses, insurance, permits, certifications',
      icon: ShieldCheck,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950',
      status: 'new',
      category: 'operations'
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Task automation, triggers, actions',
      icon: Gear,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950',
      status: 'complete',
      category: 'automation'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Tools', count: tools.length },
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
      'automation': 'crm' // Customize tab in CRM
    }
    onNavigate(routeMap[toolId] || toolId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Lightning weight="duotone" size={48} className="text-black dark:text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
                Business Tools
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All-in-one toolkit for running your contracting business efficiently
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">{tools.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Tools</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {tools.filter(t => t.status === 'complete').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Complete</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {tools.filter(t => t.status === 'enhanced').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Enhanced</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
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
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-7 bg-white dark:bg-black border border-black/10 dark:border-white/10">
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
                    .filter(tool => category.id === 'all' || tool.category === category.id)
                    .map(tool => {
                      const Icon = tool.icon
                      return (
                        <Card
                          key={tool.id}
                          className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 bg-white dark:bg-black"
                          onClick={() => handleToolClick(tool.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                                <Icon size={32} weight="duotone" className={tool.color} />
                              </div>
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