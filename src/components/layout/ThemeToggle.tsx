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
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-100 hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ perspective: '1000px' }}
    >
      {/* Magnetic 3D sphere container with spring physics */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        initial={false}
        animate={{
          rotateY: isDark ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front face (Sun - Light mode) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, oklch(0.98 0.05 85) 0%, oklch(0.95 0.08 85) 100%)',
            borderColor: 'oklch(0.85 0.1 85)',
          }}
        >
          <Sun 
            weight="fill" 
            size={24} 
            className="text-[oklch(0.75_0.15_85)]"
            style={{ 
              filter: 'drop-shadow(0 0 8px oklch(0.8 0.2 85))' 
            }}
          />
        </motion.div>

        {/* Back face (Moon - Dark mode) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, oklch(0.25 0.02 264) 0%, oklch(0.15 0.01 264) 100%)',
            borderColor: 'oklch(0.3 0.02 264)',
          }}
        >
          <Moon 
            weight="fill" 
            size={24} 
            className="text-[oklch(0.8_0.01_264)]"
            style={{ 
              filter: 'drop-shadow(0 0 8px oklch(0.7 0.05 264))' 
            }}
          />
        </motion.div>
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={false}
        animate={{
          boxShadow: isDark
            ? '0 0 20px oklch(0.4 0.05 264), inset 0 0 10px oklch(0.2 0.02 264)'
            : '0 0 20px oklch(0.9 0.15 85), inset 0 0 10px oklch(0.98 0.05 85)',
        }}
        transition={{ duration: 0.4 }}
      />
    </button>
  )
}
