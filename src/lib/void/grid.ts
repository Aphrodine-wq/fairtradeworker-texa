import { GRID_CONFIG } from './config'
import type { GridPosition, GridSize } from './types'

/**
 * Convert grid units to pixels
 */
export function gridToPixels(units: number, viewportWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1920): number {
  return GRID_CONFIG.unitToPixel(units, viewportWidth)
}

/**
 * Convert pixels to grid units
 */
export function pixelsToGrid(pixels: number, viewportWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1920): number {
  return GRID_CONFIG.pixelToUnit(pixels, viewportWidth)
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: GridPosition, snapSize: number = 4): GridPosition {
  return {
    x: Math.round(position.x / snapSize) * snapSize,
    y: Math.round(position.y / snapSize) * snapSize,
  }
}

/**
 * Clamp position within grid bounds
 */
export function clampToGrid(position: GridPosition, size: GridSize): GridPosition {
  return {
    x: Math.max(0, Math.min(GRID_CONFIG.units - size.width, position.x)),
    y: Math.max(0, Math.min(GRID_CONFIG.units - size.height, position.y)),
  }
}

/**
 * Check if two grid positions overlap
 */
export function positionsOverlap(
  pos1: GridPosition,
  size1: GridSize,
  pos2: GridPosition,
  size2: GridSize
): boolean {
  return !(
    pos1.x + size1.width <= pos2.x ||
    pos2.x + size2.width <= pos1.x ||
    pos1.y + size1.height <= pos2.y ||
    pos2.y + size2.height <= pos1.y
  )
}

/**
 * Find next available position in grid
 */
export function findNextAvailablePosition(
  existingPositions: Array<{ position: GridPosition; size: GridSize }>,
  size: GridSize,
  startPosition: GridPosition = { x: 0, y: 0 }
): GridPosition {
  let currentPosition = { ...startPosition }
  const maxIterations = GRID_CONFIG.units * GRID_CONFIG.units
  let iterations = 0

  while (iterations < maxIterations) {
    const clamped = clampToGrid(currentPosition, size)
    const overlaps = existingPositions.some(({ position, size: existingSize }) =>
      positionsOverlap(clamped, size, position, existingSize)
    )

    if (!overlaps) {
      return clamped
    }

    // Try next position (spiral search)
    currentPosition.x += size.width
    if (currentPosition.x + size.width > GRID_CONFIG.units) {
      currentPosition.x = 0
      currentPosition.y += size.height
      if (currentPosition.y + size.height > GRID_CONFIG.units) {
        currentPosition.y = 0
      }
    }

    iterations++
  }

  // Fallback: return start position
  return clampToGrid(startPosition, size)
}

/**
 * Convert mouse/client coordinates to grid position
 */
export function clientToGrid(
  clientX: number,
  clientY: number,
  containerRect: DOMRect
): GridPosition {
  const relativeX = clientX - containerRect.left
  const relativeY = clientY - containerRect.top

  return {
    x: pixelsToGrid(relativeX, containerRect.width),
    y: pixelsToGrid(relativeY, containerRect.height),
  }
}

/**
 * Convert grid position to pixel coordinates
 */
export function gridToClient(
  position: GridPosition,
  containerRect: DOMRect
): { x: number; y: number } {
  return {
    x: containerRect.left + gridToPixels(position.x, containerRect.width),
    y: containerRect.top + gridToPixels(position.y, containerRect.height),
  }
}
