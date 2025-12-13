import { useState, useEffect } from "react"
import { Sun, Moon } from "@phosphor-icons/react"

function updateThemeColor(isDark: boolean) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? '#000000' : '#ffffff')
  }
  // Also update Apple status bar style
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', isDark ? 'black' : 'default')
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = saved ? saved === 'dark' : systemPrefersDark
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
    updateThemeColor(shouldBeDark)
  }, [])

  const toggleTheme = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // Apply theme change immediately for instant feedback
    document.documentElement.classList.toggle('dark', newTheme)
    updateThemeColor(newTheme)
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 150)
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-transform duration-100 hover:scale-110 active:scale-95 min-w-[36px] min-h-[36px]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      disabled={isAnimating}
    >
      <div className="relative w-5 h-5">
        <Sun
          weight="fill"
          className={`absolute inset-0 text-black dark:text-white transition-all duration-100 ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
          size={20}
        />
        <Moon
          weight="fill"
          className={`absolute inset-0 text-black dark:text-white transition-all duration-100 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
          size={20}
        />
      </div>
    </button>
  )
}
