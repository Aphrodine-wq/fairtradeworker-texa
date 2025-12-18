import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SectionId } from './OrbitingSection'
import type { User } from '@/lib/types'

// Import existing components
import { CRMKanban } from '../CRMKanban'
import { SimpleCRMDashboard } from '../SimpleCRMDashboard'
import { AIInsightsCRM } from '../AIInsightsCRM'
import { ConstructionDocuments } from '../ConstructionDocuments'
import { AdvancedAnalyticsCRM } from '../AdvancedAnalyticsCRM'
import { CustomerAnalyticsPanel } from './CustomerAnalyticsPanel'
import { AutomationPanel } from './AutomationPanel'
import { AdvancedReportsPanel } from './AdvancedReportsPanel'

interface SectionPanelProps {
  section: SectionId | null
  user: User
  onClose: () => void
  onNavigate?: (page: string) => void
}

export function SectionPanel({ section, user, onClose, onNavigate }: SectionPanelProps) {
  if (!section) return null

  const getPanelContent = () => {
    switch (section) {
      case 'business-tools':
        return <BusinessToolsPanel user={user} onNavigate={onNavigate} />
      case 'kanban':
        return <KanbanPanel user={user} />
      case 'pro-tools':
        return <ProToolsPanel user={user} onNavigate={onNavigate} />
      case 'customers':
        return <CustomersPanel user={user} />
      case 'ai-insights':
        return <AIInsightsPanel user={user} />
      case 'reports':
        return <AdvancedReportsPanel user={user} />
      case 'customize':
        return <CustomizePanel />
      case 'settings':
        return <SettingsPanel />
      case 'documents':
        return <DocumentsPanel user={user} />
      default:
        return null
    }
  }

  const getPanelTitle = () => {
    switch (section) {
      case 'business-tools': return 'Business Tools'
      case 'kanban': return 'Pipeline Kanban'
      case 'pro-tools': return 'Pro Tools'
      case 'customers': return 'Customer Database'
      case 'ai-insights': return 'AI Insights'
      case 'reports': return 'Reports & Analytics'
      case 'customize': return 'Customize Layout'
      case 'settings': return 'CRM Settings'
      case 'documents': return 'Documents'
      default: return ''
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 dark:bg-white/10 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          className={cn(
            "relative z-10 w-[95vw] max-w-5xl h-[80vh] max-h-[800px] rounded-lg",
            "glass-card border-0",
            "bg-white dark:bg-black backdrop-blur-lg",
            "shadow-xl hover:shadow-2xl",
            "flex flex-col overflow-hidden",
            "transition-all duration-300"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 dark:border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
              >
                <ArrowLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold text-black dark:text-white">{getPanelTitle()}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content - No scrolling, content must fit */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="h-full overflow-hidden">
              {getPanelContent()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Individual panel components

function BusinessToolsPanel({ user, onNavigate }: { user: User; onNavigate?: (page: string) => void }) {
  const tools = [
    { id: 'cost-calculator', label: 'Job Cost Calculator', description: 'Calculate profit margins and hourly rates instantly', icon: '📊' },
    { id: 'warranty-tracker', label: 'Warranty Tracker', description: 'Never lose track of warranties you\'ve given', icon: '🛡️' },
    { id: 'quick-notes', label: 'Quick Notes', description: 'Capture job details and customer info on the go', icon: '📝' },
    { id: 'invoices', label: 'Invoice Manager', description: 'Create and manage invoices', icon: '📄' },
    { id: 'expenses', label: 'Expense Tracker', description: 'Track business expenses', icon: '💰' },
    { id: 'calendar', label: 'Calendar Sync', description: 'Sync with Google/Outlook', icon: '📅' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <motion.button
          key={tool.id}
          onClick={() => onNavigate?.(tool.id)}
          className={cn(
            "p-6 rounded-lg text-left border-0",
            "glass-card hover:shadow-xl",
            "bg-white dark:bg-black backdrop-blur-sm",
            "hover:scale-[1.02] transition-all duration-300"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
          <h3 className="font-semibold text-black dark:text-white mb-1">{tool.label}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
        </motion.button>
      ))}
    </div>
  )
}

function KanbanPanel({ user }: { user: User }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-hidden">
        <CRMKanban user={user} />
      </div>
    </div>
  )
}

function ProToolsPanel({ user, onNavigate }: { user: User; onNavigate?: (page: string) => void }) {
  const proTools = [
    { id: 'instant-payouts', label: 'Instant Payouts', description: 'Get paid in 30 minutes', icon: '⚡' },
    { id: 'auto-reminders', label: 'Auto Reminders', description: 'Automated invoice reminders', icon: '🔔' },
    { id: 'no-show', label: 'No-Show Protection', description: '$50 credit for no-shows', icon: '🛡️' },
    { id: 'tax-exports', label: 'Tax Exports', description: 'Quarterly tax reports', icon: '📊' },
    { id: 'bid-intelligence', label: 'AI Bid Intelligence', description: 'Win more jobs with AI', icon: '🧠' },
    { id: 'route-optimizer', label: 'Route Optimizer', description: 'Optimize job scheduling', icon: '🗺️' },
  ]

  if (!user.isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-6xl mb-4">👑</div>
        <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Upgrade to Pro</h3>
        <p className="text-black/60 dark:text-white/60 mb-6 max-w-md">
          Unlock powerful tools to grow your business faster
        </p>
        <Button
          onClick={() => onNavigate?.('pro-upgrade')}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-semibold"
        >
          Upgrade for $59/mo
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-hidden">
      {proTools.map((tool) => (
        <motion.button
          key={tool.id}
          onClick={() => onNavigate?.(tool.id)}
          className={cn(
            "p-6 rounded-lg text-left border-0",
            "glass-card hover:shadow-xl",
            "bg-white dark:bg-black backdrop-blur-sm",
            "hover:scale-[1.02] transition-all duration-300"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
          <h3 className="font-semibold text-black dark:text-white mb-1">{tool.label}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
        </motion.button>
      ))}
    </div>
  )
}

function CustomersPanel({ user }: { user: User }) {
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list')
  
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex gap-2 mb-4 flex-shrink-0">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all border-0",
            viewMode === 'list'
              ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
              : "glass-card bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white hover:shadow-lg"
          )}
        >
          Customer List
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all border-0",
            viewMode === 'analytics'
              ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
              : "glass-card bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white hover:shadow-lg"
          )}
        >
          Analytics
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <SimpleCRMDashboard user={user} />
        ) : (
          <CustomerAnalyticsPanel user={user} />
        )}
      </div>
    </div>
  )
}

