import { useState, useEffect } from "react"
import { motion } from "framer-motion"

function updateThemeColor(isDark: boolean) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? '#000000' : '#ffffff')
  }
  // Also update Apple status bar style
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', isDark ? 'black-translucent' : 'default')
  }
  // Ensure body background is set for iOS Safari
  document.body.style.backgroundColor = isDark ? '#000000' : '#ffffff'
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved ? saved === 'dark' : systemPrefersDark
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
    updateThemeColor(shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // Add transition state class for smoother transitions
    document.documentElement.classList.add('theme-transitioning')
    
    // Apply theme change
    document.documentElement.classList.toggle('dark', newTheme)
    updateThemeColor(newTheme)
    
    // Remove transition state after transitions complete
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 600) // Match longest transition duration
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 hover:scale-105 active:scale-95 min-w-[32px] min-h-[32px]"
      style={{ willChange: 'transform' }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        initial={false}
        animate={{
          backgroundColor: isDark 
            ? 'oklch(0.2 0.02 264)' 
            : 'oklch(0.95 0.05 85)',
          borderColor: isDark 
            ? 'oklch(0.35 0.02 264)' 
            : 'oklch(0.85 0.1 85)',
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.6
        }}
        style={{ willChange: 'background-color, border-color', transform: 'translateZ(0)' }}
      />
    </button>
  )
}
