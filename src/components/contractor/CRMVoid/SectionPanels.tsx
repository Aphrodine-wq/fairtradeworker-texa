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
        return <ReportsPanel user={user} />
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
<<<<<<< Updated upstream
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
=======
          className="absolute inset-0 bg-black/50 dark:bg-white/10 backdrop-blur-sm"
>>>>>>> Stashed changes
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
<<<<<<< Updated upstream
            "relative z-10 w-[90vw] max-w-6xl h-[85vh] rounded-2xl",
            "bg-card border border-border",
            "shadow-2xl shadow-primary/10",
=======
            "relative z-10 w-[90vw] max-w-6xl h-[85vh] rounded-lg",
            "bg-white dark:bg-black",
            "border-2 border-black dark:border-white",
            "shadow-2xl",
>>>>>>> Stashed changes
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Header */}
<<<<<<< Updated upstream
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
=======
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black dark:border-white">
>>>>>>> Stashed changes
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
<<<<<<< Updated upstream
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold text-foreground">{getPanelTitle()}</h2>
=======
                className="text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
              >
                <ArrowLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold text-black dark:text-white">{getPanelTitle()}</h2>
>>>>>>> Stashed changes
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
<<<<<<< Updated upstream
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
=======
              className="text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
>>>>>>> Stashed changes
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {getPanelContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Individual panel components

function BusinessToolsPanel({ user, onNavigate }: { user: User; onNavigate?: (page: string) => void }) {
  const tools = [
    { id: 'invoices', label: 'Invoice Manager', description: 'Create and manage invoices', icon: '📄' },
    { id: 'expenses', label: 'Expense Tracker', description: 'Track business expenses', icon: '💰' },
    { id: 'calendar', label: 'Calendar Sync', description: 'Sync with Google/Outlook', icon: '📅' },
    { id: 'estimates', label: 'Estimate Builder', description: 'Create professional estimates', icon: '📝' },
    { id: 'contracts', label: 'Contract Templates', description: 'Legal contract templates', icon: '📋' },
    { id: 'mileage', label: 'Mileage Tracker', description: 'Track driving for tax deductions', icon: '🚗' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <motion.button
          key={tool.id}
          onClick={() => onNavigate?.(tool.id)}
          className={cn(
<<<<<<< Updated upstream
            "p-6 rounded-xl text-left",
            "bg-card border border-border",
            "hover:bg-muted hover:border-primary/50",
=======
            "p-6 rounded-lg text-left",
            "bg-white dark:bg-black border-2 border-black dark:border-white",
            "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
>>>>>>> Stashed changes
            "transition-all duration-200"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
<<<<<<< Updated upstream
          <h3 className="font-semibold text-foreground mb-1">{tool.label}</h3>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
=======
          <h3 className="font-semibold text-black dark:text-white mb-1">{tool.label}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
>>>>>>> Stashed changes
        </motion.button>
      ))}
    </div>
  )
}

function KanbanPanel({ user }: { user: User }) {
  return (
    <div className="h-full">
      <CRMKanban user={user} />
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
<<<<<<< Updated upstream
        <h3 className="text-2xl font-bold text-foreground mb-2">Upgrade to Pro</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
=======
        <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Upgrade to Pro</h3>
        <p className="text-black/60 dark:text-white/60 mb-6 max-w-md">
>>>>>>> Stashed changes
          Unlock powerful tools to grow your business faster
        </p>
        <Button
          onClick={() => onNavigate?.('pro-upgrade')}
<<<<<<< Updated upstream
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
=======
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-semibold"
>>>>>>> Stashed changes
        >
          Upgrade for $59/mo
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {proTools.map((tool) => (
        <motion.button
          key={tool.id}
          onClick={() => onNavigate?.(tool.id)}
          className={cn(
<<<<<<< Updated upstream
            "p-6 rounded-xl text-left",
            "bg-primary/10 border border-primary/30",
            "hover:bg-primary/20 hover:border-primary/50",
=======
            "p-6 rounded-lg text-left",
            "bg-white dark:bg-black border-2 border-black dark:border-white",
            "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
>>>>>>> Stashed changes
            "transition-all duration-200"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-3xl mb-3">{tool.icon}</div>
<<<<<<< Updated upstream
          <h3 className="font-semibold text-foreground mb-1">{tool.label}</h3>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
=======
          <h3 className="font-semibold text-black dark:text-white mb-1">{tool.label}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
>>>>>>> Stashed changes
        </motion.button>
      ))}
    </div>
  )
}

function CustomersPanel({ user }: { user: User }) {
  return (
    <div className="h-full">
      <SimpleCRMDashboard user={user} />
    </div>
  )
}

function AIInsightsPanel({ user }: { user: User }) {
  return (
    <div className="h-full">
      <AIInsightsCRM user={user} />
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
<<<<<<< Updated upstream
      <h3 className="text-2xl font-bold text-foreground mb-2">Customize Mode</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Drag and reposition the orbiting sections to customize your CRM layout.
        Your changes will be saved automatically.
      </p>
      <p className="text-primary text-sm">
=======
      <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Customize Mode</h3>
      <p className="text-black/60 dark:text-white/60 mb-6 max-w-md">
        Drag and reposition the orbiting sections to customize your CRM layout.
        Your changes will be saved automatically.
      </p>
      <p className="text-black dark:text-white text-sm">
>>>>>>> Stashed changes
        Close this panel to enter customize mode
      </p>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
<<<<<<< Updated upstream
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-3">Display Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-foreground">Show connection lines</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-foreground">Enable animations</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-foreground">Show background pattern</span>
=======
      <div className="p-4 rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white">
        <h3 className="font-semibold text-black dark:text-white mb-3">Display Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Show connection lines</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Enable animations</span>
>>>>>>> Stashed changes
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </div>

<<<<<<< Updated upstream
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-3">Voice Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-foreground">Enable voice commands</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-foreground">Auto-transcribe recordings</span>
=======
      <div className="p-4 rounded-lg bg-white dark:bg-black border-2 border-black dark:border-white">
        <h3 className="font-semibold text-black dark:text-white mb-3">Voice Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Enable voice commands</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-black dark:text-white">Auto-transcribe recordings</span>
>>>>>>> Stashed changes
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </div>
    </div>
  )
}

function DocumentsPanel({ user }: { user: User }) {
  return (
    <div className="h-full">
      <ConstructionDocuments user={user} />
    </div>
  )
}
