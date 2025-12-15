/**
 * Navigation Customization UI Component
 * Allows users to reorder and toggle navigation items
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { DraggableNavItem } from './DraggableNavItem'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { validateNavigation } from '@/lib/types/navigation'
import type { User } from '@/lib/types'

interface NavigationCustomizerProps {
  user: User
  currentNav: NavItem[]
  onSave: (preferences: NavigationPreferences) => void
  onReset: () => void
  onClose?: () => void
}

export function NavigationCustomizer({
  user,
  currentNav,
  onSave,
  onReset,
  onClose
}: NavigationCustomizerProps) {
  const [items, setItems] = useState<NavItem[]>(currentNav)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const handleToggle = (id: string, visible: boolean) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, visible } : item
    )
    
    // Validate before updating
    const validation = validateNavigation(updated)
    if (!validation.valid && !visible) {
      toast.error(validation.errors[0])
      return
    }
    
    setItems(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const handleDragOver = (index: number) => {
    // Visual feedback handled in DraggableNavItem
  }

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const updated = [...items]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    
    // Update order values
    const reordered = updated.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    
    setItems(reordered)
  }

  const handleSave = () => {
    // Final validation
    const validation = validateNavigation(items)
    if (!validation.valid) {
      toast.error(validation.errors.join(', '))
      return
    }
    
    const prefs: NavigationPreferences = {
      items,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
    
    onSave(prefs)
    toast.success('Navigation preferences saved!')
    onClose?.()
  }

  const handleReset = () => {
    if (confirm('Reset navigation to defaults? Your customizations will be lost.')) {
      onReset()
      toast.success('Navigation reset to defaults')
      onClose?.()
    }
  }

  const visibleCount = useMemo(() => 
    items.filter(item => item.visible).length,
    [items]
  )

  return (
    <Card className="border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0_#000] dark:shadow-[8px_8px_0_#fff]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black dark:text-white">
          Customize Navigation
        </CardTitle>
        <CardDescription className="text-black dark:text-white">
          Drag items to reorder, toggle visibility with switches. {visibleCount} item{visibleCount !== 1 ? 's' : ''} visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="border-2 border-black dark:border-white p-3 bg-white dark:bg-black">
          <p className="text-sm font-semibold text-black dark:text-white mb-1">
            How to customize:
          </p>
          <ul className="text-xs text-black dark:text-white space-y-1 list-disc list-inside">
            <li>Drag items by the grip handle to reorder</li>
            <li>Toggle switches to show/hide items</li>
            <li>Required items cannot be hidden</li>
          </ul>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, index) => (
            <DraggableNavItem
              key={item.id}
              item={item}
              index={index}
              isDragging={draggingIndex === index}
              onToggle={handleToggle}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t-2 border-black dark:border-white">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-2 border-black dark:border-white"
          >
            <ArrowCounterClockwise size={16} className="mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]"
          >
            Save Changes
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-black dark:border-white"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
