import { useEffect, useRef, memo } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
}

export const VoidBackground = memo(function VoidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      // Increase star count for more prominent starfield
      const starCount = Math.floor((canvas.width * canvas.height) / 1500)
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 2.5 + 0.8,
        brightness: Math.random() * 0.4 + 0.6,
        twinkleSpeed: Math.random() * 0.003 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2
      }))
    }

    const animate = () => {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Clear with background color
      ctx.fillStyle = isDark ? '#000000' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars with twinkling effect
      const time = Date.now() * 0.001
      
      starsRef.current.forEach((star) => {
        // Twinkling animation
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        const alpha = star.brightness * twinkle
        
        // Parallax movement
        star.z -= 0.5
        if (star.z <= 0) {
          star.z = 1000
          star.x = Math.random() * canvas.width
          star.y = Math.random() * canvas.height
        }

        const scale = 1000 / star.z
        const x = (star.x - canvas.width / 2) * scale + canvas.width / 2
        const y = (star.y - canvas.height / 2) * scale + canvas.height / 2

        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) return

        // Draw star with varying size based on distance
        const starSize = star.size * scale * 0.5
        
        ctx.beginPath()
        ctx.arc(x, y, starSize, 0, Math.PI * 2)
        
        // Black stars for light mode, white stars for dark mode
        if (isDark) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.9)})`
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(alpha, 0.9)})`
        }
        ctx.fill()
        
        // Add glow effect for larger stars
        if (starSize > 1.5) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, starSize * 2)
          if (isDark) {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`)
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          } else {
            gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.5})`)
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
          }
          ctx.fillStyle = gradient
          ctx.fillRect(x - starSize * 2, y - starSize * 2, starSize * 4, starSize * 4)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      // Dark mode change will be reflected in next frame
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
})
