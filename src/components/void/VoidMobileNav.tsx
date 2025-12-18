/**
 * VOID Mobile Navigation - Bottom navigation bar for mobile devices
 */

import { motion } from 'framer-motion'
import { House, Users, ChartLine, Settings } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { MenuId } from '@/lib/void/types'

interface VoidMobileNavProps {
  activeMenu?: MenuId | null
  onMenuClick: (menuId: MenuId) => void
}

const MOBILE_MENU_ITEMS: { id: MenuId; icon: React.ReactNode; label: string }[] = [
  { id: 'customers', icon: <Users size={24} weight="duotone" />, label: 'Customers' },
  { id: 'leads', icon: <ChartLine size={24} weight="duotone" />, label: 'Leads' },
  { id: 'analytics', icon: <ChartLine size={24} weight="duotone" />, label: 'Analytics' },
  { id: 'settings', icon: <Settings size={24} weight="duotone" />, label: 'Settings' },
]

export function VoidMobileNav({ activeMenu, onMenuClick }: VoidMobileNavProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#00f0ff]/20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_MENU_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-all",
              "hover:bg-[#00f0ff]/10",
              activeMenu === item.id && "bg-[#00f0ff]/20"
            )}
          >
            <div className={cn(
              "mb-1 transition-colors",
              activeMenu === item.id ? "text-[#00f0ff]" : "text-gray-400"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-xs font-medium",
              activeMenu === item.id ? "text-[#00f0ff]" : "text-gray-500"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
