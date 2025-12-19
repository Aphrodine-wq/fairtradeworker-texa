/**
 * VOID OS Window Snap Zones
 * Handles window snapping to 9 zones
 */

export type SnapZone = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left'
  | 'maximize'
  | 'right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface SnapZoneBounds {
  zone: SnapZone
  x: number
  y: number
  width: number
  height: number
}

const SNAP_THRESHOLD = 50 // pixels from edge to trigger snap

/**
 * Calculate snap zones based on window dimensions
 */
export function calculateSnapZones(windowWidth: number, windowHeight: number): SnapZoneBounds[] {
  const zones: SnapZoneBounds[] = []

  // Top row (25% each)
  const topRowWidth = windowWidth * 0.25
  zones.push({
    zone: 'top-left',
    x: 0,
    y: 0,
    width: topRowWidth,
    height: windowHeight * 0.25,
  })
  zones.push({
    zone: 'top-center',
    x: topRowWidth,
    y: 0,
    width: windowWidth * 0.5,
    height: windowHeight * 0.25,
  })
  zones.push({
    zone: 'top-right',
    x: topRowWidth + windowWidth * 0.5,
    y: 0,
    width: topRowWidth,
    height: windowHeight * 0.25,
  })

  // Middle row
  zones.push({
    zone: 'left',
    x: 0,
    y: windowHeight * 0.25,
    width: windowWidth * 0.5,
    height: windowHeight * 0.5,
  })
  zones.push({
    zone: 'maximize',
    x: topRowWidth,
    y: windowHeight * 0.25,
    width: windowWidth * 0.5,
    height: windowHeight * 0.5,
  })
  zones.push({
    zone: 'right',
    x: windowWidth * 0.5,
    y: windowHeight * 0.25,
    width: windowWidth * 0.5,
    height: windowHeight * 0.5,
  })

  // Bottom row (25% each)
  zones.push({
    zone: 'bottom-left',
    x: 0,
    y: windowHeight * 0.75,
    width: topRowWidth,
    height: windowHeight * 0.25,
  })
  zones.push({
    zone: 'bottom-center',
    x: topRowWidth,
    y: windowHeight * 0.75,
    width: windowWidth * 0.5,
    height: windowHeight * 0.25,
  })
  zones.push({
    zone: 'bottom-right',
    x: topRowWidth + windowWidth * 0.5,
    y: windowHeight * 0.75,
    width: topRowWidth,
    height: windowHeight * 0.25,
  })

  return zones
}

/**
 * Detect which snap zone a position is in
 */
export function detectSnapZone(
  x: number,
  y: number,
  windowWidth: number,
  windowHeight: number
): SnapZone | null {
  const zones = calculateSnapZones(windowWidth, windowHeight)

  for (const zoneBounds of zones) {
    if (
      x >= zoneBounds.x &&
      x <= zoneBounds.x + zoneBounds.width &&
      y >= zoneBounds.y &&
      y <= zoneBounds.y + zoneBounds.height
    ) {
      return zoneBounds.zone
    }
  }

  return null
}

/**
 * Get snap position and size for a zone
 */
export function getSnapPosition(
  zone: SnapZone,
  windowWidth: number,
  windowHeight: number,
  toolbarHeight = 48,
  taskbarHeight = 48
): { x: number; y: number; width: number; height: number } {
  const availableWidth = windowWidth
  const availableHeight = windowHeight - toolbarHeight - taskbarHeight
  const availableX = 0
  const availableY = toolbarHeight

  switch (zone) {
    case 'top-left':
      return {
        x: availableX,
        y: availableY,
        width: availableWidth * 0.5,
        height: availableHeight * 0.5,
      }
    case 'top-center':
      return {
        x: availableX,
        y: availableY,
        width: availableWidth,
        height: availableHeight * 0.5,
      }
    case 'top-right':
      return {
        x: availableWidth * 0.5,
        y: availableY,
        width: availableWidth * 0.5,
        height: availableHeight * 0.5,
      }
    case 'left':
      return {
        x: availableX,
        y: availableY,
        width: availableWidth * 0.5,
        height: availableHeight,
      }
    case 'maximize':
      return {
        x: availableX,
        y: availableY,
        width: availableWidth,
        height: availableHeight,
      }
    case 'right':
      return {
        x: availableWidth * 0.5,
        y: availableY,
        width: availableWidth * 0.5,
        height: availableHeight,
      }
    case 'bottom-left':
      return {
        x: availableX,
        y: availableY + availableHeight * 0.5,
        width: availableWidth * 0.5,
        height: availableHeight * 0.5,
      }
    case 'bottom-center':
      return {
        x: availableX,
        y: availableY + availableHeight * 0.5,
        width: availableWidth,
        height: availableHeight * 0.5,
      }
    case 'bottom-right':
      return {
        x: availableWidth * 0.5,
        y: availableY + availableHeight * 0.5,
        width: availableWidth * 0.5,
        height: availableHeight * 0.5,
      }
    default:
      return {
        x: availableX,
        y: availableY,
        width: availableWidth,
        height: availableHeight,
      }
  }
}

/**
 * Check if position is near an edge (for snap detection)
 */
export function isNearEdge(
  x: number,
  y: number,
  windowWidth: number,
  windowHeight: number
): { edge: 'top' | 'bottom' | 'left' | 'right' | 'corner' | null; zone: SnapZone | null } {
  const nearTop = y <= SNAP_THRESHOLD
  const nearBottom = y >= windowHeight - SNAP_THRESHOLD
  const nearLeft = x <= SNAP_THRESHOLD
  const nearRight = x >= windowWidth - SNAP_THRESHOLD

  if (nearTop && nearLeft) {
    return { edge: 'corner', zone: 'top-left' }
  }
  if (nearTop && nearRight) {
    return { edge: 'corner', zone: 'top-right' }
  }
  if (nearBottom && nearLeft) {
    return { edge: 'corner', zone: 'bottom-left' }
  }
  if (nearBottom && nearRight) {
    return { edge: 'corner', zone: 'bottom-right' }
  }
  if (nearTop) {
    return { edge: 'top', zone: 'top-center' }
  }
  if (nearBottom) {
    return { edge: 'bottom', zone: 'bottom-center' }
  }
  if (nearLeft) {
    return { edge: 'left', zone: 'left' }
  }
  if (nearRight) {
    return { edge: 'right', zone: 'right' }
  }

  return { edge: null, zone: null }
}

/**
 * Get keyboard shortcut for snap zone
 */
export function getSnapShortcut(zone: SnapZone): string | null {
  const shortcuts: Record<SnapZone, string> = {
    'top-left': '⌘⇧←↑',
    'top-center': '⌘⇧↑',
    'top-right': '⌘⇧→↑',
    'left': '⌘⇧←',
    'maximize': '⌘⇧M',
    'right': '⌘⇧→',
    'bottom-left': '⌘⇧←↓',
    'bottom-center': '⌘⇧↓',
    'bottom-right': '⌘⇧→↓',
  }
  return shortcuts[zone] || null
}
