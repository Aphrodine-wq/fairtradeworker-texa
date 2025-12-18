/**
 * VOID Desktop - Icon grid container with drag and drop
 */

import { useMemo } from 'react'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import { VoidIcon } from './VoidIcon'
import { VOID_ICONS } from '@/lib/void/config'
import type { VoidIcon as VoidIconType, MenuId } from '@/lib/void/types'

interface VoidDesktopProps {
  onIconDoubleClick: (menuId: MenuId) => void
  onIconClick?: (menuId: MenuId) => void
  onIconRightClick: (iconId: string, event: React.MouseEvent) => void
}

export function VoidDesktop({ onIconDoubleClick, onIconClick, onIconRightClick }: VoidDesktopProps) {
  const [iconPositions, setIconPositions] = useKV<Record<string, { x: number; y: number }>>('void-icon-positions', {})
  const [pinnedIcons, setPinnedIcons] = useKV<string[]>('void-pinned-icons', [])
  const [hiddenIcons, setHiddenIcons] = useKV<string[]>('void-hidden-icons', [])

  // Initialize icon positions in grid layout
  const icons = useMemo(() => {
    return VOID_ICONS.map((iconConfig, index) => {
      const savedPosition = iconPositions[iconConfig.id]
      
      // Default grid layout: 5 columns, 4 rows
      const cols = 5
      const col = index % cols
      const row = Math.floor(index / cols)
      const spacing = 120
      const startX = 100
      const startY = 150

      const defaultPosition = savedPosition || {
        x: startX + (col * spacing),
        y: startY + (row * spacing),
      }

      return {
        ...iconConfig,
        position: defaultPosition,
        isPinned: pinnedIcons.includes(iconConfig.id),
        isHidden: hiddenIcons.includes(iconConfig.id),
      } as VoidIconType
    }).filter(icon => !icon.isHidden)
  }, [iconPositions, pinnedIcons, hiddenIcons])

  const handleIconDragEnd = (iconId: string, position: { x: number; y: number }) => {
    setIconPositions(prev => ({
      ...prev,
      [iconId]: position,
    }))
  }

  const handleRightClick = (iconId: string, event: React.MouseEvent) => {
    event.preventDefault()
    onIconRightClick(iconId, event)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {icons.map(icon => (
        <VoidIcon
          key={icon.id}
          icon={icon}
          onClick={() => onIconClick?.(icon.menuId as MenuId)}
          onDoubleClick={() => onIconDoubleClick(icon.menuId as MenuId)}
          onRightClick={(e) => handleRightClick(icon.id, e)}
          onDragEnd={(pos) => handleIconDragEnd(icon.id, pos)}
          tooltip={`Click for menu, double-click to open ${icon.label}`}
        />
      ))}
    </div>
  )
}
