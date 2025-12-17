import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "@phosphor-icons/react"

function updateThemeColor(isDark: boolean) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? '#000000' : '#ffffff')
  }
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', isDark ? 'black' : 'default')
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionRef = useRef<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved ? saved === 'dark' : systemPrefersDark
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
    updateThemeColor(shouldBeDark)
  }, [])

  const toggleTheme = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // Add fade overlay for smooth transition
    const overlay = document.createElement('div')
    overlay.id = 'theme-transition-overlay'
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    `
    document.body.appendChild(overlay)
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '1'
        
        setTimeout(() => {
          const newTheme = !isDark
          setIsDark(newTheme)
          localStorage.setItem('theme', newTheme ? 'dark' : 'light')
          
          // Smooth class transition
          document.documentElement.style.transition = 'color-scheme 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          document.documentElement.classList.toggle('dark', newTheme)
          updateThemeColor(newTheme)
          
          // Update CSS variables with smooth transition
          const root = document.documentElement
          root.style.setProperty('--transition-theme', '0.4s cubic-bezier(0.4, 0, 0.2, 1)')
          
          setTimeout(() => {
            overlay.style.opacity = '0'
            setTimeout(() => {
              document.body.removeChild(overlay)
              document.documentElement.style.transition = ''
              setIsTransitioning(false)
            }, 150)
          }, 200)
        }, 50)
      })
    })
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[32px] min-h-[32px] overflow-hidden"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{ willChange: 'transform' }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      disabled={isTransitioning}
    >
      {/* Background with smooth color transition */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: isDark 
            ? 'oklch(0.15 0.02 264)' 
            : 'oklch(0.98 0.05 85)',
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ willChange: 'background-color' }}
      />
      
      {/* Border with smooth transition */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        initial={false}
        animate={{
          borderColor: isDark 
            ? 'oklch(0.3 0.02 264 / 0.5)' 
            : 'oklch(0.8 0.1 85 / 0.5)',
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ willChange: 'border-color' }}
      />
      
      {/* Icon with smooth rotation and fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="relative z-10"
        >
          {isDark ? (
            <Moon size={18} weight="fill" className="text-amber-300" />
          ) : (
            <Sun size={18} weight="fill" className="text-amber-600" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-current opacity-0"
        initial={false}
        whileTap={{
          scale: 2,
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      />
    </motion.button>
  )
}
