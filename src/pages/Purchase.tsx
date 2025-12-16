import React from "react"
import { GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"

export function PurchasePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8 mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Purchase Pro</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Unlock Pro features like priority job alerts, advanced analytics, and premium support. This is a mock purchase page.</p>
          <div className="max-w-md mx-auto">
            <div className="mb-4 text-left">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-gray-500">Plan</div>
                <div className="text-sm font-medium">Pro</div>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-lg font-semibold">$59 / mo</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onNavigate('home')} className="flex-1">Maybe later</Button>
              <Button onClick={() => {
                // mock purchase success path: navigate to dashboard or show toast
                onNavigate('dashboard')
              }} className="flex-1">Purchase</Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default PurchasePage
