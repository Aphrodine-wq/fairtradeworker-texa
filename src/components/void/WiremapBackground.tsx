import { useEffect, useRef, useState } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { getThemeColors } from '@/lib/themes'
import { useIsMobile } from '@/hooks/use-mobile'

interface WiremapBackgroundProps {
  className?: string
}

export function WiremapBackground({ className = '' }: WiremapBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null)
  const hasTransferredRef = useRef<boolean>(false)
  const { theme } = useVoidStore()
  const isMobile = useIsMobile()
  const [isInitialized, setIsInitialized] = useState(false)

  // Adaptive node count: 80 desktop / 40 mobile
  const nodeCount = isMobile ? 40 : 80

  // Effect 1: One-time canvas transfer and worker initialization (mount only)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || hasTransferredRef.current) return

    // Check if OffscreenCanvas is supported
    if (!('OffscreenCanvas' in window)) {
      console.warn('OffscreenCanvas not supported, falling back to main thread rendering')
      // Fallback: render on main thread (simplified version)
      return
    }

    // Create OffscreenCanvas - ONLY ONCE
    try {
      const offscreen = canvas.transferControlToOffscreen()
      offscreenCanvasRef.current = offscreen
      hasTransferredRef.current = true

      // Create Web Worker
      const worker = new Worker(
        new URL('@/lib/void/wiremapWorker.ts', import.meta.url),
        { type: 'module' }
      )

      workerRef.current = worker

      worker.onmessage = (e) => {
        if (e.data.type === 'ready') {
          setIsInitialized(true)
        }
      }

      worker.onerror = (error) => {
        console.error('Wiremap worker error:', error)
      }

      // Initialize worker with initial config
      const colors = getThemeColors(theme)
      worker.postMessage(
        {
          type: 'init',
          config: {
            nodeCount,
            width: canvas.width || window.innerWidth,
            height: canvas.height || window.innerHeight,
            nodeColor: colors.wiremap.node,
            lineColor: colors.wiremap.line,
            rippleColor: colors.wiremap.ripple,
          },
          canvas: offscreen,
        },
        [offscreen]
      )
    } catch (error) {
      console.error('Failed to create wiremap worker:', error)
      // Fallback to main thread rendering
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
      // Note: Cannot reset hasTransferredRef here because canvas is already transferred
      // Component unmount means the canvas element will be destroyed anyway
    }
  }, []) // Empty deps - only run on mount

  // Effect 2: Update theme colors when theme changes (no canvas transfer)
  useEffect(() => {
    if (!workerRef.current || !isInitialized) return

    const colors = getThemeColors(theme)
    workerRef.current.postMessage({
      type: 'theme',
      theme: {
        node: colors.wiremap.node,
        line: colors.wiremap.line,
        ripple: colors.wiremap.ripple,
      },
    })
  }, [theme, isInitialized])

  // Effect 3: Update node count when it changes (no canvas transfer)
  useEffect(() => {
    if (!workerRef.current || !isInitialized) return

    const canvas = canvasRef.current
    if (!canvas) return

    workerRef.current.postMessage({
      type: 'update',
      config: {
        nodeCount,
        width: canvas.width || window.innerWidth,
        height: canvas.height || window.innerHeight,
      },
    })
  }, [nodeCount, isInitialized])

  // Handle mouse movement
  useEffect(() => {
    if (!workerRef.current || !isInitialized) return

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      workerRef.current?.postMessage({
        type: 'mouse',
        mouse: { x, y },
      })
    }

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      workerRef.current?.postMessage({
        type: 'click',
        click: { x, y },
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [isInitialized])

  // Handle resize
  useEffect(() => {
    if (!workerRef.current || !isInitialized) return

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      workerRef.current?.postMessage({
        type: 'update',
        config: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isInitialized])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        zIndex: 0,
        background: 'transparent',
      }}
      width={typeof window !== 'undefined' ? window.innerWidth : 1920}
      height={typeof window !== 'undefined' ? window.innerHeight : 1080}
    />
  )
}
