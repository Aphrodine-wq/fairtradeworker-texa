import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Sparkle,
  X,
  Briefcase,
  CurrencyDollar,
  GripVertical
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PinnedTool {
  id: string
  label: string
  page: string
  iconName: string
}

interface DashboardCustomizerProps {
  open: boolean
  onClose: () => void
  user: User
  onNavigate: (page: string) => void
}

const AVAILABLE_TOOLS: Array<{
  id: string
  label: string
  page: string
  iconName: string
  icon: any
  category: string
  isPro?: boolean
}> = [
  // Free Tools
  { id: 'cost-calculator', label: 'Cost Calculator', page: 'free-tools', iconName: 'Calculator', icon: Calculator, category: 'free' },
  { id: 'warranty-tracker', label: 'Warranty Tracker', page: 'free-tools', iconName: 'ShieldCheck', icon: ShieldCheck, category: 'free' },
  { id: 'quick-notes', label: 'Quick Notes', page: 'free-tools', iconName: 'Note', icon: Note, category: 'free' },
  // Finance
  { id: 'invoices', label: 'Invoices', page: 'invoices', iconName: 'Receipt', icon: Receipt, category: 'finance' },
  { id: 'expenses', label: 'Expenses', page: 'expenses', iconName: 'ChartLine', icon: ChartLine, category: 'finance' },
  { id: 'tax-helper', label: 'Tax Helper', page: 'tax-helper', iconName: 'FileText', icon: FileText, category: 'finance' },
  { id: 'payments', label: 'Payments', page: 'payments', iconName: 'CreditCard', icon: CreditCard, category: 'finance' },
  // Management
  { id: 'documents', label: 'Documents', page: 'documents', iconName: 'Folder', icon: Folder, category: 'management' },
  { id: 'calendar', label: 'Calendar', page: 'calendar', iconName: 'Calendar', icon: Calendar, category: 'management' },
  { id: 'communication', label: 'Communication', page: 'communication', iconName: 'ChatCircleDots', icon: ChatCircleDots, category: 'management' },
  { id: 'notifications', label: 'Notifications', page: 'notifications', iconName: 'Bell', icon: Bell, category: 'management' },
  // Sales & CRM
  { id: 'leads', label: 'Lead Management', page: 'leads', iconName: 'Users', icon: Users, category: 'sales' },
  { id: 'crm', label: 'CRM', page: 'crm', iconName: 'Users', icon: Users, category: 'sales' },
  { id: 'reports', label: 'Reports', page: 'reports', iconName: 'ClipboardText', icon: ClipboardText, category: 'analytics' },
  // Operations
  { id: 'inventory', label: 'Inventory', page: 'inventory', iconName: 'Package', icon: Package, category: 'operations' },
  { id: 'quality', label: 'Quality Assurance', page: 'quality', iconName: 'CheckCircle', icon: CheckCircle, category: 'operations' },
  { id: 'compliance', label: 'Compliance', page: 'compliance', iconName: 'ShieldCheck', icon: ShieldCheck, category: 'operations' },
  // Automation
  { id: 'automation', label: 'Automation', page: 'automation', iconName: 'Gear', icon: Gear, category: 'automation' },
  // Pro Tools
  { id: 'receptionist', label: 'AI Receptionist', page: 'receptionist', iconName: 'Phone', icon: Phone, category: 'sales', isPro: true },
  { id: 'bid-optimizer', label: 'Bid Optimizer', page: 'bid-optimizer', iconName: 'Target', icon: Target, category: 'sales', isPro: true },
  { id: 'change-order', label: 'Change Orders', page: 'change-order', iconName: 'FileText', icon: FileText, category: 'operations', isPro: true },
  { id: 'crew-dispatcher', label: 'Crew Dispatcher', page: 'crew-dispatcher', iconName: 'Users', icon: Users, category: 'operations', isPro: true },
  // Additional Tools
  { id: 'voice-bids', label: 'Voice Bids', page: 'voice-bids', iconName: 'Microphone', icon: Microphone, category: 'sales' },
  { id: 'neighborhood-alerts', label: 'Neighborhood Alerts', page: 'neighborhood-alerts', iconName: 'MapPin', icon: MapPin, category: 'sales' },
  { id: 'skill-trading', label: 'Skill Trading', page: 'skill-trading', iconName: 'Swap', icon: Swap, category: 'operations' },
  { id: 'material-calc', label: 'Material Calculator', page: 'material-calc', iconName: 'Ruler', icon: Ruler, category: 'operations' },
  { id: 'offline-mode', label: 'Offline Mode', page: 'offline-mode', iconName: 'WifiSlash', icon: WifiSlash, category: 'operations' },
  { id: 'project-stories', label: 'Project Stories', page: 'project-stories', iconName: 'Image', icon: Image, category: 'sales' },
  { id: 'seasonal-clubs', label: 'Seasonal Clubs', page: 'seasonal-clubs', iconName: 'CalendarDots', icon: CalendarDots, category: 'sales' },
]

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Calculator, ShieldCheck, Note, Receipt, ChartLine, FileText, CreditCard,
    Folder, Calendar, ChatCircleDots, Bell, Users, ClipboardText, Package,
    CheckCircle, Gear, Phone, Target, Microphone, MapPin, Swap, Ruler,
    WifiSlash, Image, CalendarDots, Heart, Briefcase, Sparkle, CurrencyDollar
  }
  return iconMap[iconName] || Sparkle
}

