import { motion } from 'framer-motion'
import { X, Crown, Lock, Rocket, Users, Folder, ChartBar, Plug, Archive, Lightning, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PlanetType } from './VoidPlanet'
import type { User } from '@/lib/types'

interface PlanetPanelProps {
  planet: PlanetType
  user: User
  onClose: () => void
  onNavigate?: (page: string) => void
}

export function PlanetPanel({ planet, user, onClose, onNavigate }: PlanetPanelProps) {
  const isPro = user.isPro || false
  const config = PLANET_PANEL_CONFIG[planet]

  if (!config) return null

  // Check if planet requires pro
  const isLocked = config.requiresPro && !isPro

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className={cn(
          "relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl",
          "bg-gradient-to-b border-2 shadow-2xl",
          config.gradientFrom,
          config.borderColor
        )}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${config.planetColor}dd, ${config.planetColor})`,
                boxShadow: `0 0 20px ${config.glowColor}66`
              }}
            >
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {config.title}
                {isLocked && <Lock size={18} className="text-yellow-400" />}
              </h2>
              <p className="text-sm text-white/70">{config.subtitle}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {isLocked ? (
            <ProLockedContent planetName={config.title} glowColor={config.glowColor} />
          ) : (
            <config.Content user={user} onNavigate={onNavigate} onClose={onClose} />
          )}
        </div>

        {/* Footer actions */}
        {!isLocked && config.actions && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
            {config.actions.map((action, i) => (
              <Button
                key={i}
                variant={action.primary ? 'default' : 'outline'}
                onClick={() => action.onClick?.(onNavigate, onClose)}
                className={cn(
                  action.primary 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "border-white/30 text-white hover:bg-white/10"
                )}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Pro locked state component
function ProLockedContent({ planetName, glowColor }: { planetName: string; glowColor: string }) {
  return (
    <div className="text-center py-8">
      <div 
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ 
          background: `linear-gradient(135deg, ${glowColor}22, ${glowColor}44)`,
          boxShadow: `0 0 30px ${glowColor}33`
        }}
      >
        <Crown size={40} className="text-yellow-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Unlock {planetName}
      </h3>
      <p className="text-white/70 mb-6 max-w-md mx-auto">
        This planetary system requires a Pro subscription. 
        Upgrade to access advanced integrations, automation, and more.
      </p>
      <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:from-yellow-400 hover:to-orange-400">
        <Rocket size={18} className="mr-2" />
        Upgrade to Pro - $59/mo
      </Button>
    </div>
  )
}

// Individual planet content components
function MercuryContent({ onNavigate, onClose }: ContentProps) {
  const quickActions = [
    { label: 'Add Customer', icon: '👤', action: 'add-customer' },
    { label: 'New Invoice', icon: '📄', action: 'new-invoice' },
    { label: 'Create Estimate', icon: '📝', action: 'new-estimate' },
    { label: 'Schedule Job', icon: '📅', action: 'schedule' },
    { label: 'Send Message', icon: '💬', action: 'message' },
    { label: 'Log Time', icon: '⏱️', action: 'time-log' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Quick actions at your fingertips. Mercury's speed brings efficiency to your workflow.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(action => (
          <button
            key={action.action}
            onClick={() => {
              onNavigate?.(action.action)
              onClose()
            }}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-white font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function VenusContent({ onNavigate, onClose }: ContentProps) {
  // Mock customer data
  const recentCustomers = [
    { name: 'John Smith', status: 'Active Lead', value: '$15,000' },
    { name: 'Sarah Johnson', status: 'Proposal Sent', value: '$8,500' },
    { name: 'Mike Davis', status: 'In Progress', value: '$22,000' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Venus governs relationships. Your customers and leads orbit here.
      </p>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent Contacts</h4>
        {recentCustomers.map((customer, i) => (
          <div 
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">{customer.name}</p>
                <p className="text-xs text-white/60">{customer.status}</p>
              </div>
            </div>
            <span className="text-green-400 font-semibold">{customer.value}</span>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => {
          onNavigate?.('customers')
          onClose()
        }}
      >
        <Users size={18} className="mr-2" />
        View All Customers
        <ArrowRight size={16} className="ml-auto" />
      </Button>
    </div>
  )
}

function EarthContent({ }: ContentProps) {
  const stats = [
    { label: 'Active Projects', value: '12', trend: '+3' },
    { label: 'Pipeline Value', value: '$156K', trend: '+12%' },
    { label: 'This Month', value: '$24,500', trend: '+8%' },
    { label: 'Pending Tasks', value: '8', trend: '-2' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Earth is your home base. The dashboard overview of your entire business universe.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            <p className={cn(
              "text-xs font-medium mt-1",
              stat.trend.startsWith('+') ? "text-green-400" : "text-blue-400"
            )}>
              {stat.trend} from last week
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarsContent({ onNavigate, onClose }: ContentProps) {
  const projects = [
    { name: 'Kitchen Remodel', client: 'Johnson', stage: 'In Progress', color: 'bg-orange-500' },
    { name: 'Bathroom Reno', client: 'Smith', stage: 'Planning', color: 'bg-blue-500' },
    { name: 'Deck Build', client: 'Williams', stage: 'Completed', color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Mars is the planet of action. Your active projects and jobs live here.
      </p>

      <div className="space-y-2">
        {projects.map((project, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className={cn("w-2 h-10 rounded-full", project.color)} />
            <div className="flex-1">
              <p className="text-white font-medium">{project.name}</p>
              <p className="text-xs text-white/60">{project.client} • {project.stage}</p>
            </div>
            <Folder size={20} className="text-white/40" />
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => {
          onNavigate?.('kanban')
          onClose()
        }}
      >
        <Folder size={18} className="mr-2" />
        Open Kanban Board
        <ArrowRight size={16} className="ml-auto" />
      </Button>
    </div>
  )
}

function JupiterContent({ onNavigate, onClose }: ContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Jupiter dominates the financial realm. Invoices, payments, and cash flow orbit this giant.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-center">
          <p className="text-2xl font-bold text-green-400">$45K</p>
          <p className="text-xs text-white/60">Received</p>
        </div>
        <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-center">
          <p className="text-2xl font-bold text-yellow-400">$12K</p>
          <p className="text-xs text-white/60">Pending</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-center">
          <p className="text-2xl font-bold text-red-400">$3.2K</p>
          <p className="text-xs text-white/60">Overdue</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1 bg-white text-black hover:bg-white/90"
          onClick={() => {
            onNavigate?.('invoices')
            onClose()
          }}
        >
          View Invoices
        </Button>
        <Button 
          variant="outline"
          className="flex-1 border-white/30 text-white hover:bg-white/10"
          onClick={() => {
            onNavigate?.('estimates')
            onClose()
          }}
        >
          Estimates
        </Button>
      </div>
    </div>
  )
}

function SaturnContent({ onNavigate, onClose }: ContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Saturn's rings contain layers of data. Analytics and insights orbit in beautiful patterns.
      </p>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">Revenue Trend</span>
          <span className="text-green-400 text-sm font-medium">+18% ↑</span>
        </div>
        {/* Simple chart visualization */}
        <div className="flex items-end gap-1 h-20">
          {[40, 65, 45, 80, 55, 90, 75, 85, 95, 70, 88, 100].map((h, i) => (
            <div 
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-500 to-blue-400 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>Jan</span>
          <span>Dec</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => {
          onNavigate?.('reports')
          onClose()
        }}
      >
        <ChartBar size={18} className="mr-2" />
        View Full Analytics
        <ArrowRight size={16} className="ml-auto" />
      </Button>
    </div>
  )
}

function UranusContent({ onNavigate, onClose }: ContentProps) {
  const integrations = [
    { name: 'QuickBooks', status: 'Connected', icon: '📊' },
    { name: 'Google Calendar', status: 'Connected', icon: '📅' },
    { name: 'Stripe', status: 'Setup Required', icon: '💳' },
    { name: 'Zapier', status: 'Available', icon: '⚡' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Uranus spins differently. Your integrations and external connections live on this unique world.
      </p>

      <div className="space-y-2">
        {integrations.map((integration, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{integration.icon}</span>
              <span className="text-white font-medium">{integration.name}</span>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              integration.status === 'Connected' 
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            )}>
              {integration.status}
            </span>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => {
          onNavigate?.('settings')
          onClose()
        }}
      >
        <Plug size={18} className="mr-2" />
        Manage Integrations
        <ArrowRight size={16} className="ml-auto" />
      </Button>
    </div>
  )
}

function NeptuneContent({ onNavigate, onClose }: ContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-white/80 text-sm">
        Neptune holds the deep memories. Archived projects, old customers, and historical data rest in these cold depths.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <Archive size={32} className="mx-auto mb-2 text-blue-400" />
          <p className="text-white font-medium">156</p>
          <p className="text-xs text-white/60">Archived Projects</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <Users size={32} className="mx-auto mb-2 text-blue-400" />
          <p className="text-white font-medium">342</p>
          <p className="text-xs text-white/60">Past Customers</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => {
          onNavigate?.('archive')
          onClose()
        }}
      >
        <Archive size={18} className="mr-2" />
        Browse Archive
        <ArrowRight size={16} className="ml-auto" />
      </Button>
    </div>
  )
}

function SunContent({ user }: ContentProps) {
  // Use email or fallback since User type may not have name
  const userName = (user as { name?: string }).name || (user as { email?: string }).email?.split('@')[0] || 'Commander'
  return (
    <div className="space-y-4 text-center py-4">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center animate-pulse">
        <span className="text-4xl">☀️</span>
      </div>
      <h3 className="text-xl font-bold text-white">Welcome, {userName}</h3>
      <p className="text-white/70 max-w-md mx-auto">
        You are the center of this solar system. All business activity orbits around you.
        Use the voice hub to add customers, or click any planet to explore.
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <Button className="bg-white text-black hover:bg-white/90">
          <Lightning size={18} className="mr-2" />
          Add Customer by Voice
        </Button>
      </div>
    </div>
  )
}

// Types for content components
interface ContentProps {
  user: User
  onNavigate?: (page: string) => void
  onClose: () => void
}

interface PanelAction {
  label: string
  icon?: React.ReactNode
  primary?: boolean
  onClick?: (onNavigate?: (page: string) => void, onClose?: () => void) => void
}

interface PlanetPanelConfigItem {
  title: string
  subtitle: string
  icon: string
  planetColor: string
  glowColor: string
  gradientFrom: string
  borderColor: string
  requiresPro?: boolean
  Content: React.ComponentType<ContentProps>
  actions?: PanelAction[]
}

// Panel configurations for each planet
const PLANET_PANEL_CONFIG: Partial<Record<PlanetType, PlanetPanelConfigItem>> = {
  sun: {
    title: 'Command Center',
    subtitle: 'Your voice hub & mission control',
    icon: '☀️',
    planetColor: '#ff9500',
    glowColor: '#ffcc00',
    gradientFrom: 'from-orange-900/90 to-black/90',
    borderColor: 'border-orange-500/50',
    Content: SunContent,
  },
  mercury: {
    title: 'Quick Actions',
    subtitle: 'Fast tasks at lightspeed',
    icon: '⚡',
    planetColor: '#a0a0a0',
    glowColor: '#c0c0c0',
    gradientFrom: 'from-gray-800/90 to-black/90',
    borderColor: 'border-gray-500/50',
    Content: MercuryContent,
  },
  venus: {
    title: 'Relationships',
    subtitle: 'Customers & leads orbit here',
    icon: '💛',
    planetColor: '#e6c35c',
    glowColor: '#ffd700',
    gradientFrom: 'from-yellow-900/90 to-black/90',
    borderColor: 'border-yellow-500/50',
    Content: VenusContent,
    actions: [
      { label: 'Add Customer', icon: <Users size={16} className="mr-1" />, primary: true, onClick: (nav, close) => { nav?.('add-customer'); close?.() } }
    ]
  },
  earth: {
    title: 'Home Base',
    subtitle: 'Dashboard overview',
    icon: '🌍',
    planetColor: '#4a90d9',
    glowColor: '#6eb5ff',
    gradientFrom: 'from-blue-900/90 to-black/90',
    borderColor: 'border-blue-500/50',
    Content: EarthContent,
    actions: [
      { label: 'View Dashboard', primary: true, onClick: (nav, close) => { nav?.('dashboard'); close?.() } }
    ]
  },
  mars: {
    title: 'Projects',
    subtitle: 'Active work & jobs',
    icon: '🔴',
    planetColor: '#cd5c5c',
    glowColor: '#ff6b6b',
    gradientFrom: 'from-red-900/90 to-black/90',
    borderColor: 'border-red-500/50',
    Content: MarsContent,
    actions: [
      { label: 'New Project', icon: <Folder size={16} className="mr-1" />, primary: true, onClick: (nav, close) => { nav?.('new-project'); close?.() } }
    ]
  },
  jupiter: {
    title: 'Finance',
    subtitle: 'Money & invoices',
    icon: '💰',
    planetColor: '#d4a574',
    glowColor: '#e8c49a',
    gradientFrom: 'from-amber-900/90 to-black/90',
    borderColor: 'border-amber-500/50',
    Content: JupiterContent,
    actions: [
      { label: 'New Invoice', primary: true, onClick: (nav, close) => { nav?.('new-invoice'); close?.() } }
    ]
  },
  saturn: {
    title: 'Analytics',
    subtitle: 'Reports & insights',
    icon: '📊',
    planetColor: '#c9b896',
    glowColor: '#e8dcc8',
    gradientFrom: 'from-stone-800/90 to-black/90',
    borderColor: 'border-stone-500/50',
    Content: SaturnContent,
    actions: [
      { label: 'Generate Report', icon: <ChartBar size={16} className="mr-1" />, primary: true, onClick: (nav, close) => { nav?.('reports'); close?.() } }
    ]
  },
  uranus: {
    title: 'Integrations',
    subtitle: 'Apps & connections',
    icon: '🔗',
    planetColor: '#7de3f4',
    glowColor: '#a8f0ff',
    gradientFrom: 'from-cyan-900/90 to-black/90',
    borderColor: 'border-cyan-500/50',
    requiresPro: true,
    Content: UranusContent,
    actions: [
      { label: 'Add Integration', icon: <Plug size={16} className="mr-1" />, primary: true, onClick: (nav, close) => { nav?.('integrations'); close?.() } }
    ]
  },
  neptune: {
    title: 'Archive',
    subtitle: 'History & storage',
    icon: '🌊',
    planetColor: '#4169e1',
    glowColor: '#6b8cff',
    gradientFrom: 'from-indigo-900/90 to-black/90',
    borderColor: 'border-indigo-500/50',
    Content: NeptuneContent,
  },
  moon: {
    title: 'Quick Tools',
    subtitle: 'Satellite utilities',
    icon: '🌙',
    planetColor: '#c0c0c0',
    glowColor: '#e0e0e0',
    gradientFrom: 'from-slate-800/90 to-black/90',
    borderColor: 'border-slate-500/50',
    Content: MercuryContent, // Reuse quick actions for moon
  }
}

// PlanetPanel is exported at declaration
