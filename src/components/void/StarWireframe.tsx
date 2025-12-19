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

    // Initialize stars - MORE STARS for better visibility
    const starCount = 300
    const stars: Star[] = []
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: Math.random() * 3 + 2,
        size: Math.random() * 3 + 2,
        brightness: Math.random() * 0.7 + 0.7,
      })
    }
    starsRef.current = stars

    // Always use white glowing stars for visibility on black background
    const starColor = '#ffffff'
    const lineColor = 'rgba(255, 255, 255, 0.5)'

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

        // Draw star with glow effect
        const size = star.size * k
        const alpha = (1 - star.z / 2000) * star.brightness
        
        // Outer glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 3)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(px, py, size * 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Bright center
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

          if (distance < 200) {
            // Glowing lines
            const lineAlpha = (1 - distance / 200) * 0.7 * alpha
            ctx.strokeStyle = lineColor
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 2
            ctx.shadowBlur = 10
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(px2, py2)
            ctx.stroke()
            ctx.shadowBlur = 0
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
        zIndex: 1,
        opacity: 1,
        mixBlendMode: 'screen', // Makes white glow stand out on dark backgrounds
      }}
    />
  )
}
