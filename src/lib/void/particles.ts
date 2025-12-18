/**
 * VOID Particle System - For celebrations and effects
 */

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export function createParticleBurst(
  x: number,
  y: number,
  count: number = 20,
  colors: string[] = ['#00f0ff', '#8b5cf6', '#10b981', '#f59e0b']
): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 2 + Math.random() * 3
    const life = 30 + Math.random() * 20
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: life,
      maxLife: life,
      size: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }
  
  return particles
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.1, // gravity
      life: particle.life - 1,
    }))
    .filter(particle => particle.life > 0)
}
