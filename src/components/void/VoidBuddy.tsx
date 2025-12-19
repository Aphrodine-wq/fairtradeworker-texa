import { useVoidStore } from '@/lib/void/store'
import { useBuddyContext } from '@/hooks/useBuddyContext'
import { VoidBuddyIcon } from './VoidBuddyIcon'
import { VoidBuddyPanel } from './VoidBuddyPanel'

interface VoidBuddyProps {
  userName: string
}

export function VoidBuddy({ userName }: VoidBuddyProps) {
  const { buddyState } = useVoidStore()
  
  useBuddyContext() // Initialize context checking

  // Calculate position based on docked state
  const getPosition = () => {
    if (typeof buddyState.position === 'string') {
      switch (buddyState.position) {
        case 'top-left':
          return { top: '80px', left: '20px' }
        case 'top-right':
          return { top: '80px', right: '20px' }
        case 'top-center':
          return {
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)'
          }
        case 'bottom-left':
          return { bottom: '60px', left: '20px' }
        case 'bottom-right':
          return { bottom: '60px', right: '20px' }
        default:
          return {
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)'
          }
      }
    }
    return {
      top: `${buddyState.position.y}px`,
      left: `${buddyState.position.x}px`,
    }
  }

  return (
    <div
      className="fixed z-50 flex flex-col items-center"
      style={getPosition()}
    >
      {/* Icon always visible */}
      <div className="mb-2">
        <VoidBuddyIcon />
      </div>
      {/* Panel always visible below icon */}
      <VoidBuddyPanel userName={userName} />
    </div>
  )
}
