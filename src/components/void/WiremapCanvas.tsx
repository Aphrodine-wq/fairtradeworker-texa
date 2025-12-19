import { useRef, useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { useVoidWiremap } from '@/hooks/useVoidWiremap'
import { WIREMAP_CONFIG } from '@/lib/void/config'

export function WiremapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { background } = useVoidStore()
  const { fps } = useVoidWiremap(canvasRef)

  // Only render wiremap if enabled in settings (for now, always enabled)
  // In production, this would check a setting from the store
  const wiremapEnabled = true

  // Adaptive quality based on FPS
  useEffect(() => {
    if (fps < 110 && WIREMAP_CONFIG.performance.adaptiveQuality) {
      // Reduce node count if FPS drops
      // This would be handled in the hook
    }
  }, [fps])

  if (!wiremapEnabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-[1] pointer-events-none"
      style={{
        opacity: background.type === 'default' ? 1 : 0.3, // More visible on default background
      }}
    />
  )
}
