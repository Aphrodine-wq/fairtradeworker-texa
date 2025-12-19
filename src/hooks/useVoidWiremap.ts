import { useEffect, useRef, useState } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { WIREMAP_CONFIG, getThemeColors } from '@/lib/void/config'
import type { WiremapNode, WiremapConnection } from '@/lib/void/types'

export function useVoidWiremap(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const { theme } = useVoidStore()
  const [fps, setFps] = useState(120)
  const animationFrameRef = useRef<number>()
  const nodesRef = useRef<WiremapNode[]>([])
  const connectionsRef = useRef<WiremapConnection[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const lastTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const fpsTimeRef = useRef<number>(0)

  // Initialize nodes
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Determine node count based on device
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
    const nodeCount = isMobile
      ? WIREMAP_CONFIG.nodes.count.mobile
      : isTablet
      ? WIREMAP_CONFIG.nodes.count.tablet
      : WIREMAP_CONFIG.nodes.count.desktop

    // Initialize nodes
    const colors = getThemeColors(theme)
    const nodeColors = theme === 'dark' 
      ? WIREMAP_CONFIG.nodes.colors.dark 
      : WIREMAP_CONFIG.nodes.colors.light

    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * WIREMAP_CONFIG.movement.speed.x,
      vy: (Math.random() - 0.5) * WIREMAP_CONFIG.movement.speed.y,
      size: WIREMAP_CONFIG.nodes.size.min + 
        Math.random() * (WIREMAP_CONFIG.nodes.size.max - WIREMAP_CONFIG.nodes.size.min),
      color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
    }))

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Animation loop
    const animate = (currentTime: number) => {
      if (!ctx || !canvasRef.current) return

      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      // FPS calculation
      frameCountRef.current++
      if (currentTime - fpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        fpsTimeRef.current = currentTime
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / (Math.min(window.devicePixelRatio, 2)), 
                    canvas.height / (Math.min(window.devicePixelRatio, 2)))

      // Update nodes
      const nodes = nodesRef.current
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Mouse attraction
        if (mouseRef.current && WIREMAP_CONFIG.interaction.mouseAttract) {
          const dx = mouseRef.current.x - node.x
          const dy = mouseRef.current.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < WIREMAP_CONFIG.interaction.attractRadius) {
            const strength = WIREMAP_CONFIG.interaction.attractStrength * 
              (1 - distance / WIREMAP_CONFIG.interaction.attractRadius)
            node.vx += (dx / distance) * strength
            node.vy += (dy / distance) * strength
          }
        }

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > window.innerWidth) {
          node.vx *= -WIREMAP_CONFIG.movement.bounce
          node.x = Math.max(0, Math.min(window.innerWidth, node.x))
        }
        if (node.y < 0 || node.y > window.innerHeight) {
          node.vy *= -WIREMAP_CONFIG.movement.bounce
          node.y = Math.max(0, Math.min(window.innerHeight, node.y))
        }

        // Apply friction
        node.vx *= WIREMAP_CONFIG.movement.friction
        node.vy *= WIREMAP_CONFIG.movement.friction
      }

      // Calculate connections
      connectionsRef.current = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < WIREMAP_CONFIG.connections.maxDistance) {
            connectionsRef.current.push({
              from: i,
              to: j,
              distance,
              opacity: WIREMAP_CONFIG.connections.opacity.min +
                (1 - distance / WIREMAP_CONFIG.connections.maxDistance) *
                (WIREMAP_CONFIG.connections.opacity.max - WIREMAP_CONFIG.connections.opacity.min),
            })
          }
        }
      }

      // Draw connections
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = WIREMAP_CONFIG.connections.lineWidth.min
      for (const connection of connectionsRef.current) {
        const node1 = nodes[connection.from]
        const node2 = nodes[connection.to]

        ctx.globalAlpha = connection.opacity
        ctx.beginPath()
        ctx.moveTo(node1.x, node1.y)
        ctx.lineTo(node2.x, node2.y)
        ctx.stroke()
      }

      // Draw nodes
      ctx.globalAlpha = 1
      for (const node of nodes) {
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        if (WIREMAP_CONFIG.nodes.pulse) {
          ctx.shadowBlur = 10
          ctx.shadowColor = node.color
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size * 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme, canvasRef])

  return { fps }
}
