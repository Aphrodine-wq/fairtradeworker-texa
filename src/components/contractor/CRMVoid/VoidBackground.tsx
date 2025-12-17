import { useEffect, useRef, memo } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
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
      const starCount = Math.floor((canvas.width * canvas.height) / 3000)
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5
      }))
    }

    const drawSubtlePattern = () => {
      // Subtle grid pattern instead of nebula
      const gridSize = 50
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.lineWidth = 1
      
      if (document.documentElement.classList.contains('dark')) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      }
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    const animate = () => {
      // Use system background color
      const isDark = document.documentElement.classList.contains('dark')
      ctx.fillStyle = isDark ? '#000000' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawSubtlePattern()

      // Minimal subtle dots instead of stars
      const time = Date.now() * 0.0005
      starsRef.current.forEach((star, i) => {
        const twinkle = Math.sin(time * 2 + i) * 0.2 + 0.8
        const alpha = star.brightness * twinkle * 0.15 // Much more subtle
        
        star.z -= 0.05
        if (star.z <= 0) {
          star.z = 1000
          star.x = Math.random() * canvas.width
          star.y = Math.random() * canvas.height
        }

        const scale = 1000 / star.z
        const x = (star.x - canvas.width / 2) * scale + canvas.width / 2
        const y = (star.y - canvas.height / 2) * scale + canvas.height / 2

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return

        ctx.beginPath()
        ctx.arc(x, y, star.size * scale * 0.3, 0, Math.PI * 2)
        const isDark = document.documentElement.classList.contains('dark')
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${alpha})` 
          : `rgba(0, 0, 0, ${alpha})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
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
