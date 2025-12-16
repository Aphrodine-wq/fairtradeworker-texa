import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PurchaseModal({
  open,
  onClose,
  tierLabel = "Pro",
  price = "$59",
}: {
  open: boolean
  onClose: () => void
  tierLabel?: string
  price?: string
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const confirm = async () => {
    setLoading(true)
    // Mock network delay
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSuccess(true)
    // auto-close after short delay
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-2">Purchase {tierLabel}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This is a mock purchase flow — no real payment will be taken.</p>
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm text-gray-500">Plan</div>
            <div className="text-sm font-medium">{tierLabel}</div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-lg font-semibold">{price} / mo</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={confirm} className="flex-1" disabled={loading || success}>
            {loading ? "Processing..." : success ? "Purchased" : `Confirm — ${price}`}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PurchaseModal
