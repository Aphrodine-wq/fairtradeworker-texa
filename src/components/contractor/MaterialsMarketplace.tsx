import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Plus, Trash, Percent, Wrench } from "@phosphor-icons/react"
import { motion } from "framer-motion"

interface MaterialItem {
  id: string
  name: string
  quantity: number
  estimatedPrice: number
  category: 'plumbing' | 'electrical' | 'hvac' | 'general'
}

interface MaterialsMarketplaceProps {
  jobScope?: string
  aiMaterialsList?: string[]
}

const COMMON_MATERIALS = {
  plumbing: [
    { name: "PEX Tubing (10ft)", price: 12 },
    { name: "Shutoff Valve", price: 8 },
    { name: "PEX Fittings (10 pack)", price: 15 },
    { name: "Pipe Wrench", price: 25 },
    { name: "Plumber's Tape", price: 3 },
  ],
  electrical: [
    { name: "15A Circuit Breaker", price: 8 },
    { name: "20A Circuit Breaker", price: 10 },
    { name: "Electrical Outlet (10 pack)", price: 18 },
    { name: "Wire Nuts (100 pack)", price: 12 },
    { name: "Romex Wire (50ft)", price: 35 },
  ],
  hvac: [
    { name: "Furnace Filter (4 pack)", price: 45 },
    { name: "Refrigerant R-410A", price: 120 },
    { name: "Thermostat", price: 85 },
    { name: "Condensate Pump", price: 95 },
  ],
  general: [
    { name: "Drywall Screws (1lb)", price: 8 },
    { name: "Joint Compound (5gal)", price: 18 },
    { name: "Sandpaper Assortment", price: 12 },
    { name: "Paint Roller Kit", price: 15 },
  ]
}

export function MaterialsMarketplace({ jobScope, aiMaterialsList }: MaterialsMarketplaceProps) {
  const [cart, setCart] = useState<MaterialItem[]>([])
  const [customItem, setCustomItem] = useState({ name: "", quantity: 1, price: 0 })

  const addToCart = (name: string, price: number, category: MaterialItem['category']) => {
    const existing = cart.find(item => item.name === name)
    if (existing) {
      setCart(cart.map(item =>
        item.name === name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: Date.now().toString(),
        name,
        quantity: 1,
        estimatedPrice: price,
        category
      }])
    }
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ))
    }
  }

  const addCustomItem = () => {
    if (customItem.name && customItem.price > 0) {
      setCart([...cart, {
        id: Date.now().toString(),
        name: customItem.name,
        quantity: customItem.quantity,
        estimatedPrice: customItem.price,
        category: 'general'
      }])
      setCustomItem({ name: "", quantity: 1, price: 0 })
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0)
  const bulkDiscount = subtotal * 0.12
  const total = subtotal - bulkDiscount
  const retailPrice = subtotal
  const savings = bulkDiscount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Materials Marketplace</h2>
          <p className="text-muted-foreground">
            Order materials with bulk discounts – no contractor fees
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-2">
          <Percent className="mr-2" size={16} weight="bold" />
          10-15% Bulk Discount
        </Badge>
      </div>

      {aiMaterialsList && aiMaterialsList.length > 0 && (
        <Card className="p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-sm">
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-1" weight="duotone" />
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-2">
                AI-Suggested Materials for This Job
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiMaterialsList.map((material, i) => (
                  <Badge key={i} variant="outline" className="bg-white dark:bg-black">
                    {material}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-black dark:text-white/80 mt-2">
                Based on the job scope, these materials are commonly needed
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(COMMON_MATERIALS).map(([category, items]) => (
            <Card key={category} className="p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                <Package weight="duotone" />
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Est. ${item.price} (retail: ${(item.price * 1.15).toFixed(2)})
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item.name, item.price, category as MaterialItem['category'])}
                    >
                      <Plus className="mr-1" size={16} weight="bold" />
                      Add
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          ))}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus weight="bold" />
              Add Custom Item
            </h3>
            <div className="grid gap-3">
              <Input
                placeholder="Item name"
                value={customItem.name}
                onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={customItem.price || ""}
                  onChange={(e) => setCustomItem({ ...customItem, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              <Button onClick={addCustomItem} disabled={!customItem.name || customItem.price <= 0}>
                Add to Cart
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart weight="duotone" size={24} />
              <h3 className="text-lg font-semibold">Your Cart</h3>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart size={48} className="mx-auto mb-2 text-black dark:text-white" />
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md font-mono shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ${item.estimatedPrice} × {item.quantity}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <div className="ml-auto font-semibold">
                          ${(item.estimatedPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Retail Price:</span>
                    <span className="line-through text-muted-foreground">${retailPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-black dark:text-white font-medium">
                    <span>Bulk Discount (12%):</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Your Price:</span>
                    <span className="text-black dark:text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-center text-black dark:text-white">
                    You save ${savings.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2" weight="bold" />
                    Order Materials
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Coming soon: Direct ordering from Ferguson, Home Depot Pro, and Lowe's
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md flex-shrink-0 shadow-sm">
            <Percent className="w-6 h-6 text-black dark:text-white" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-2">
              How the Materials Marketplace Works
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-black dark:text-white/80">
              <div>
                <div className="font-semibold mb-1">1. Auto-Generated Lists</div>
                <p>AI identifies materials from job scope</p>
              </div>
              <div>
                <div className="font-semibold mb-1">2. Bulk Discounts</div>
                <p>10-15% savings via platform partnerships</p>
              </div>
              <div>
                <div className="font-semibold mb-1">3. Zero Contractor Fees</div>
                <p>You keep all the savings</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