function AIInsightsPanel({ user }: { user: User }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-hidden">
        <AIInsightsCRM user={user} />
      </div>
    </div>
  )
}

function ReportsPanel({ user }: { user: User }) {
  return (
    <div className="h-full">
      <AdvancedAnalyticsCRM user={user} />
    </div>
  )
}

function CustomizePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-6xl mb-4">✨</div>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Customize Mode</h3>
      <p className="text-black/60 dark:text-white/60 mb-6 max-w-md">
        Drag and reposition the orbiting sections to customize your CRM layout.
        Your changes will be saved automatically.
      </p>
      <p className="text-black dark:text-white text-sm">
        Close this panel to enter customize mode
      </p>
    </div>
  )
}

function SettingsPanel() {
  return (
      <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-4 rounded-lg glass-card border-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
        <h3 className="font-semibold text-black dark:text-white mb-3">Display Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Show connection lines</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Enable animations</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </div>

      <div className="p-4 rounded-lg glass-card border-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
        <h3 className="font-semibold text-black dark:text-white mb-3">Voice Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Enable voice commands</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Auto-transcribe recordings</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </div>
    </div>
  )
}

function DocumentsPanel({ user }: { user: User }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-hidden">
        <ConstructionDocuments user={user} />
      </div>
    </div>
  )
}
