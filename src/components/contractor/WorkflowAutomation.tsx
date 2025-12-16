import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gear, Play, Pause, CheckCircle, Clock, Zap } from "@phosphor-icons/react"
import { AutomationRunner } from "./AutomationRunner"
import type { User } from "@/lib/types"

interface WorkflowAutomationProps {
  user: User
}

export function WorkflowAutomation({ user }: WorkflowAutomationProps) {
  const [automationsEnabled, setAutomationsEnabled] = useState(true)

  const automationFeatures = [
    {
      id: 'follow-ups',
      name: 'Follow-Up Sequences',
      description: 'Automatically send follow-up messages based on triggers',
      status: 'active',
      lastRun: '2 minutes ago'
    },
    {
      id: 'invoice-reminders',
      name: 'Invoice Reminders',
      description: 'Send reminders for overdue invoices',
      status: 'active',
      lastRun: '5 minutes ago'
    },
    {
      id: 'late-fees',
      name: 'Late Fee Application',
      description: 'Automatically apply late fees to overdue invoices',
      status: 'active',
      lastRun: '10 minutes ago'
    },
    {
      id: 'recurring-invoices',
      name: 'Recurring Invoices',
      description: 'Generate recurring invoices on schedule',
      status: 'active',
      lastRun: '1 hour ago'
    },
    {
      id: 'customer-tags',
      name: 'Auto Customer Tagging',
      description: 'Automatically tag customers based on behavior',
      status: 'active',
      lastRun: '15 minutes ago'
    }
  ]

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen p-[1pt]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
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
          <Card>
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

          {/* Active Automations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Automations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationFeatures.map((automation) => (
                <Card key={automation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {automation.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className="bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                      >
                        <CheckCircle size={12} className="mr-1" weight="fill" />
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      {automation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} weight="bold" />
                      <span>Last run: {automation.lastRun}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
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
