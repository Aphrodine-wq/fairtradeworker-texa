/**
 * Over-Engineered Drag and Drop System
 * Advanced physics, momentum, snap zones, and visual feedback
 */

import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'

export interface DragState {
  id: string
  startTime: number
  startPosition: { x: number; y: number }
  currentPosition: { x: number; y: number }
  velocity: { x: number; y: number }
  acceleration: { x: number; y: number }
  momentum: { x: number; y: number }
  history: Array<{ x: number; y: number; timestamp: number }>
  snapZone?: { row: number; col: number; strength: number }
  collision?: { id: string; distance: number }
}

export interface DragConfig {
  friction: number // 0-1, higher = more friction
  momentumDecay: number // 0-1, how fast momentum decays
  snapThreshold: number // pixels for snap detection
  snapStrength: number // 0-1, how strong snap is
  collisionRadius: number // pixels for collision detection
  maxHistorySize: number
  enableMomentum: boolean // DISABLED - no momentum physics
  enableSnapZones: boolean
  enableCollisionDetection: boolean
}

const DEFAULT_CONFIG: DragConfig = {
  friction: 0.85,
  momentumDecay: 0.92,
  snapThreshold: 20,
  snapStrength: 0.7,
  collisionRadius: 60,
  maxHistorySize: 10,
  enableMomentum: false, // DISABLED - no slingshot effect
  enableSnapZones: true,
  enableCollisionDetection: true,
}

export class AdvancedDragSystem {
  private dragStates: Map<string, DragState> = new Map()
  private config: DragConfig
  private animationFrameId?: number
  private isAnimating = false

  constructor(config: Partial<DragConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  handleDragStart(event: DragStartEvent): DragState {
    const id = event.active.id as string
    const rect = event.active.rect.current.translated
    
    const state: DragState = {
      id,
      startTime: performance.now(),
      startPosition: { x: rect?.left ?? 0, y: rect?.top ?? 0 },
      currentPosition: { x: rect?.left ?? 0, y: rect?.top ?? 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      momentum: { x: 0, y: 0 },
      history: [{ x: rect?.left ?? 0, y: rect?.top ?? 0, timestamp: performance.now() }],
    }

    this.dragStates.set(id, state)
    return state
  }

  handleDragMove(event: DragMoveEvent, allIcons: Array<{ id: string; position: { row: number; col: number } }>): DragState | null {
    const id = event.active.id as string
    const state = this.dragStates.get(id)
    if (!state) return null

    const now = performance.now()
    const deltaTime = (now - state.startTime) / 1000 // seconds
    const deltaX = event.delta.x
    const deltaY = event.delta.y

    // Update position
    const newX = state.currentPosition.x + deltaX
    const newY = state.currentPosition.y + deltaY
    state.currentPosition = { x: newX, y: newY }

    // Calculate velocity (pixels per second)
    if (deltaTime > 0) {
      state.velocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      }
    }

    // Calculate acceleration
    const prevVelocity = state.velocity
    if (deltaTime > 0) {
      state.acceleration = {
        x: (state.velocity.x - prevVelocity.x) / deltaTime,
        y: (state.velocity.y - prevVelocity.y) / deltaTime,
      }
    }

    // Update momentum
    if (this.config.enableMomentum) {
      state.momentum = {
        x: state.velocity.x * (1 - this.config.momentumDecay),
        y: state.velocity.y * (1 - this.config.momentumDecay),
      }
    }

    // Add to history
    state.history.push({ x: newX, y: newY, timestamp: now })
    if (state.history.length > this.config.maxHistorySize) {
      state.history.shift()
    }

    // Detect snap zones
    if (this.config.enableSnapZones) {
      state.snapZone = this.detectSnapZone(newX, newY, allIcons, id)
    }

    // Detect collisions
    if (this.config.enableCollisionDetection) {
      state.collision = this.detectCollision(newX, newY, allIcons, id)
    }

    return state
  }

  handleDragEnd(event: DragEndEvent, gridSize: { width: number; height: number }): {
    finalPosition: { row: number; col: number }
    momentum: { x: number; y: number }
    snapZone?: { row: number; col: number }
  } | null {
    const id = event.active.id as string
    const state = this.dragStates.get(id)
    if (!state) return null

    let finalX = state.currentPosition.x
    let finalY = state.currentPosition.y

    // NO MOMENTUM - direct placement only
    // Removed momentum physics for precise control

    // Apply snap zone if detected
    if (state.snapZone && state.snapZone.strength > 0.5) {
      const cellSize = {
        width: gridSize.width / 200,
        height: gridSize.height / 200,
      }
      finalX = state.snapZone.col * cellSize.width
      finalY = state.snapZone.row * cellSize.height
    }

    // Convert to grid coordinates
    const cellSize = {
      width: gridSize.width / 200,
      height: gridSize.height / 200,
    }
    const row = Math.max(1, Math.min(200, Math.round(finalY / cellSize.height)))
    const col = Math.max(1, Math.min(200, Math.round(finalX / cellSize.width)))

    this.dragStates.delete(id)

    return {
      finalPosition: { row, col },
      momentum: state.momentum,
      snapZone: state.snapZone ? { row: state.snapZone.row, col: state.snapZone.col } : undefined,
    }
  }

  private detectSnapZone(
    x: number,
    y: number,
    allIcons: Array<{ id: string; position: { row: number; col: number } }>,
    currentId: string
  ): { row: number; col: number; strength: number } | undefined {
    const threshold = this.config.snapThreshold
    let closestSnap: { row: number; col: number; distance: number } | null = null

    for (const icon of allIcons) {
      if (icon.id === currentId) continue

      // Calculate distance to icon's grid position
      // This is simplified - in real implementation, convert grid to pixels
      const distance = Math.sqrt(
        Math.pow(icon.position.col - Math.round(x / 10), 2) +
        Math.pow(icon.position.row - Math.round(y / 10), 2)
      )

      if (distance < threshold && (!closestSnap || distance < closestSnap.distance)) {
        closestSnap = {
          row: icon.position.row,
          col: icon.position.col,
          distance,
        }
      }
    }

    if (closestSnap) {
      const strength = 1 - (closestSnap.distance / this.config.snapThreshold)
      return {
        row: closestSnap.row,
        col: closestSnap.col,
        strength: Math.max(0, Math.min(1, strength)),
      }
    }

    return undefined
  }

  private detectCollision(
    x: number,
    y: number,
    allIcons: Array<{ id: string; position: { row: number; col: number } }>,
    currentId: string
  ): { id: string; distance: number } | undefined {
    const radius = this.config.collisionRadius

    for (const icon of allIcons) {
      if (icon.id === currentId) continue

      // Simplified collision detection
      const distance = Math.sqrt(
        Math.pow(icon.position.col * 10 - x, 2) +
        Math.pow(icon.position.row * 10 - y, 2)
      )

      if (distance < radius) {
        return { id: icon.id, distance }
      }
    }

    return undefined
  }

  getDragState(id: string): DragState | undefined {
    return this.dragStates.get(id)
  }

  clearDragState(id: string): void {
    this.dragStates.delete(id)
  }

  updateConfig(config: Partial<DragConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Singleton instance
export const dragSystem = new AdvancedDragSystem()
