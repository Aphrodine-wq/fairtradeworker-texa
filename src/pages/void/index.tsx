import React, { useEffect } from 'react'
import { WiremapBackground } from '@/components/void/WiremapBackground'
import { BackgroundSystem } from '@/components/void/BackgroundSystem'
import { MediaToolbar } from '@/components/media/MediaToolbar'
import { VoidThemeToggle } from '@/components/void/ThemeToggle'
import { useVoidStore } from '@/lib/void/store'
import { initTheme } from '@/lib/themes'
import { useCRMMoodSync } from '@/hooks/useCRMMoodSync'
import '@/styles/void-design-system.css'
import '@/styles/void-effects.css'

export default function VoidDesktopPage() {
  const { wiremapEnabled } = useVoidStore()

  // Initialize theme
  useEffect(() => {
    initTheme()
  }, [])

  // CRM mood sync
  useCRMMoodSync()

  return (
    <div className="void-desktop fixed inset-0 overflow-hidden">
      {/* Background System */}
      <BackgroundSystem />

      {/* Wiremap Background */}
      {wiremapEnabled && <WiremapBackground />}

      {/* Desktop Content */}
      <div className="relative z-10 w-full h-full">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-20">
          <VoidThemeToggle />
        </div>

        {/* Media Toolbar */}
        <MediaToolbar />

        {/* Desktop Icons and Windows would go here */}
        {/* This is a simplified version - full implementation would include:
            - Desktop icons grid
            - Window manager
            - Taskbar
            - etc.
        */}
      </div>
    </div>
  )
}
