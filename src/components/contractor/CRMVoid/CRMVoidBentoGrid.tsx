import { motion } from 'framer-motion'
import { ReactNode } from 'react'
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
}

export function CRMVoidBentoGrid({ user, onNavigate }: CRMVoidBentoGridProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [leads] = useKV<any[]>("captured-leads", [])

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
    <div className="grid grid-cols-2 gap-3 max-w-md">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </div>
  )
}
