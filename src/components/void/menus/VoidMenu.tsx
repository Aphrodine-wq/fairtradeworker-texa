/**
 * VOID Menu - Base menu component with 3-column layout
 */

import { motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MenuConfig } from '@/lib/void/types'

interface VoidMenuProps {
  menu: MenuConfig
  onClose: () => void
  onItemClick: (action: string) => void
}

export function VoidMenu({ menu, onItemClick, onClose }: VoidMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-black/95 backdrop-blur-xl rounded-xl border border-[#00f0ff]/30 p-6 shadow-2xl",
        "min-w-[600px]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{menu.label}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-[#00f0ff]/20"
          onClick={onClose}
        >
          <X size={18} weight="bold" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div>
          <h3 className="text-sm font-semibold text-[#00f0ff] mb-3 uppercase tracking-wide">
            {menu.sections.left.title}
          </h3>
          <div className="space-y-1">
            {menu.sections.left.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(typeof item.action === 'string' ? item.action : item.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm text-white",
                  "hover:bg-[#00f0ff]/10 transition-colors",
                  "flex items-center gap-2"
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column */}
        <div>
          <h3 className="text-sm font-semibold text-[#00f0ff] mb-3 uppercase tracking-wide">
            {menu.sections.middle.title}
          </h3>
          <div className="space-y-1">
            {menu.sections.middle.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(typeof item.action === 'string' ? item.action : item.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm text-white",
                  "hover:bg-[#00f0ff]/10 transition-colors",
                  "flex items-center gap-2"
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="text-sm font-semibold text-[#00f0ff] mb-3 uppercase tracking-wide">
            {menu.sections.right.title}
          </h3>
          <div className="space-y-1">
            {menu.sections.right.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(typeof item.action === 'string' ? item.action : item.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm text-white",
                  "hover:bg-[#00f0ff]/10 transition-colors",
                  "flex items-center gap-2"
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
