/**
 * Navigation Customization UI Component
 * Allows users to reorder and toggle navigation items
 */

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowCounterClockwise, Plus, Sliders, Eye, EyeSlash, GripVertical, CheckCircle, Question } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { DraggableNavItem } from './DraggableNavItem'
import { BusinessToolsPopup } from './BusinessToolsPopup'
import { NavigationTutorial } from './NavigationTutorial'
import { getNavIcon } from '@/lib/types/navigation'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { validateNavigation, getAvailableBusinessTools } from '@/lib/types/navigation'
import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'

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
  const [showTutorial, setShowTutorial] = useState(false)

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
    <div className="space-y-6">
      {/* Header Section - Similar to JobPoster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Sliders size={28} weight="duotone" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">
                  Customize Navigation
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Arrange your navigation menu to match your workflow. {visibleCount} item{visibleCount !== 1 ? 's' : ''} visible.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTutorial(true)}
              className="gap-2"
            >
              <Question size={18} weight="duotone" />
              Take Tutorial
            </Button>
          </div>
        </CardHeader>
      </Card>

      <NavigationTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false)
          toast.success("Tutorial completed! Start customizing your navigation.")
        }}
      />

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Navigation Items (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <GripVertical size={20} weight="duotone" className="text-primary" />
                Navigation Items
              </CardTitle>
              <CardDescription>
                Drag to reorder • Toggle to show/hide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const Icon = getNavIcon(item.iconName)
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        handleDragStart(index)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        handleDragOver(index)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromIndex = draggingIndex
                        if (fromIndex !== null && fromIndex !== index) {
                          handleDrop(fromIndex, index)
                        }
                      }}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-move",
                        draggingIndex === index 
                          ? "border-primary bg-primary/5 opacity-50" 
                          : "border-border hover:border-primary/50 hover:shadow-md bg-white dark:bg-black"
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                        <GripVertical size={20} weight="duotone" />
                      </div>

                      {/* Icon */}
                      {Icon && (
                        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                          <Icon size={20} weight="duotone" className="text-primary" />
                        </div>
                      )}

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-foreground">{item.label}</h3>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.page}</p>
                      </div>

                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!item.required) {
                            handleToggle(item.id, !item.visible)
                          }
                        }}
                        disabled={item.required}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                          item.visible
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground",
                          item.required && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {item.visible ? (
                          <>
                            <Eye size={18} weight="duotone" />
                            <span className="text-sm font-medium">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeSlash size={18} weight="duotone" />
                            <span className="text-sm font-medium">Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Actions (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Eye size={20} weight="duotone" className="text-primary" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Your Navigation Menu:</p>
                {items.filter(item => item.visible).slice(0, 5).map((item) => {
                  const Icon = getNavIcon(item.iconName)
                  return (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
                      {Icon && <Icon size={16} weight="duotone" className="text-primary" />}
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                  )
                })}
                {items.filter(item => item.visible).length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{items.filter(item => item.visible).length - 5} more
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="text-lg font-bold text-foreground">{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Visible</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{visibleCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hidden</span>
                <span className="text-lg font-bold text-muted-foreground">{items.length - visibleCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Available Business Tools */}
          {availableTools.length > 0 && (user.role === 'contractor' || user.role === 'operator' || user.role === 'homeowner') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus size={20} weight="duotone" className="text-primary" />
                  Add Business Tools
                </CardTitle>
                <CardDescription>
                  {availableTools.length} tool{availableTools.length !== 1 ? 's' : ''} available to add
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowToolsPopup(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Browse Available Tools
                </Button>
                <BusinessToolsPopup
                  open={showToolsPopup}
                  onOpenChange={setShowToolsPopup}
                  availableTools={availableTools}
                  onAddTool={handleAddTool}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={handleSave}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <CheckCircle size={20} className="mr-2" weight="duotone" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                <ArrowCounterClockwise size={18} className="mr-2" />
                Reset to Defaults
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
