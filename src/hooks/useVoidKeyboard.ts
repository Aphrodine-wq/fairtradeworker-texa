import { useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'

export function useVoidKeyboard() {
  const {
    windows,
    closeWindow,
    openWindow,
    activeWindowId,
    focusWindow,
    voiceState,
    setVoiceState,
    voicePermission,
    minimizeWindow,
    spotlightOpen,
    setSpotlightOpen,
    setTheme,
    theme,
  } = useVoidStore()
  const spacebarPressedRef = useRef(false)
  const spacebarTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K - Spotlight Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSpotlightOpen(!spotlightOpen)
        return
      }

      // Escape - Close Spotlight or modals
      if (e.key === 'Escape') {
        if (spotlightOpen) {
          setSpotlightOpen(false)
          return
        }
      }

      // ⌘, / Ctrl+, - Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        // Open settings window
        openWindow('settings')
        return
      }

      // ⌘ Space - Toggle Buddy
      if ((e.metaKey || e.ctrlKey) && e.key === ' ' && !e.shiftKey) {
        e.preventDefault()
        // Toggle buddy (will be implemented)
        return
      }

      // ⌘W / Ctrl+W - Close active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault()
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        return
      }

      // ⌘M / Ctrl+M - Minimize active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && !e.shiftKey) {
        e.preventDefault()
        if (activeWindowId) {
          minimizeWindow(activeWindowId)
        }
        return
      }

      // ⌘ Tab - Switch windows
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault()
        const visibleWindows = windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)
        if (visibleWindows.length > 1) {
          const currentIndex = visibleWindows.findIndex(w => w.id === activeWindowId)
          const nextIndex = (currentIndex + 1) % visibleWindows.length
          focusWindow(visibleWindows[nextIndex].id)
        }
        return
      }

      // CRM Shortcuts
      // ⌘⇧L - New Lead
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        openWindow('leads')
        return
      }

      // ⌘⇧C - New Customer
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        openWindow('customers')
        return
      }

      // ⌘⇧P - New Project
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        // Open project window
        return
      }

      // ⌘⇧I - New Invoice
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        // Open invoice window
        return
      }

      // ⌘⇧E - New Estimate
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        // Open estimate window
        return
      }

      // Ctrl+Shift+V - Open voice capture
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        if (voicePermission === 'granted') {
          setVoiceState('recording')
        } else if (voicePermission === 'prompt') {
          setVoiceState('permission-prompt')
        }
      }

      // Hold Spacebar - Global push-to-talk
      if (e.key === ' ' && !spacebarPressedRef.current) {
        e.preventDefault()
        spacebarPressedRef.current = true
        
        // Start recording after 300ms hold
        spacebarTimerRef.current = setTimeout(() => {
          if (voicePermission === 'granted' && voiceState === 'idle') {
            setVoiceState('recording')
          } else if (voicePermission === 'prompt' && voiceState === 'idle') {
            setVoiceState('permission-prompt')
          }
        }, 300)
      }

      // Number keys 1-9 - Quick menu access (when no modifier keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && e.key !== ' ') {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const menuIds = [
            'customers', 'leads', 'ai', 'automation', 'integrations',
            'sales', 'pipeline', 'social-media', 'analytics'
          ]
          if (menuIds[num - 1]) {
            openWindow(menuIds[num - 1])
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release Spacebar - Stop recording if active
      if (e.key === ' ' && spacebarPressedRef.current) {
        e.preventDefault()
        spacebarPressedRef.current = false
        
        if (spacebarTimerRef.current) {
          clearTimeout(spacebarTimerRef.current)
          spacebarTimerRef.current = null
        }

        // If recording, stop it
        if (voiceState === 'recording') {
          // Trigger stop in voice hook
          const event = new CustomEvent('void-voice-stop')
          window.dispatchEvent(event)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (spacebarTimerRef.current) {
        clearTimeout(spacebarTimerRef.current)
      }
    }
  }, [
    windows,
    activeWindowId,
    closeWindow,
    openWindow,
    focusWindow,
    minimizeWindow,
    voiceState,
    setVoiceState,
    voicePermission,
    spotlightOpen,
    setSpotlightOpen,
    theme,
    setTheme,
  ])
}
