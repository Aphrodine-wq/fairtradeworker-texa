import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { registerSW } from './lib/serviceWorker.ts'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Initialize theme color on load
function initializeThemeColor() {
  const saved = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldBeDark = saved ? saved === 'dark' : systemPrefersDark
  
  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', shouldBeDark ? '#000000' : '#ffffff')
  }
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (appleStatusBarMeta) {
    appleStatusBarMeta.setAttribute('content', shouldBeDark ? 'black' : 'default')
  }
}

initializeThemeColor()

// Global handler for chunk load errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || ''
    const isChunkLoadError = errorMessage.includes('Failed to fetch dynamically imported module') ||
                            errorMessage.includes('Loading chunk') ||
                            errorMessage.includes('Loading CSS chunk')
    
    if (isChunkLoadError && event.filename) {
      console.warn('Chunk load error detected, reloading page to fetch fresh chunks:', event.filename)
      // Small delay to ensure error is logged
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }, true) // Use capture phase to catch errors early
}

registerSW()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
