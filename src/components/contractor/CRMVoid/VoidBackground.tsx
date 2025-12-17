import { useEffect, useRef, memo } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
  color?: string
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
  rotation: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  angle: number
  speed: number
  opacity: number
  active: boolean
}

export const VoidBackground = memo(function VoidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const nebulaeRef = useRef<Nebula[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Helper function to convert hex colors to rgba
    const hexToRgba = (hex: string, alpha: number): string => {
      const cleanHex = hex.replace('#', '')
      const r = parseInt(cleanHex.substr(0, 2), 16)
      const g = parseInt(cleanHex.substr(2, 2), 16)
      const b = parseInt(cleanHex.substr(4, 2), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      initNebulae()
      initShootingStars()
    }

    const initNebulae = () => {
      // Create several nebulae for depth
      nebulaeRef.current = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, radius: 300, color: '#6b46c1', opacity: 0.15, rotation: 0 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7, radius: 250, color: '#2563eb', opacity: 0.12, rotation: 45 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 400, color: '#7c3aed', opacity: 0.08, rotation: 90 },
        { x: canvas.width * 0.15, y: canvas.height * 0.8, radius: 200, color: '#db2777', opacity: 0.1, rotation: 120 },
        { x: canvas.width * 0.9, y: canvas.height * 0.2, radius: 180, color: '#0891b2', opacity: 0.1, rotation: 200 },
      ]
    }

    const initShootingStars = () => {
      shootingStarsRef.current = Array.from({ length: 5 }, () => ({
        x: 0,
        y: 0,
        length: Math.random() * 100 + 50,
        angle: Math.random() * 45 + 20,
        speed: Math.random() * 15 + 10,
        opacity: 0,
        active: false
      }))
    }

    const initStars = () => {
      // Increase star count for more prominent starfield
      const starCount = Math.floor((canvas.width * canvas.height) / 1200)
      const starColors = ['#ffffff', '#ffeedd', '#ddddff', '#ffffee', '#eeffff']
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 2.5 + 0.8,
        brightness: Math.random() * 0.4 + 0.6,
        twinkleSpeed: Math.random() * 0.003 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      }))
    }

    const animate = () => {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Clear with background color
      ctx.fillStyle = isDark ? '#050510' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw nebulae first (background layer)
      if (isDark) {
        nebulaeRef.current.forEach((nebula) => {
          // Convert hex to rgba for proper gradient support
          const gradient = ctx.createRadialGradient(
            nebula.x, nebula.y, 0,
            nebula.x, nebula.y, nebula.radius
          )
          gradient.addColorStop(0, hexToRgba(nebula.color, nebula.opacity))
          gradient.addColorStop(0.5, hexToRgba(nebula.color, nebula.opacity * 0.5))
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
          
          ctx.save()
          ctx.translate(nebula.x, nebula.y)
          ctx.rotate((nebula.rotation * Math.PI) / 180)
          ctx.scale(1.5, 1) // Elliptical shape
          ctx.translate(-nebula.x, -nebula.y)
          ctx.fillStyle = gradient
          ctx.fillRect(nebula.x - nebula.radius * 2, nebula.y - nebula.radius * 2, nebula.radius * 4, nebula.radius * 4)
          ctx.restore()
        })
      }

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
        
        // Colored stars for dark mode, black stars for light mode
        if (isDark) {
          if (star.color) {
            // Convert hex color to rgba
            ctx.fillStyle = hexToRgba(star.color, Math.min(alpha, 0.9))
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.9)})`
          }
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(alpha, 0.9)})`
        }
        ctx.fill()
        
        // Add glow effect for larger stars
        if (starSize > 1.5 && isDark) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, starSize * 3)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`)
          gradient.addColorStop(0.5, `rgba(180, 180, 255, ${alpha * 0.2})`)
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = gradient
          ctx.fillRect(x - starSize * 3, y - starSize * 3, starSize * 6, starSize * 6)
        }
      })

      // Draw shooting stars occasionally
      if (isDark) {
        shootingStarsRef.current.forEach((star) => {
          if (!star.active && Math.random() < 0.003) {
            star.active = true
            star.x = Math.random() * canvas.width
            star.y = Math.random() * canvas.height * 0.5
            star.opacity = 1
          }
          
          if (star.active) {
            const angleRad = (star.angle * Math.PI) / 180
            const endX = star.x + Math.cos(angleRad) * star.length
            const endY = star.y + Math.sin(angleRad) * star.length
            
            const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY)
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
            
            ctx.beginPath()
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 2
            ctx.stroke()
            
            // Move shooting star
            star.x += Math.cos(angleRad) * star.speed
            star.y += Math.sin(angleRad) * star.speed
            star.opacity -= 0.02
            
            if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
              star.active = false
            }
          }
        })
      }

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