export function DashboardCustomizer({ open, onClose, user, onNavigate }: DashboardCustomizerProps) {
  const [pinnedTools, setPinnedTools] = useKV<PinnedTool[]>(`dashboard-pinned-tools-${user.id}`, [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(AVAILABLE_TOOLS.map(t => t.category))]
    return cats.map(cat => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: AVAILABLE_TOOLS.filter(t => cat === 'all' || t.category === cat).length
    }))
  }, [])

  const filteredTools = useMemo(() => {
    const tools = selectedCategory === 'all'
      ? AVAILABLE_TOOLS
      : AVAILABLE_TOOLS.filter(t => t.category === selectedCategory)
    
    // Filter out Pro tools if user is not Pro
    if (!user.isPro) {
      return tools.filter(t => !t.isPro)
    }
    return tools
  }, [selectedCategory, user.isPro])

  const pinnedToolIds = useMemo(() => new Set(pinnedTools.map(t => t.id)), [pinnedTools])

  const handleToggleTool = (tool: typeof AVAILABLE_TOOLS[0]) => {
    if (pinnedToolIds.has(tool.id)) {
      // Remove tool
      setPinnedTools(prev => prev.filter(t => t.id !== tool.id))
      toast.success(`Removed ${tool.label} from dashboard`)
    } else {
      // Add tool
      const newTool: PinnedTool = {
        id: tool.id,
        label: tool.label,
        page: tool.page,
        iconName: tool.iconName
      }
      setPinnedTools(prev => [...prev, newTool])
      toast.success(`Added ${tool.label} to dashboard`)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === toIndex) {
      setDragOverIndex(null)
      return
    }

    const newTools = [...pinnedTools]
    const [movedTool] = newTools.splice(draggingIndex, 1)
    newTools.splice(toIndex, 0, movedTool)
    
    setPinnedTools(newTools)
    setDragOverIndex(null)
    toast.success('Tools reordered')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customize Your Dashboard</DialogTitle>
          <DialogDescription>
            Add your most-used business tools to your dashboard for quick access
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label} ({cat.count})
              </Button>
            ))}
          </div>

          {/* Pinned Tools Section */}
          {pinnedTools.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">PINNED TOOLS (drag to reorder)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {pinnedTools.map((tool, index) => {
                  const Icon = getIcon(tool.iconName)
                  const toolDef = AVAILABLE_TOOLS.find(t => t.id === tool.id)
                  const isDragging = draggingIndex === index
                  const isDragOver = dragOverIndex === index
                  
                  return (
                    <Card 
                      key={tool.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', index.toString())
                        handleDragStart(index)
                      }}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "p-3 flex items-center gap-3 relative group cursor-move transition-all",
                        isDragging && "opacity-50 scale-95",
                        isDragOver && "ring-2 ring-primary border-primary"
                      )}
                    >
                      <GripVertical 
                        size={16} 
                        className="text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing"
                        weight={isDragging ? "fill" : "regular"}
                      />
                      <div className="h-8 w-8 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{tool.label}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (toolDef) handleToggleTool(toolDef)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available Tools */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              AVAILABLE TOOLS ({filteredTools.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredTools.map(tool => {
                const Icon = tool.icon || getIcon(tool.iconName)
                const isPinned = pinnedToolIds.has(tool.id)
                return (
                  <Card
                    key={tool.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary/50",
                      isPinned && "ring-2 ring-primary"
                    )}
                    onClick={() => handleToggleTool(tool)}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tool.label}</p>
                        {tool.isPro && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            PRO
                          </Badge>
                        )}
                      </div>
                      {isPinned && (
                        <Badge variant="default" className="text-xs">
                          Pinned
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
