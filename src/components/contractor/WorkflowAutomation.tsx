import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Gear, Play, Pause, CheckCircle, Clock, Zap, 
  Receipt, Users, ChatCircle, MagnifyingGlass,
  Envelope, CurrencyDollar, Tag, Calendar
} from "@phosphor-icons/react"
import { AutomationRunner } from "./AutomationRunner"
import type { User } from "@/lib/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface WorkflowAutomationProps {
  user: User
}

interface Automation {
  id: string
  name: string
  description: string
  category: 'invoice' | 'customer' | 'follow-up'
  status: 'active' | 'paused'
  lastRun: string
  icon: typeof Receipt
}

export function WorkflowAutomation({ user }: WorkflowAutomationProps) {
  const [automationsEnabled, setAutomationsEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    invoice: true,
    customer: true,
    'follow-up': true,
  })

  const automationFeatures: Automation[] = [
    {
      id: 'follow-ups',
      name: 'Follow-Up Sequences',
      description: 'Automatically send follow-up messages based on triggers',
      category: 'follow-up',
      status: 'active',
      lastRun: '2 minutes ago',
      icon: Envelope
    },
    {
      id: 'invoice-reminders',
      name: 'Invoice Reminders',
      description: 'Send reminders for overdue invoices',
      category: 'invoice',
      status: 'active',
      lastRun: '5 minutes ago',
      icon: Receipt
    },
    {
      id: 'late-fees',
      name: 'Late Fee Application',
      description: 'Automatically apply late fees to overdue invoices',
      category: 'invoice',
      status: 'active',
      lastRun: '10 minutes ago',
      icon: CurrencyDollar
    },
    {
      id: 'recurring-invoices',
      name: 'Recurring Invoices',
      description: 'Generate recurring invoices on schedule',
      category: 'invoice',
      status: 'active',
      lastRun: '1 hour ago',
      icon: Calendar
    },
    {
      id: 'customer-tags',
      name: 'Auto Customer Tagging',
      description: 'Automatically tag customers based on behavior',
      category: 'customer',
      status: 'active',
      lastRun: '15 minutes ago',
      icon: Tag
    }
  ]

  const automationGroups = {
    invoice: {
      label: 'Invoice & Payments',
      icon: Receipt,
      automations: automationFeatures.filter(a => a.category === 'invoice')
    },
    customer: {
      label: 'Customer Management',
      icon: Users,
      automations: automationFeatures.filter(a => a.category === 'customer')
    },
    'follow-up': {
      label: 'Follow-Up & Communication',
      icon: ChatCircle,
      automations: automationFeatures.filter(a => a.category === 'follow-up')
    }
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return automationGroups

    const query = searchQuery.toLowerCase()
    const filtered: typeof automationGroups = {}
    
    Object.entries(automationGroups).forEach(([key, group]) => {
      const filteredAutomations = group.automations.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      )
      if (filteredAutomations.length > 0) {
        filtered[key] = { ...group, automations: filteredAutomations }
      }
    })
    
    return filtered
  }, [searchQuery])

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gear weight="duotone" size={48} className="text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Workflow Automation
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Automate repetitive tasks and workflows to save time and reduce errors
            </p>
          </div>

          {/* Automation Status */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">Automation Status</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Background automations run every 30 minutes
                  </CardDescription>
                </div>
                <Badge 
                  variant={automationsEnabled ? "default" : "secondary"}
                  className={automationsEnabled ? "bg-green-500 text-white" : ""}
                >
                  {automationsEnabled ? "Active" : "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setAutomationsEnabled(!automationsEnabled)}
                  variant={automationsEnabled ? "outline" : "default"}
                >
                  {automationsEnabled ? (
                    <>
                      <Pause size={20} className="mr-2" />
                      Pause Automations
                    </>
                  ) : (
                    <>
                      <Play size={20} className="mr-2" />
                      Enable Automations
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Zap size={16} weight="bold" />
                  <span>Last checked: Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              size={20} 
            />
            <Input
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md mx-auto"
            />
          </div>

          {/* Grouped Automations */}
          <div className="space-y-4">
            {Object.entries(filteredGroups).map(([key, group]) => {
              const GroupIcon = group.icon
              const isOpen = openGroups[key] ?? true
              
              return (
                <Collapsible
                  key={key}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(key)}
                >
                  <Card className="glass-card">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-white/5 dark:hover:bg-black/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GroupIcon size={24} weight="duotone" className="text-primary" />
                            <div className="text-left">
                              <CardTitle className="text-xl text-gray-900 dark:text-white">
                                {group.label}
                              </CardTitle>
                              <CardDescription className="text-gray-500 dark:text-gray-400">
                                {group.automations.length} automation{group.automations.length !== 1 ? 's' : ''}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            {group.automations.filter(a => a.status === 'active').length} active
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.automations.map((automation) => {
                            const Icon = automation.icon
                            return (
                              <Card 
                                key={automation.id}
                                className="glass-card hover:shadow-lg transition-all cursor-pointer group"
                                title={automation.description}
                              >
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Icon size={20} weight="duotone" className="text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base text-gray-900 dark:text-white mb-1">
                                          {automation.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                          {automation.description}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "flex-shrink-0",
                                        automation.status === 'active' 
                                          ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                                          : ""
                                      )}
                                    >
                                      <CheckCircle size={12} className="mr-1" weight="fill" />
                                      {automation.status === 'active' ? 'Active' : 'Paused'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock size={14} weight="bold" />
                                    <span>Last run: {automation.lastRun}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </div>

          {/* Info Card */}
          <Card className="glass-card bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Zap size={24} weight="bold" className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">How It Works</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automations run in the background every 30 minutes. They check for triggers (like overdue invoices, 
                    scheduled follow-ups, etc.) and execute actions automatically. You can pause automations at any time, 
                    but they'll resume on the next check cycle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Background Automation Runner */}
      {automationsEnabled && user && <AutomationRunner user={user} />}
    </div>
  )
}
