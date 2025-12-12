import { useEffect, useState, useCallback } from "react"

const MOBILE_BREAKPOINT = 768

export interface DeviceInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isPWA: boolean
  hasNotch: boolean
  isIPad: boolean
  isIPhone: boolean
  screenWidth: number
  screenHeight: number
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo())

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo())
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Initial update
    setDeviceInfo(getDeviceInfo())

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return deviceInfo
}

function getDeviceInfo(): DeviceInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  
  const isAndroid = /Android/.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isIPhone = /iPhone/.test(ua)
  
  // Detect PWA mode
  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
  
  // Detect notch/Dynamic Island (iPhone X and later)
  const hasNotch = isIOS && window.screen.height >= 812 && !isIPad
  
  // Get safe area insets from CSS environment variables
  const getSafeAreaInset = (position: string): number => {
    if (typeof document === 'undefined') return 0
    const testDiv = document.createElement('div')
    testDiv.style.position = 'fixed'
    testDiv.style[position as any] = `env(safe-area-inset-${position}, 0px)`
    document.body.appendChild(testDiv)
    const value = parseInt(getComputedStyle(testDiv)[position as any] || '0', 10)
    document.body.removeChild(testDiv)
    return isNaN(value) ? 0 : value
  }
  
  return {
    isMobile: window.innerWidth < MOBILE_BREAKPOINT,
    isIOS,
    isAndroid,
    isSafari,
    isPWA,
    hasNotch,
    isIPad,
    isIPhone,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    safeAreaInsets: {
      top: getSafeAreaInset('top'),
      bottom: getSafeAreaInset('bottom'),
      left: getSafeAreaInset('left'),
      right: getSafeAreaInset('right')
    }
  }
}

// Hook for iOS-specific optimizations
export function useIOSOptimizations() {
  const { isIOS, isPWA, hasNotch } = useDeviceInfo()

  useEffect(() => {
    if (!isIOS) return

    // Prevent iOS bounce scroll
    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.scrollable') === null) {
        // Allow default behavior for scrollable containers
      }
    }

    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    // Add iOS-specific class to body
    document.body.classList.add('ios-device')
    if (isPWA) {
      document.body.classList.add('ios-pwa')
    }
    if (hasNotch) {
      document.body.classList.add('ios-notch')
    }

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

    return () => {
      document.body.classList.remove('ios-device', 'ios-pwa', 'ios-notch')
      document.removeEventListener('touchend', preventDoubleTapZoom)
    }
  }, [isIOS, isPWA, hasNotch])

  // iOS-safe smooth scroll
  const scrollToTop = useCallback(() => {
    if (isIOS) {
      // iOS-friendly scroll
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isIOS])

  return {
    scrollToTop,
    isIOS,
    isPWA,
    hasNotch
  }
}
