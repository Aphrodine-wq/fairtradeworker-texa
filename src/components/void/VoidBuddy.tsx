import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { useBuddyContext } from '@/hooks/useBuddyContext'
import { VoidBuddyIcon } from './VoidBuddyIcon'
import { VoidBuddyPanel } from './VoidBuddyPanel'
import { cn } from '@/lib/utils'

interface VoidBuddyProps {
  userName: string
}

export function VoidBuddy({ userName }: VoidBuddyProps) {
  const { buddyState, setBuddyCollapsed } = useVoidStore()
  const [isExpanded, setIsExpanded] = useState(!buddyState.collapsed)
  
  useBuddyContext() // Initialize context checking

  const handleToggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    setBuddyCollapsed(!newState)
  }

  // Calculate position based on docked state
  const getPosition = () => {
    if (typeof buddyState.position === 'string') {
      switch (buddyState.position) {
        case 'top-left':
          return { top: '80px', left: '20px' }
        case 'top-right':
          return { top: '80px', right: '20px' }
        case 'bottom-left':
          return { bottom: '60px', left: '20px' }
        case 'bottom-right':
          return { bottom: '60px', right: '20px' }
        default:
          return { top: '80px', left: '20px' }
      }
    }
    return {
      top: `${buddyState.position.y}px`,
      left: `${buddyState.position.x}px`,
    }
  }

  return (
    <div
      className="fixed z-50"
      style={getPosition()}
    >
      {isExpanded ? (
        <VoidBuddyPanel onClose={handleToggle} userName={userName} />
      ) : (
        <VoidBuddyIcon onExpand={handleToggle} />
      )}
    </div>
  )
}
