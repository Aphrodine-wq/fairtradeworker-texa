/**
 * VOID Buddy - Dynamic welcome system with animated avatar
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BuddyMessage } from '@/lib/void/types'

interface VoidBuddyProps {
  userName?: string
}

export function VoidBuddy({ userName = 'there' }: VoidBuddyProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<BuddyMessage>(() => {
    const hour = new Date().getHours()
    let greeting = 'Good morning'
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
    if (hour >= 17) greeting = 'Good evening'

    return {
      text: `${greeting}, ${userName}. Ready to tackle today?`,
      type: 'greeting',
      timestamp: Date.now(),
    }
  })

  return (
    <motion.div
      className="fixed top-20 left-6 z-40"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={cn(
        "bg-black/90 backdrop-blur-xl rounded-xl border border-[#00f0ff]/30 p-4 shadow-2xl",
        "min-w-[280px]"
      )}>
        {/* Avatar and Message */}
        <div className="flex items-start gap-3">
          {/* Animated Avatar */}
          <motion.div
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-white text-xl">◉</span>
            <motion.div
              className="absolute inset-0 rounded-full bg-[#00f0ff]"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'blur(8px)' }}
            />
          </motion.div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm leading-relaxed">
              {currentMessage.text}
            </p>
          </div>
        </div>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-[#00f0ff] hover:bg-[#00f0ff]/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              Expand for insights
            </>
          )}
        </Button>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-[#00f0ff]/20"
            >
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#00f0ff] mb-2">Today's Priorities</h4>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>• Follow up with 3 leads</li>
                    <li>• Send 2 proposals</li>
                    <li>• Update customer records</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#00f0ff] mb-2">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-7 border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10">
                      Add Lead
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10">
                      New Customer
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
