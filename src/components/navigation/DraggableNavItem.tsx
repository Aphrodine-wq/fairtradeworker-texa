/**
 * Draggable navigation item component
 */

import { useState } from 'react'
import { GripVertical, Eye, EyeSlash } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/types/navigation'
import { getNavIcon } from '@/lib/types/navigation'

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
  const Icon = getNavIcon(item.iconName)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    onDragStart(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
    onDragOver(index)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    onDrop(fromIndex, index)
    onDragEnd()
  }

  return (
    <div
      draggable={!item.required}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "border border-white/10 dark:border-white/10 glass-card p-4 mb-2 flex items-center gap-4 transition-all rounded-lg",
        dragOver 
          ? "border-yellow-400/50 dark:border-yellow-600/50 shadow-lg" 
          : "shadow-md",
        isDragging && "opacity-50",
        !item.required ? "cursor-move" : "cursor-not-allowed opacity-75"
      )}
    >
      {/* Drag Handle */}
      <div className={`flex-shrink-0 ${item.required ? 'opacity-50' : ''}`}>
        <GripVertical 
          size={20} 
          className="text-black dark:text-white"
          weight={isDragging ? "fill" : "regular"}
        />
      </div>

      {/* Icon */}
      {Icon && (
        <div className="flex-shrink-0">
          <Icon 
            size={20} 
            className="text-black dark:text-white"
            weight={item.visible ? "fill" : "regular"}
          />
        </div>
      )}

      {/* Label */}
      <Label 
        htmlFor={`nav-${item.id}`}
        className="flex-1 font-semibold text-black dark:text-white cursor-pointer"
      >
        {item.label}
        {item.required && (
          <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
        )}
      </Label>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-2">
        {item.visible ? (
          <Eye size={16} className="text-black dark:text-white" />
        ) : (
          <EyeSlash size={16} className="text-muted-foreground" />
        )}
        <Switch
          id={`nav-${item.id}`}
          checked={item.visible}
          onCheckedChange={(checked) => {
            if (!item.required || checked) {
              onToggle(item.id, checked)
            }
          }}
          disabled={item.required && !item.visible}
        />
      </div>
    </div>
  )
}
