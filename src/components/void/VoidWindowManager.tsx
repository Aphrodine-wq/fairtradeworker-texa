import { AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { VoidWindow } from './VoidWindow'

export function VoidWindowManager() {
  const { windows } = useVoidStore()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <AnimatePresence>
      {windows.map((window) => (
        <VoidWindow key={window.id} window={window} isMobile={isMobile} />
      ))}
    </AnimatePresence>
  )
}
