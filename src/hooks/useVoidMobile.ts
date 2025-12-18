/**
 * VOID Mobile Hook - Responsive adaptations for mobile devices
 */

import { useState, useEffect } from 'react'

export interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export function useVoidMobile(): MobileState {
  const [state, setState] = useState<MobileState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
      }
    }

    const width = window.innerWidth
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}
