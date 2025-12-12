import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved ? saved === 'dark' : systemPrefersDark
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px]"
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
        transition={{ duration: 0.3 }}
      />
    </button>
  )
}
