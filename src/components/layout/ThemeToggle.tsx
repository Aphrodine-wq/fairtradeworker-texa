import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "@phosphor-icons/react"

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
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        animate={{ rotateY: isDark ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
        className="preserve-3d relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Sun size={24} weight="fill" className="text-white" />
        </div>
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Moon size={24} weight="fill" className="text-yellow-200" />
        </div>
      </motion.div>
    </motion.button>
  )
}
