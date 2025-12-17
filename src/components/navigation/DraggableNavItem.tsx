/**
 * Draggable Navigation Item Component with smooth drag-and-drop
 * Uses native HTML5 drag-and-drop API with enhanced UX
 */

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { GripVertical, Lock } from '@phosphor-icons/react'
import type { NavItem } from '@/lib/types/navigation'
import { getNavIcon } from '@/lib/types/navigation'
import { cn } from '@/lib/utils'

interface DraggableNavItemProps {
  item: NavItem
  index: number
  isDragging: boolean
  onToggle: (id: string, visible: boolean) => void
  onDragStart: (index: number) => void
  onDragEnd: () => void
  onDragOver: (index: number) => void
  onDrop: (fromIndex: number, toIndex: number) => void
}

export function DraggableNavItem({
  item,
  index,
  isDragging,
  onToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: DraggableNavItemProps) {
  const [dragOver, setDragOver] = useState(false)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  
  const Icon = getNavIcon(item.iconName)

  const handleDragStart = (e: React.DragEvent) => {
    setIsLocalDragging(true)
    onDragStart(index)
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    
    // Create drag image with opacity
    if (dragRef.current) {
      const dragImage = dragRef.current.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.5'
      dragImage.style.transform = 'rotate(2deg)'
      dragImage.style.pointerEvents = 'none'
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, e.clientX - dragRef.current.getBoundingClientRect().left, e.clientY - dragRef.current.getBoundingClientRect().top)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsLocalDragging(false)
    setDragOver(false)
    onDragEnd()
    
    // Remove drag classes
    if (dragRef.current) {
      dragRef.current.classList.remove('opacity-50', 'scale-95')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    if (!dragOver) {
      setDragOver(true)
      onDragOver(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only set dragOver to false if we're actually leaving the element
    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX
      const y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragOver(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onDrop(fromIndex, index)
    }
    
    setDragOver(false)
  }

  return (
    <div
      ref={dragRef}
      draggable={!item.required}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "transition-all duration-200 ease-out cursor-move",
        isDragging || isLocalDragging ? "opacity-50 scale-95 rotate-1" : "",
        dragOver && !isLocalDragging ? "scale-105 shadow-lg border-primary border-2" : "",
        item.required ? "cursor-not-allowed" : "hover:shadow-md"
      )}
    >
      <Card className={cn(
        "p-4 flex items-center gap-4 border",
        dragOver && !isLocalDragging ? "border-primary bg-primary/5" : "border-border"
      )}>
        {/* Drag Handle */}
        <div className={cn(
          "flex-shrink-0 cursor-grab active:cursor-grabbing",
          item.required && "cursor-not-allowed opacity-50"
        )}>
          {item.required ? (
            <Lock size={20} className="text-muted-foreground" weight="fill" />
          ) : (
            <GripVertical size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0">
            <Icon 
              size={20} 
              className="text-black dark:text-white"
              weight="regular"
            />
          </div>
        )}

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-black dark:text-white truncate">
            {item.label}
            {item.required && (
              <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
            )}
          </div>
          {item.page && (
            <div className="text-xs text-muted-foreground truncate">
              {item.page}
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        <div className="flex-shrink-0">
          <Switch
            checked={item.visible}
            onCheckedChange={(checked) => onToggle(item.id, checked)}
            disabled={item.required}
            aria-label={`Toggle ${item.label} visibility`}
          />
        </div>
      </Card>
    </div>
  )
}
