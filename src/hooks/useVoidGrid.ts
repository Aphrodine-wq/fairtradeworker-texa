import { useCallback } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { snapToGrid, clampToGrid, clientToGrid } from '@/lib/void/grid'
import type { GridPosition } from '@/lib/void/types'
import { GRID_CONFIG } from '@/lib/void/config'

export function useVoidGrid() {
  const { iconPositions, updateIconPosition, icons } = useVoidStore()

  const getIconPosition = useCallback(
    (iconId: string): GridPosition => {
      return iconPositions[iconId] || { x: 0, y: 0 }
    },
    [iconPositions]
  )

  const updatePosition = useCallback(
    (iconId: string, position: GridPosition, snap: boolean = true) => {
      const icon = icons.find((i) => i.id === iconId)
      if (!icon) return

      let newPosition = position

      // Snap to grid if enabled
      if (snap) {
        newPosition = snapToGrid(position, 4) // 4-unit snap
      }

      // Clamp to grid bounds
      newPosition = clampToGrid(newPosition, icon.size)

      updateIconPosition(iconId, newPosition)
    },
    [icons, updateIconPosition]
  )

  const handleDragEnd = useCallback(
    (iconId: string, clientX: number, clientY: number, containerRect: DOMRect) => {
      const gridPosition = clientToGrid(clientX, clientY, containerRect)
      updatePosition(iconId, gridPosition, true)
    },
    [updatePosition]
  )

  const getPixelPosition = useCallback(
    (iconId: string, containerWidth: number = window.innerWidth): { x: number; y: number } => {
      const gridPos = getIconPosition(iconId)
      return {
        x: GRID_CONFIG.unitToPixel(gridPos.x, containerWidth),
        y: GRID_CONFIG.unitToPixel(gridPos.y, containerWidth),
      }
    },
    [getIconPosition]
  )

  return {
    getIconPosition,
    updatePosition,
    handleDragEnd,
    getPixelPosition,
  }
}
