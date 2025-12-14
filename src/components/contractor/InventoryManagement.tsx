import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Warning, CheckCircle, ArrowDown } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  reorderPoint: number
  unit: string
  costPerUnit: number
  supplier?: string
  lastOrdered?: string
}

export function InventoryManagement({ user }: { user: User }) {
  const [items, setItems] = useKV<InventoryItem[]>("inventory-items", [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    currentStock: 0,
    reorderPoint: 10,
    unit: 'each',
    costPerUnit: 0
  })

  const lowStockItems = useMemo(() => 
    items.filter(item => item.currentStock <= item.reorderPoint),
    [items]
  )

  const totalValue = useMemo(() => 
    items.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0),
    [items]
  )

  const categories = ['Materials', 'Tools', 'Hardware', 'Safety', 'Other']

  const handleAddItem = () => {
    if (!newItem.name) return
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newItem.name!,
      category: newItem.category || 'Other',
      currentStock: newItem.currentStock || 0,
      reorderPoint: newItem.reorderPoint || 10,
      unit: newItem.unit || 'each',
      costPerUnit: newItem.costPerUnit || 0,
      supplier: newItem.supplier
    }
    setItems([...items, item])
    setNewItem({ name: '', category: '', currentStock: 0, reorderPoint: 10, unit: 'each', costPerUnit: 0 })
    setShowAddDialog(false)
  }

  const handleUpdateStock = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
        : item
    ))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <Package weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Inventory Management</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Track materials, stock levels, and reorder points
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl">Add Inventory Item</DialogTitle>
                    <DialogDescription>Track materials and supplies</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., 2x4 Lumber"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        placeholder="e.g., each, box, lb"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Current Stock</Label>
                      <Input
                        type="number"
                        value={newItem.currentStock}
                        onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>Reorder Point</Label>
                      <Input
                        type="number"
                        value={newItem.reorderPoint}
                        onChange={(e) => setNewItem({ ...newItem, reorderPoint: parseInt(e.target.value) || 0 })}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>Cost Per Unit ($)</Label>
                      <Input
                        type="number"
                        value={newItem.costPerUnit}
                        onChange={(e) => setNewItem({ ...newItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="h-11">
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem} className="h-11">
                      Add Item
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">{items.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Items</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{lowStockItems.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Low Stock</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                    <Warning size={24} weight="fill" />
                    Low Stock Alert
                  </CardTitle>
                <CardDescription>
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need reordering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="p-3 bg-white dark:bg-black rounded-lg border border-red-200 dark:border-red-800">
                      <div className="font-semibold text-black dark:text-white">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.currentStock} {item.unit} remaining (reorder at {item.reorderPoint})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const isLowStock = item.currentStock <= item.reorderPoint
              return (
                <Card
                  key={item.id}
                  className={`bg-white dark:bg-black border-2 ${
                    isLowStock 
                      ? 'border-red-200 dark:border-red-800' 
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-black dark:text-white">{item.name}</CardTitle>
                        <CardDescription>{item.category}</CardDescription>
                      </div>
                      {isLowStock && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Current Stock</span>
                        <span className="font-semibold text-black dark:text-white">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Reorder Point</span>
                        <span className="font-semibold text-black dark:text-white">
                          {item.reorderPoint} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${(item.currentStock * item.costPerUnit).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStock(item.id, -1)}
                        className="flex-1"
                      >
                        <ArrowDown size={14} weight="duotone" className="mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStock(item.id, 1)}
                        className="flex-1"
                      >
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {items.length === 0 && (
              <Card className="col-span-full bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardContent className="p-12 text-center">
                  <Package size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg">No inventory items yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Track your materials and supplies
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus size={18} className="mr-2" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}