import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline"
import { applyTheme, getCurrentTheme, getEffectiveTheme, type Theme } from "@/lib/themes"
import { useVoidStore } from "@/lib/void/store"

function updateThemeColor(theme: Theme) {
  const effectiveTheme = getEffectiveTheme(theme)
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', effectiveTheme === 'dark' ? '#000000' : '#ffffff')
  }
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', effectiveTheme === 'dark' ? 'black-translucent' : 'default')
  }
  document.body.style.backgroundColor = effectiveTheme === 'dark' ? '#000000' : '#ffffff'
}

export function VoidThemeToggle() {
  const { theme, setTheme } = useVoidStore()
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>(getEffectiveTheme(theme))

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(currentTheme)
    applyTheme(currentTheme)
    updateThemeColor(currentTheme)
    setEffectiveTheme(getEffectiveTheme(currentTheme))
  }, [setTheme])

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme('auto')
      updateThemeColor('auto')
      setEffectiveTheme(getEffectiveTheme('auto'))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Update effective theme when theme changes
  useEffect(() => {
    setEffectiveTheme(getEffectiveTheme(theme))
  }, [theme])

  const toggleTheme = () => {
    // Cycle through: dark -> light -> auto -> dark
    let nextTheme: Theme
    if (theme === 'dark') {
      nextTheme = 'light'
    } else if (theme === 'light') {
      nextTheme = 'auto'
    } else {
      nextTheme = 'dark'
    }
    
    // Instant switch - 0ms perceived delay
    applyTheme(nextTheme)
    updateThemeColor(nextTheme)
    
    // Update dark class for compatibility (instant)
    const effective = getEffectiveTheme(nextTheme)
    if (effective === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Store in localStorage
    localStorage.setItem('void-theme', nextTheme)
    setTheme(nextTheme)
    setEffectiveTheme(effective)
    
    // Only cross-fade backgrounds (300ms transition)
    // This is handled by CSS transitions on background elements
    document.documentElement.classList.add('theme-transitioning')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 300)
  }

  const getAriaLabel = () => {
    if (theme === 'dark') return "Switch to light mode"
    if (theme === 'light') return "Switch to auto mode"
    return "Switch to dark mode"
  }

  const getIcon = () => {
    if (theme === 'dark') return <SunIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
    if (theme === 'light') return <MoonIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
    return <ComputerDesktopIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
  }

  return (
    <motion.button
      onTap={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[32px] min-h-[32px]"
      style={{ willChange: 'transform' }}
      aria-label={getAriaLabel()}
      title={`Theme: ${theme === 'auto' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'} (${effectiveTheme})`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.08, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }} // 80ms micro-interaction
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: effectiveTheme === 'dark' 
            ? 'var(--surface-hover, rgba(20, 20, 20, 0.1))' 
            : 'var(--surface-hover, rgba(240, 241, 245, 0.5))',
        }}
        transition={{ duration: 0 }} // Instant color change
        style={{ willChange: 'background-color', transform: 'translateZ(0)' }}
      />
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : theme === 'light' ? 180 : 90,
        }}
        transition={{ duration: 0.25, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        style={{ color: 'var(--accent, var(--text-primary))' }}
      >
        {getIcon()}
      </motion.div>
    </motion.button>
  )
}
