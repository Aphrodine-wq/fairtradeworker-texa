import { useEffect } from "react"
import { motion } from "framer-motion"
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"
import { applyTheme, getCurrentTheme, type Theme } from "@/lib/themes"
import { useVoidStore } from "@/lib/void/store"

function updateThemeColor(theme: Theme) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
  }
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default')
  }
  document.body.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
}

export function VoidThemeToggle() {
  const { theme, setTheme } = useVoidStore()

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    setTheme(currentTheme)
    applyTheme(currentTheme)
    updateThemeColor(currentTheme)
  }, [setTheme])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    
    // Instant switch - 0ms perceived delay
    document.documentElement.setAttribute('data-theme', nextTheme)
    applyTheme(nextTheme)
    updateThemeColor(nextTheme)
    
    // Update dark class for compatibility (instant)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Store in localStorage
    localStorage.setItem('void-theme', nextTheme)
    setTheme(nextTheme)
    
    // Only cross-fade backgrounds (300ms transition)
    // This is handled by CSS transitions on background elements
    document.documentElement.classList.add('theme-transitioning')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 300)
  }

  return (
    <motion.button
      onTap={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[32px] min-h-[32px]"
      style={{ willChange: 'transform' }}
      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.08, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }} // 80ms micro-interaction
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: theme === 'dark' 
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
          rotate: theme === 'dark' ? 0 : 180,
        }}
        transition={{ duration: 0.25, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        style={{ color: 'var(--accent, var(--text-primary))' }}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        ) : (
          <MoonIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        )}
      </motion.div>
    </motion.button>
  )
}
