/**
 * VOID Particles - Particle effect component for celebrations
 */

import { useEffect, useState, useRef } from 'react'
import { createParticleBurst, updateParticles, type Particle } from '@/lib/void/particles'

interface VoidParticlesProps {
  trigger: boolean
  x: number
  y: number
  onComplete?: () => void
}

export function VoidParticles({ trigger, x, y, onComplete }: VoidParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (trigger) {
      const newParticles = createParticleBurst(x, y, 30)
      setParticles(newParticles)
    }
  }, [trigger, x, y])

  useEffect(() => {
    if (particles.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const updatedParticles = updateParticles(particles)
      setParticles(updatedParticles)

      updatedParticles.forEach(particle => {
        const alpha = particle.life / particle.maxLife
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      if (updatedParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else if (onComplete) {
        onComplete()
      }
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [particles, onComplete])

  if (particles.length === 0) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9999 }}
    />
  )
}
