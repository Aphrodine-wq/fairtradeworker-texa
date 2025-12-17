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

    const drawNebula = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.min(canvas.width, canvas.height) * 0.6
      )
      gradient.addColorStop(0, 'rgba(0, 255, 136, 0.03)')
      gradient.addColorStop(0.3, 'rgba(0, 200, 255, 0.02)')
      gradient.addColorStop(0.6, 'rgba(138, 43, 226, 0.015)')
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = () => {
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawNebula()

      const time = Date.now() * 0.001
      starsRef.current.forEach((star, i) => {
        const twinkle = Math.sin(time * 2 + i) * 0.3 + 0.7
        const alpha = star.brightness * twinkle
        
        star.z -= 0.1
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
        ctx.arc(x, y, star.size * scale * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()

        if (star.brightness > 0.8) {
          ctx.beginPath()
          ctx.arc(x, y, star.size * scale * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.1})`
          ctx.fill()
        }
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
