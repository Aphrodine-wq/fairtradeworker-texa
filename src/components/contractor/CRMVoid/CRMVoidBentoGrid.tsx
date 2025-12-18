import { motion, PanInfo } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'
import { DotsSixVertical } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { 
  Briefcase, ChartBar, UserPlus, CurrencyDollar, 
  Clock, Bell, Sparkle, ArrowRight 
} from '@phosphor-icons/react'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { Job, CRMCustomer } from '@/lib/types'

interface BentoCardProps {
  title: string
  description: string
  icon: ReactNode
  value?: string | number
  className?: string
  onClick?: () => void
  background?: ReactNode
}

function BentoCard({ title, description, icon, value, className, onClick, background }: BentoCardProps) {
  return (
    <motion.div
      className={cn(
        "glass-card rounded-xl p-4 relative overflow-hidden cursor-pointer group",
        "backdrop-blur-[12px]",
        "bg-white/85 dark:bg-black/75",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.04)]",
        "border-0",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 900, damping: 18, mass: 0.35 }}
    >
      {background && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          {background}
        </div>
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">{title}</h3>
              {value !== undefined && (
                <p className="text-2xl font-bold text-black dark:text-white mt-1">{value}</p>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-black/70 dark:text-white/70">{description}</p>
      </div>
    </motion.div>
  )
}

interface CRMVoidBentoGridProps {
  user: any
  onNavigate?: (page: string) => void
  position?: { x: number; y: number }
  onDragEnd?: (position: { x: number; y: number }) => void
  isDraggable?: boolean
}

export function CRMVoidBentoGrid({ user, onNavigate, position, onDragEnd, isDraggable = true }: CRMVoidBentoGridProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [leads] = useKV<any[]>("captured-leads", [])
  const [isDragging, setIsDragging] = useState(false)
  const [gridPosition, setGridPosition] = useState(position || { x: 0, y: 0 })
  
  useEffect(() => {
    if (position) {
      setGridPosition(position)
    }
  }, [position])
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    if (onDragEnd) {
      const newX = gridPosition.x + info.offset.x
      const newY = gridPosition.y + info.offset.y
      const constrained = constrainToBounds(newX, newY, 200, 200)
      setGridPosition(constrained)
      onDragEnd(constrained)
    }
  }
  
  const constrainToBounds = (x: number, y: number, width: number, height: number) => {
    const maxX = window.innerWidth / 2 - width
    const maxY = window.innerHeight / 2 - height
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    }
  }

  // Calculate stats
  const activeJobs = (jobs || []).filter(j => j.status === 'active' || j.status === 'pending').length
  const totalLeads = (leads || []).length
  const totalCustomers = (customers || []).length
  
  // Calculate revenue (simplified - would need actual invoice data)
  const todayRevenue = 0 // Placeholder

  const features = [
    {
      title: "Active Jobs",
      description: "Currently in progress",
      icon: <Briefcase size={20} className="text-black dark:text-white" />,
      value: activeJobs,
      className: "col-span-1",
      onClick: () => onNavigate?.('my-jobs'),
    },
    {
      title: "Leads",
      description: "Captured today",
      icon: <UserPlus size={20} className="text-black dark:text-white" />,
      value: totalLeads,
      className: "col-span-1",
      onClick: () => onNavigate?.('lead-capture'),
    },
    {
      title: "Customers",
      description: "Total in CRM",
      icon: <ChartBar size={20} className="text-black dark:text-white" />,
      value: totalCustomers,
      className: "col-span-1",
      onClick: () => onNavigate?.('customer-crm'),
    },
    {
      title: "Revenue",
      description: "Today's earnings",
      icon: <CurrencyDollar size={20} className="text-black dark:text-white" />,
      value: `$${todayRevenue.toLocaleString()}`,
      className: "col-span-1",
      onClick: () => onNavigate?.('revenue-dashboard'),
    },
  ]

  return (
    <motion.div
      className={cn(
        "glass-card rounded-3xl p-4",
        "backdrop-blur-[16px]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.12)]",
        "bg-white/90 dark:bg-black/90",
        "border border-white/20 dark:border-white/10",
        "relative"
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      style={{
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {isDraggable && (
        <div className="absolute top-2 right-2 text-black/30 dark:text-white/30 z-10">
          <DotsSixVertical size={16} className="cursor-grab active:cursor-grabbing" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </div>
    </motion.div>
  )
}
