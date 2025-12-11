import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Moon, Sun } from "@phosphor-icons/react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark)
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-11 h-11 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ rotateY: isDark ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-6 h-6"
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Sun size={24} weight="fill" className="text-yellow-500" />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <Moon size={24} weight="fill" className="text-blue-400" />
        </div>
      </motion.div>
    </button>
  )
}
