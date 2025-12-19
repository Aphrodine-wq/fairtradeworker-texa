import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { VoidWindow } from './VoidWindow'
import { VoidSettings } from './VoidSettings'
import { VoidFileSystem } from './VoidFileSystem'
import { VoidPluginManager } from './VoidPluginManager'
import { Livewire } from './modules/Livewire'
import { Facelink } from './modules/Facelink'
import { Blueprint } from './modules/Blueprint'
import { Scope } from './modules/Scope'
import { Dispatch } from './modules/Dispatch'
import { Reputation } from './modules/Reputation'
import { Cashflow } from './modules/Cashflow'
import { Vault } from './modules/Vault'
import { Funnel } from './modules/Funnel'
import { Milestones } from './modules/Milestones'

// Map menuId to component
const WINDOW_CONTENT_MAP: Record<string, React.ComponentType<any>> = {
  settings: VoidSettings,
  filesystem: VoidFileSystem,
  plugins: VoidPluginManager,
  livewire: Livewire,
  facelink: Facelink,
  blueprint: Blueprint,
  scope: Scope,
  dispatch: Dispatch,
  reputation: Reputation,
  cashflow: Cashflow,
  vault: Vault,
  funnel: Funnel,
  milestones: Milestones,
}

export function VoidWindowManager() {
  const { windows, closeWindow } = useVoidStore()

  return (
    <AnimatePresence>
      {windows
        .filter(w => !w.minimized)
        .map((window) => {
          const ContentComponent = window.menuId ? WINDOW_CONTENT_MAP[window.menuId] : null
          let content: React.ReactNode = window.content
          
          if (ContentComponent) {
            // Components that need isOpen/onClose props
            if (window.menuId === 'settings') {
              content = <ContentComponent isOpen={true} onClose={() => closeWindow(window.id)} />
            } else {
              // Other components (filesystem, plugins, modules) don't need props
              content = <ContentComponent />
            }
          }
          
          const windowWithContent = {
            ...window,
            content,
          }
          return (
            <VoidWindow key={window.id} window={windowWithContent} />
          )
        })}
    </AnimatePresence>
  )
}
