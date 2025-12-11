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
      className="relative w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150 hover:scale-105 active:scale-95 min-w-[40px] min-h-[40px]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 overflow-hidden"
        initial={false}
        animate={{
          backgroundColor: isDark ? "oklch(0.2 0.01 264)" : "oklch(0.98 0.002 50)",
          borderColor: isDark ? "oklch(0.3 0.01 264)" : "oklch(0.85 0.005 264)",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, oklch(0.25 0.01 264), oklch(0.15 0.01 264))",
          }}
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
      
      <motion.div
        className="absolute z-10"
        initial={false}
        animate={{
          scale: isDark ? [1, 0.8, 1] : [1, 1.1, 1],
          opacity: isDark ? 0.9 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-3 h-3 rounded-full"
          animate={{
            backgroundColor: isDark ? "oklch(0.8 0.01 264)" : "oklch(0.75 0.15 85)",
            boxShadow: isDark 
              ? "0 0 8px oklch(0.7 0.05 264)" 
              : "0 0 12px oklch(0.8 0.2 85), 0 0 20px oklch(0.85 0.15 85)",
          }}
          transition={{ duration: 0.25 }}
        />
      </motion.div>
    </button>
  )
}
