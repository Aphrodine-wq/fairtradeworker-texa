/**
 * Star Wireframe Background Animation
 * Beautiful animated star field with connecting lines
 */

import { useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'

interface Star {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  brightness: number
}

export function StarWireframe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const starsRef = useRef<Star[]>([])
  const { theme } = useVoidStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize stars
    const starCount = 150
    const stars: Star[] = []
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5,
      })
    }
    starsRef.current = stars

    // Get theme colors
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const starColor = isDark ? '#ffffff' : '#000000'
    const lineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // Move star
        star.z -= star.vz
        if (star.z <= 0) {
          star.z = 2000
          star.x = Math.random() * canvas.width
          star.y = Math.random() * canvas.height
        }

        // Project to 2D
        const k = 128 / star.z
        const px = star.x * k + canvas.width / 2
        const py = star.y * k + canvas.height / 2

        // Draw star
        const size = star.size * k
        const alpha = (1 - star.z / 2000) * star.brightness
        ctx.fillStyle = starColor
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fill()

        // Draw connecting lines to nearby stars
        for (let j = i + 1; j < stars.length; j++) {
          const otherStar = stars[j]
          const k2 = 128 / otherStar.z
          const px2 = otherStar.x * k2 + canvas.width / 2
          const py2 = otherStar.y * k2 + canvas.height / 2

          const dx = px - px2
          const dy = py - py2
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.strokeStyle = lineColor
            ctx.globalAlpha = (1 - distance / 150) * 0.3 * alpha
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(px2, py2)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  )
}
