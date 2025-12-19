/**
 * Simple Floating Glowing Stars Background
 * Random stars that float and glow white
 */

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinklePhase: number
}

export function StarWireframe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Reinitialize stars on resize for randomness
      initStars()
    }
    
    const initStars = () => {
      const starCount = 150 + Math.floor(Math.random() * 100) // 150-250 stars, hella random
      const stars: Star[] = []
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3, // Random horizontal velocity
          vy: (Math.random() - 0.5) * 0.3, // Random vertical velocity
          size: Math.random() * 4 + 1, // Random size 1-5px
          brightness: Math.random() * 0.5 + 0.5, // Random brightness 0.5-1.0
          twinkleSpeed: Math.random() * 0.02 + 0.01, // Random twinkle speed
          twinklePhase: Math.random() * Math.PI * 2, // Random starting phase
        })
      }
      starsRef.current = stars
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const stars = starsRef.current

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // Move star with random velocity
        star.x += star.vx
        star.y += star.vy

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Update twinkle phase
        star.twinklePhase += star.twinkleSpeed
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2 // 0 to 1
        const currentBrightness = star.brightness * (0.5 + twinkle * 0.5) // Vary brightness

        // Draw glowing star with radial gradient
        const glowSize = star.size * 4
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness})`)
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${currentBrightness * 0.6})`)
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${currentBrightness * 0.3})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        // Outer glow
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 1,
      }}
    />
  )
}
