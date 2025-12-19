import React, { Suspense, lazy } from 'react'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { VoidDesktop } from './VoidDesktop'
import { VoidWindowManager } from './VoidWindowManager'
import { VoidBuddy } from './VoidBuddy'
import { VoidVoiceCapture } from './VoidVoiceCapture'
import { VoidToolbar } from './VoidToolbar'
import { VoidTaskbar } from './VoidTaskbar'
import { VoidErrorBoundary } from './VoidErrorBoundary'
import type { User } from '@/lib/types'
import '@/styles/void-desktop.css'
import '@/styles/void-voice.css'

// Lazy load heavy components
const VoidMobileNav = lazy(() => import('./VoidMobileNav').then(m => ({ default: m.VoidMobileNav })))

interface VOIDProps {
  user: User
  onNavigate?: (page: string) => void
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-[var(--void-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}


export function VOID({ user, onNavigate }: VOIDProps) {
  // Initialize keyboard shortcuts
  useVoidKeyboard()

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ backgroundColor: 'var(--void-bg)' }}>
      <VoidErrorBoundary>
        {/* Toolbar */}
        <VoidErrorBoundary resetKeys={[user.id]}>
          <VoidToolbar user={user} onNavigate={onNavigate} />
        </VoidErrorBoundary>

        {/* Desktop */}
        <div className="absolute inset-0 pt-16">
          <VoidErrorBoundary>
            <VoidDesktop />
          </VoidErrorBoundary>
        </div>

        {/* Buddy */}
        <VoidErrorBoundary>
          <VoidBuddy userName={user.fullName || 'there'} />
        </VoidErrorBoundary>

        {/* Voice Capture */}
        <VoidErrorBoundary>
          <VoidVoiceCapture user={user} />
        </VoidErrorBoundary>

        {/* Windows */}
        <VoidErrorBoundary>
          <VoidWindowManager />
        </VoidErrorBoundary>

        {/* Taskbar (Desktop only) */}
        {!isMobile && (
          <VoidErrorBoundary>
            <VoidTaskbar />
          </VoidErrorBoundary>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <Suspense fallback={null}>
            <VoidErrorBoundary>
              <VoidMobileNav />
            </VoidErrorBoundary>
          </Suspense>
        )}
      </VoidErrorBoundary>
    </div>
  )
}

