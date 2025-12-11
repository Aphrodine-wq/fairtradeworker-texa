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
      className="relative w-12 h-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:scale-105 active:scale-95"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900"
        initial={false}
        animate={{
          scale: isDark ? 1 : 0.85,
          opacity: isDark ? 1 : 0.4,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
        initial={false}
        animate={{
          backgroundColor: isDark ? "rgba(10, 10, 10, 0.95)" : "rgba(255, 255, 255, 0.95)",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"
          initial={false}
          animate={{
            clipPath: isDark 
              ? "circle(100% at 50% 50%)" 
              : "circle(0% at 50% 50%)",
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
        
        <motion.span
          className="relative z-10 text-xl"
          initial={false}
          animate={{
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {isDark ? '🌙' : '☀️'}
        </motion.span>
      </motion.div>
    </button>
  )
}
