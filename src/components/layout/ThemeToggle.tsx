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
      className="relative w-20 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        animate={{ x: isDark ? 40 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 w-8 h-8 rounded-full bg-primary shadow-md flex items-center justify-center"
      >
        <span className="text-lg leading-none" role="img" aria-hidden="true">
          {isDark ? '🌙' : '☀️'}
        </span>
      </motion.div>
      
      <div className="absolute inset-0 flex justify-between items-center px-2 z-0 pointer-events-none select-none">
        <span className={`text-lg transition-opacity ${isDark ? 'opacity-40' : 'opacity-100'}`} role="img" aria-hidden="true">
          ☀️
        </span>
        <span className={`text-lg transition-opacity ${isDark ? 'opacity-100' : 'opacity-40'}`} role="img" aria-hidden="true">
          🌙
        </span>
      </div>
    </button>
  )
}
