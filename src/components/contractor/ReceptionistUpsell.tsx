/**
 * Live Upsell & Quoting for AI Receptionist
 * Enhancement - AI suggests upsells and generates instant quotes during calls
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Phone,
  ArrowRight
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import type { ReceptionistCall } from "@/lib/receptionist"
import { generateUpsells, generateInstantQuote } from "@/lib/receptionistUpsell"
import { toast } from "sonner"
import { AIReceptionistIntegration } from "./AIReceptionistIntegration"

interface ReceptionistUpsellProps {
  user: User
  onNavigate?: (page: string) => void
}

export function ReceptionistUpsell({ user, onNavigate }: ReceptionistUpsellProps) {
  const isPro = user?.isPro || false
  const [calls] = useLocalKV<ReceptionistCall[]>("receptionist-calls", [])
  const [upsellEnabled, setUpsellEnabled] = useLocalKV<boolean>(`receptionist-upsell-enabled-${user?.id}`, true)
  const [selectedCall, setSelectedCall] = useState<string | null>(null)

  const call = useMemo(() => {
    return calls.find(c => c.id === selectedCall)
  }, [calls, selectedCall])

  const quote = useMemo(() => {
    if (!call?.extraction) return null
    return generateInstantQuote(call.extraction, user?.id || '')
  }, [call, user?.id])

  const upsells = useMemo(() => {
    if (!call?.extraction) return []
    return generateUpsells(call.extraction)
  }, [call])

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles weight="duotone" size={24} />
            Live Upsell & Quoting
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to enable AI-powered upsells during receptionist calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Integration Component */}
      <AIReceptionistIntegration user={user} onNavigate={onNavigate} />

      {/* Upsell & Quoting Section */}
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles weight="duotone" size={24} />
            Live Upsell & Quoting
          </CardTitle>
          <CardDescription>
            AI-powered upsell suggestions and instant quotes during receptionist calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="upsell-enabled">Enable Upsell Engine</Label>
              <p className="text-xs text-black dark:text-white mt-1">
                AI will suggest relevant upsells during calls and generate instant quotes
              </p>
            </div>
            <Switch
              id="upsell-enabled"
              checked={upsellEnabled}
              onCheckedChange={(checked) => {
                setUpsellEnabled(checked)
                toast.success(checked ? "Upsell engine enabled" : "Upsell engine disabled")
              }}
            />
          </div>

          {upsellEnabled && (
            <>
              <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
                <div className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
                  <div>
                    <p className="font-semibold text-black dark:text-white mb-2">How It Works</p>
                    <ul className="text-sm text-black dark:text-white space-y-1 list-disc list-inside">
                      <li>AI analyzes call content in real-time</li>
                      <li>Identifies relevant upsell opportunities</li>
                      <li>Generates instant quotes with pricing</li>
                      <li>Offers discounts to encourage immediate commitment</li>
                      <li>Captures deposit via text link during call</li>
                    </ul>
                  </div>
                </div>
              </div>

              {calls.length > 0 && (
                <div>
                  <Label>Select Call to View Upsells</Label>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {calls.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        className={`p-3 border-2 cursor-pointer transition-all ${
                          selectedCall === c.id
                            ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                            : 'border-black dark:border-white'
                        }`}
                        onClick={() => setSelectedCall(c.id)}
                      >
                        <p className="font-semibold text-black dark:text-white">
                          {c.extraction?.description?.substring(0, 50) || 'Call'}
                        </p>
                        <p className="text-xs text-black dark:text-white">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {quote && (
                <div className="space-y-4">
                  <div className="p-4 border-0 shadow-md hover:shadow-lg bg-white dark:bg-black">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-black dark:text-white">Instant Quote</h3>
                      <Badge variant="default">
                        Valid until {new Date(quote.validUntil).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-black dark:text-white">Base Service</span>
                        <span className="font-bold text-black dark:text-white">
                          ${quote.basePrice.low.toLocaleString()} - ${quote.basePrice.high.toLocaleString()}
                        </span>
                      </div>

                      {upsells.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                          <p className="font-semibold text-black dark:text-white mb-2">Suggested Upsells</p>
                          {upsells.map((upsell, idx) => (
                            <div key={idx} className="p-3 mb-2 border-0 shadow-md hover:shadow-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-black dark:text-white">{upsell.service}</p>
                                  <p className="text-sm text-black dark:text-white">{upsell.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-black dark:text-white">
                                    ${upsell.estimatedPrice.low.toLocaleString()} - ${upsell.estimatedPrice.high.toLocaleString()}
                                  </p>
                                  {upsell.discount && (
                                    <Badge variant="default" className="mt-1">
                                      {upsell.discount}% OFF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t-2 border-black dark:border-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg text-black dark:text-white">Total</span>
                          <span className="font-bold text-xl text-black dark:text-white">
                            ${quote.totalPrice.low.toLocaleString()} - ${quote.totalPrice.high.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-black dark:text-white">Deposit (20%)</span>
                          <span className="font-bold text-black dark:text-white">
                            ${quote.depositAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4">
                      <DollarSign size={16} className="mr-2" />
                      Send Quote & Request Deposit
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
