import { useEffect, Suspense, lazy } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { BootAnimation } from './BootAnimation'
import '@/styles/void.css'

// Lazy load components for better performance
const VoidToolbar = lazy(() => import('./VoidToolbar').then(m => ({ default: m.VoidToolbar })))
const VoidDesktop = lazy(() => import('./VoidDesktop').then(m => ({ default: m.VoidDesktop })))
const VoidWindowManager = lazy(() => import('./VoidWindowManager').then(m => ({ default: m.VoidWindowManager })))
const VoidBuddy = lazy(() => import('./VoidBuddy').then(m => ({ default: m.VoidBuddy })))
const VoidVoiceHub = lazy(() => import('./VoidVoiceHub').then(m => ({ default: m.VoidVoiceHub })))
const VoidSpotifyPlayer = lazy(() => import('./VoidSpotifyPlayer').then(m => ({ default: m.VoidSpotifyPlayer })))
const VoidTaskbar = lazy(() => import('./VoidTaskbar').then(m => ({ default: m.VoidTaskbar })))
const VoidMobileNav = lazy(() => import('./VoidMobileNav').then(m => ({ default: m.VoidMobileNav })))
const Background = lazy(() => import('./Background').then(m => ({ default: m.Background })))
const WiremapCanvas = lazy(() => import('./WiremapCanvas').then(m => ({ default: m.WiremapCanvas })))

interface VOIDProps {
  user: {
    id: string
    fullName: string
    email: string
  }
  onNavigate?: (page: string) => void
}

export function VOID({ user, onNavigate }: VOIDProps) {
  const { bootComplete, completeBoot, theme, setTheme } = useVoidStore()
  
  // Initialize keyboard shortcuts
  useVoidKeyboard()

  // Initialize theme on mount
  useEffect(() => {
    // Set initial theme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Apply theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const handleBootComplete = () => {
    completeBoot()
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ backgroundColor: 'var(--void-bg)' }}>
      {/* Boot Animation */}
      <AnimatePresence>
        {!bootComplete && (
          <BootAnimation onComplete={handleBootComplete} />
        )}
      </AnimatePresence>

      {/* Main VOID Interface */}
      <AnimatePresence>
        {bootComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full relative"
          >
            {/* Background Layer */}
            <Suspense fallback={null}>
              <Background />
            </Suspense>

            {/* Wiremap Layer */}
            <Suspense fallback={null}>
              <WiremapCanvas />
            </Suspense>

            {/* Desktop Layer */}
            <div className="absolute inset-0 pt-16">
              <Suspense fallback={null}>
                <VoidDesktop />
              </Suspense>
            </div>

            {/* Widget Layer */}
            <Suspense fallback={null}>
              <VoidBuddy userName={user.fullName} />
            </Suspense>

            {/* Voice Hub (when active) */}
            <Suspense fallback={null}>
              <VoidVoiceHub />
            </Suspense>

            {/* Spotify Player (if expanded) */}
            <Suspense fallback={null}>
              <VoidSpotifyPlayer />
            </Suspense>

            {/* Window Layer */}
            <Suspense fallback={null}>
              <VoidWindowManager />
            </Suspense>

            {/* Toolbar Layer (fixed top) */}
            <Suspense fallback={null}>
              <VoidToolbar user={user} onNavigate={onNavigate} />
            </Suspense>

            {/* Taskbar (Desktop only) */}
            {typeof window !== 'undefined' && window.innerWidth >= 768 && (
              <Suspense fallback={null}>
                <VoidTaskbar />
              </Suspense>
            )}

            {/* Mobile Navigation */}
            {typeof window !== 'undefined' && window.innerWidth < 768 && (
              <Suspense fallback={null}>
                <VoidMobileNav />
              </Suspense>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
