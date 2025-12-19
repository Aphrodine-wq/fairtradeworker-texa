import { useRef, useEffect } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useVoidStore } from '@/lib/void/store'
import { useVoidGrid } from '@/hooks/useVoidGrid'
import { VoidIcon } from './VoidIcon'
import { GRID_CONFIG } from '@/lib/void/config'

export function VoidDesktop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { icons, hiddenIcons, openWindow } = useVoidStore()
  const { handleDragEnd } = useVoidGrid()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )

  const visibleIcons = icons.filter((icon) => !hiddenIcons.includes(icon.id))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event

    if (!containerRef.current || !delta) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const icon = icons.find((i) => i.id === active.id)
    if (!icon) return

    // Get the dragged element's current position
    const draggedElement = document.querySelector(`[data-icon-id="${active.id}"]`) as HTMLElement
    if (!draggedElement) return

    const currentLeft = parseFloat(draggedElement.style.left || '0')
    const currentTop = parseFloat(draggedElement.style.top || '0')

    // Calculate new position with delta
    const newClientX = containerRect.left + currentLeft + delta.x
    const newClientY = containerRect.top + currentTop + delta.y

    handleDragEnd(icon.id, newClientX, newClientY, containerRect)
  }


  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        ref={containerRef}
        className="h-full w-full relative overflow-hidden"
        style={{ backgroundColor: 'transparent' }}
      >
        {visibleIcons.map((icon) => (
          <VoidIcon
            key={icon.id}
            icon={icon}
            onDoubleClick={(menuId) => {
              if (menuId) {
                openWindow(menuId)
              }
            }}
            onRightClick={(e, icon) => {
              // Context menu will be implemented later
              e.preventDefault()
            }}
          />
        ))}
      </div>
    </DndContext>
  )
}
