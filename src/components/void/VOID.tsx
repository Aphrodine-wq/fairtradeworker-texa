import { Suspense, lazy, ErrorBoundary } from 'react'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { VoidDesktop } from './VoidDesktop'
import { VoidWindowManager } from './VoidWindowManager'
import { VoidBuddy } from './VoidBuddy'
import { VoidVoiceCapture } from './VoidVoiceCapture'
import { VoidToolbar } from './VoidToolbar'
import { VoidTaskbar } from './VoidTaskbar'
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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <h2 className="text-xl font-semibold text-[var(--void-text)] mb-4">Something went wrong</h2>
      <p className="text-sm text-[var(--void-text-muted)] mb-6">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-[var(--void-accent)] text-[var(--void-bg)] rounded-lg hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  )
}

export function VOID({ user, onNavigate }: VOIDProps) {
  // Initialize keyboard shortcuts
  useVoidKeyboard()

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ backgroundColor: 'var(--void-bg)' }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Toolbar */}
        <VoidToolbar user={user} onNavigate={onNavigate} />

        {/* Desktop */}
        <div className="absolute inset-0 pt-16">
          <VoidDesktop />
        </div>

        {/* Buddy */}
        <VoidBuddy userName={user.fullName || 'there'} />

        {/* Voice Capture */}
        <VoidVoiceCapture user={user} />

        {/* Windows */}
        <VoidWindowManager />

        {/* Taskbar (Desktop only) */}
        {!isMobile && <VoidTaskbar />}

        {/* Mobile Navigation */}
        {isMobile && (
          <Suspense fallback={null}>
            <VoidMobileNav />
          </Suspense>
        )}
      </ErrorBoundary>
    </div>
  )
}

// Simple ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('VOID ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.FallbackComponent error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false, error: null })} />
    }
    return this.props.children
  }
}

import { Component } from 'react'
