import { AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { VoidWindow } from './VoidWindow'

export function VoidWindowManager() {
  const { windows } = useVoidStore()

  return (
    <AnimatePresence>
      {windows.map((window) => (
        <VoidWindow key={window.id} window={window} />
      ))}
    </AnimatePresence>
  )
}
