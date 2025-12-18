/**
 * VOID Canvas - Background layer with user image and wiremap animation
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import { WIREMAP_CONFIG } from '@/lib/void/config'
import type { WiremapNode, WiremapConnection } from '@/lib/void/types'

interface VoidCanvasProps {
  children: React.ReactNode
}

export function VoidCanvas({ children }: VoidCanvasProps) {
  const [backgroundImage, setBackgroundImage] = useKV<string | null>('void-background-image', null)
  const [nodes, setNodes] = useState<WiremapNode[]>([])
  const [connections, setConnections] = useState<WiremapConnection[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Initialize wiremap nodes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const initNodes: WiremapNode[] = []
    const colors = WIREMAP_CONFIG.nodes.colors
    const width = window.innerWidth
    const height = window.innerHeight

    for (let i = 0; i < WIREMAP_CONFIG.nodes.count; i++) {
      initNodes.push({
        id: `node-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (WIREMAP_CONFIG.nodes.size.max - WIREMAP_CONFIG.nodes.size.min) + WIREMAP_CONFIG.nodes.size.min,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        connections: [],
      })
    }

    // Create connections
    const initConnections: WiremapConnection[] = []
    for (let i = 0; i < initNodes.length; i++) {
      for (let j = i + 1; j < initNodes.length; j++) {
        const dx = initNodes[i].x - initNodes[j].x
        const dy = initNodes[i].y - initNodes[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < WIREMAP_CONFIG.nodes.connectDistance) {
          initNodes[i].connections.push(initNodes[j].id)
          initConnections.push({
            from: initNodes[i].id,
            to: initNodes[j].id,
            color: WIREMAP_CONFIG.connections.color,
            opacity: 0.2,
          })
        }
      }
    }

    setNodes(initNodes)
    setConnections(initConnections)
  }, [])

  // Animate wiremap - optimized with refs
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use refs to avoid state updates in animation loop
    const nodesRef = { current: nodes }
    const connectionsRef = { current: connections }
    
    // Update refs when state changes
    nodesRef.current = nodes
    connectionsRef.current = connections

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let mouseX = 0
    let mouseY = 0
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const currentNodes = nodesRef.current
      const currentConnections = connectionsRef.current

      // Update node positions (organic movement with mouse attraction)
      currentNodes.forEach(node => {
        node.pulsePhase += 0.02
        
        // Mouse attraction effect
        if (WIREMAP_CONFIG.interaction.mouseAttract) {
          const dx = mouseX - node.x
          const dy = mouseY - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 200 && distance > 0) {
            const force = (200 - distance) / 200 * 0.5
            node.x += (dx / distance) * force
            node.y += (dy / distance) * force
          }
        }
        
        // Organic movement
        node.x += Math.sin(node.pulsePhase) * 0.3
        node.y += Math.cos(node.pulsePhase * 0.7) * 0.3
        
        // Boundary wrapping
        if (node.x < 0) node.x = canvas.width
        if (node.x > canvas.width) node.x = 0
        if (node.y < 0) node.y = canvas.height
        if (node.y > canvas.height) node.y = 0
      })

      // Draw connections with animated dash
      currentConnections.forEach((conn, index) => {
        const fromNode = currentNodes.find(n => n.id === conn.from)
        const toNode = currentNodes.find(n => n.id === conn.to)
        
        if (fromNode && toNode) {
          const distance = Math.sqrt(
            Math.pow(toNode.x - fromNode.x, 2) + 
            Math.pow(toNode.y - fromNode.y, 2)
          )
          
          if (distance < WIREMAP_CONFIG.nodes.connectDistance) {
            ctx.beginPath()
            ctx.moveTo(fromNode.x, fromNode.y)
            ctx.lineTo(toNode.x, toNode.y)
            
            // Animated dash offset
            const dashOffset = (Date.now() * 0.05) % 10
            ctx.setLineDash([5, 5])
            ctx.lineDashOffset = -dashOffset
            
            ctx.strokeStyle = conn.color
            ctx.lineWidth = WIREMAP_CONFIG.connections.width
            ctx.globalAlpha = 0.2 + (1 - distance / WIREMAP_CONFIG.nodes.connectDistance) * 0.3
            ctx.stroke()
            ctx.setLineDash([])
            ctx.globalAlpha = 1
          }
        }
      })

      // Draw nodes with glow
      currentNodes.forEach(node => {
        const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7
        const size = node.size * pulse

        // Outer glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2)
        gradient.addColorStop(0, node.color)
        gradient.addColorStop(0.5, node.color + '80')
        gradient.addColorStop(1, node.color + '00')
        ctx.fillStyle = gradient
        ctx.fill()

        // Node
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nodes, connections])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0f]">
      {/* User Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: 0.4,
          }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Wiremap Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Content Layer */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  )
}
