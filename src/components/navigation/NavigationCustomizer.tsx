/**
 * Navigation Customization UI Component
 * Allows users to reorder and toggle navigation items
 */

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowCounterClockwise, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { DraggableNavItem } from './DraggableNavItem'
import { BusinessToolsPopup } from './BusinessToolsPopup'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { validateNavigation, getAvailableBusinessTools } from '@/lib/types/navigation'
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
  const [showToolsPopup, setShowToolsPopup] = useState(false)

  // keep dialog state in sync with latest nav when reopened
  useEffect(() => {
    setItems(currentNav)
  }, [currentNav])

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
    
    // Ensure items are sorted by order before saving
    const sortedItems = [...items].sort((a, b) => a.order - b.order)
    
    const prefs: NavigationPreferences = {
      items: sortedItems,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
    
    console.log('[NavigationCustomizer] Saving preferences:', prefs)
    console.log('[NavigationCustomizer] Items count:', sortedItems.length)
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

  // Get available business tools that aren't already in navigation
  const availableTools = useMemo(() => {
    const allTools = getAvailableBusinessTools(user.role)
    const currentIds = new Set(items.map(item => item.id))
    return allTools.filter(tool => !currentIds.has(tool.id))
  }, [user.role, items])

  const handleAddTool = (tool: Omit<NavItem, 'visible' | 'order'>) => {
    const maxOrder = Math.max(...items.map(item => item.order), 0)
    const newItem: NavItem = {
      ...tool,
      visible: true,
      order: maxOrder + 1
    }
    setItems([...items, newItem])
    toast.success(`Added ${tool.label} to navigation`)
  }

  return (
    <Card className="glass-card">
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
          <div className="border border-white/10 dark:border-white/10 p-3 glass-card">
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
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
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

        {/* Available Business Tools to Add */}
        {availableTools.length > 0 && (user.role === 'contractor' || user.role === 'operator' || user.role === 'homeowner') && (
          <div className="border-t border-white/10 dark:border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Add Business Tools to Navigation
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowToolsPopup(true)}
              >
                <Plus size={16} className="mr-1" />
                Add Business Tool
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {availableTools.length} tool{availableTools.length !== 1 ? 's' : ''} available
            </p>
            <BusinessToolsPopup
              open={showToolsPopup}
              onOpenChange={setShowToolsPopup}
              availableTools={availableTools}
              onAddTool={handleAddTool}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10 dark:border-white/10">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <ArrowCounterClockwise size={16} className="mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Save Changes
          </Button>
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
