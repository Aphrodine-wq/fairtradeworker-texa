import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import {
  MagnifyingGlass,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Clock,
  Calendar,
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import '@/styles/void.css'

interface VoidToolbarProps {
  user: {
    id: string
    fullName: string
    email: string
  }
  onNavigate?: (page: string) => void
}

export function VoidToolbar({ user, onNavigate }: VoidToolbarProps) {
  const { theme, setTheme } = useVoidStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
        setProfileOpen(false)
        setCalendarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSearch = (query: string) => {
    // Search functionality will be implemented later
    console.log('Search:', query)
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[var(--void-surface)]/90 backdrop-blur-xl border-b border-[var(--void-border)] z-50">
      <div className="h-full flex items-center justify-between px-4 gap-4">
        {/* Left: Logo */}
        <motion.button
          onClick={() => onNavigate?.('home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
        >
          <h1
            className="text-xl font-bold tracking-tight"
            style={{
              fontFamily: 'var(--void-font-display)',
              background: 'linear-gradient(135deg, var(--void-accent), var(--void-accent-alt))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            VOID
          </h1>
        </motion.button>

        {/* Center: Search */}
        <div className="flex-1 max-w-md">
          <motion.div
            className={cn(
              'relative flex items-center',
              searchOpen ? 'w-full' : 'w-64'
            )}
            animate={{ width: searchOpen ? '100%' : 256 }}
            transition={{ duration: 0.2 }}
          >
            <MagnifyingGlass className="absolute left-3 w-4 h-4 text-[var(--void-text-muted)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search... (⌘K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                if (!searchQuery) {
                  setSearchOpen(false)
                }
              }}
              className={cn(
                'w-full h-9 pl-10 pr-4 rounded-lg',
                'bg-[var(--void-surface-hover)]',
                'border border-[var(--void-border)]',
                'text-[var(--void-text)]',
                'placeholder:text-[var(--void-text-muted)]',
                'focus:outline-none focus:border-[var(--void-accent)]',
                'focus:ring-2 focus:ring-[var(--void-accent)]/20',
                'transition-all'
              )}
              style={{ fontFamily: 'var(--void-font-body)' }}
            />
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Date/Time */}
          <motion.button
            onClick={() => setCalendarOpen(!calendarOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--void-surface-hover)] transition-colors"
          >
            <Clock className="w-4 h-4 text-[var(--void-text-muted)]" />
            <span
              className="text-sm text-[var(--void-text-muted)]"
              style={{ fontFamily: 'var(--void-font-mono)' }}
            >
              {format(currentTime, 'HH:mm')}
            </span>
            <span
              className="text-sm text-[var(--void-text-muted)]"
              style={{ fontFamily: 'var(--void-font-body)' }}
            >
              {format(currentTime, 'MMM d')}
            </span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--void-surface-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            <motion.div
              animate={{
                rotate: theme === 'dark' ? 0 : 180,
              }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[var(--void-warning)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--void-accent)]" />
              )}
            </motion.div>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--void-surface-hover)] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-[var(--void-text-muted)]" />
              {/* Badge placeholder */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--void-error)] rounded-full" />
            </motion.button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg shadow-lg p-4 z-50"
                >
                  <div className="text-sm font-semibold text-[var(--void-text)] mb-2">
                    Notifications
                  </div>
                  <div className="text-sm text-[var(--void-text-muted)]">
                    No new notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-[var(--void-accent)] flex items-center justify-center hover:ring-2 hover:ring-[var(--void-accent)]/50 transition-all"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-[var(--void-bg)]" />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-[var(--void-surface)] border border-[var(--void-border)] rounded-lg shadow-lg p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[var(--void-border)]">
                      <div className="text-sm font-semibold text-[var(--void-text)]">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-[var(--void-text-muted)]">
                        {user.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate?.('settings')
                        setProfileOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--void-surface-hover)] transition-colors text-sm text-[var(--void-text)]"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        // Logout logic
                        setProfileOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[var(--void-surface-hover)] transition-colors text-sm text-[var(--void-text)]"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Spotify Strip (placeholder - will be implemented in Phase 9) */}
      <div className="h-12 border-t border-[var(--void-border)] bg-[var(--void-surface)]/50 backdrop-blur-sm">
        {/* Spotify player strip will go here */}
      </div>
    </div>
  )
}
