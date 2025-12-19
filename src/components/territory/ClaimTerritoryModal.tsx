import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, CheckCircle, CreditCard, Gift } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { Territory, User, TerritoryClaim } from "@/lib/types"
import { calculateTerritoryPricing } from "@/lib/territory/pricing"
import { checkFirst300Availability, canClaimFree, recordFreeClaim } from "@/lib/territory/first300"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { cn } from "@/lib/utils"

interface ClaimTerritoryModalProps {
  open: boolean
  onClose: () => void
  territory: Territory
  user: User | null | undefined
  onClaimSuccess: () => void
}

export function ClaimTerritoryModal({
  open,
  onClose,
  territory,
  user,
  onClaimSuccess,
}: ClaimTerritoryModalProps) {
  const [entityType, setEntityType] = useState<'individual' | 'llc' | 'corporation'>('individual')
  const [entityEmail, setEntityEmail] = useState('')
  const [entityName, setEntityName] = useState('')
  const [entityTaxId, setEntityTaxId] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const [territories, setTerritories] = useKV<Territory[]>("territories", [])
  
  // Check if First 300 is available
  const isFirst300Available = checkFirst300Availability()
  const canClaimFreeTerritory = user && isFirst300Available && canClaimFree(user.id, {
    entityType,
    entityEmail: entityEmail || user.email,
    entityName,
    entityTaxId,
  })
  
  // Calculate pricing
  const pricing = calculateTerritoryPricing(territory, canClaimFreeTerritory || false)
  
  // Pre-fill email from user
  useEffect(() => {
    if (user?.email && !entityEmail) {
      setEntityEmail(user.email)
    }
  }, [user, entityEmail])
  
  const handleClaim = async () => {
    // Validation
    if (!entityEmail) {
      toast.error("Email is required")
      return
    }
    
    if ((entityType === 'llc' || entityType === 'corporation') && !entityTaxId) {
      toast.error("Tax ID is required for businesses")
      return
    }
    
    if (!user) {
      toast.error("You must be logged in to claim a territory")
      return
    }
    
    setProcessing(true)
    
    try {
      // Check if territory is still available
      const currentTerritory = territories.find(t => t.id === territory.id)
      if (currentTerritory?.status === 'claimed' && currentTerritory.operatorId !== user.id) {
        toast.error("This territory has already been claimed")
        setProcessing(false)
        return
      }
      
      // Record free claim if applicable
      if (canClaimFreeTerritory) {
        recordFreeClaim(user.id, {
          entityType,
          entityEmail,
          entityName,
          entityTaxId,
        }, territory.id)
      }
      
      // Update territory
      const updatedTerritory: Territory = {
        ...territory,
        status: 'claimed',
        operatorId: user.id,
        operatorName: user.fullName,
        claimedBy: user.id,
        claimedAt: new Date().toISOString(),
        entityType,
        entityEmail,
        entityName: entityName || undefined,
        entityTaxId: entityTaxId || undefined,
        isFirst300Free: canClaimFreeTerritory || false,
        oneTimeFee: pricing.oneTimeFee,
        monthlyFee: pricing.monthlyFee,
        version: 'enhanced',
      }
      
      // Update territories array
      setTerritories((current) => {
        const existing = current || []
        const index = existing.findIndex(t => t.id === territory.id)
        if (index >= 0) {
          const updated = [...existing]
          updated[index] = updatedTerritory
          return updated
        } else {
          return [...existing, updatedTerritory]
        }
      })
      
      // Update user's territoryId if they don't have one
      // In production, this would update Supabase
      
      // If paid, initiate Stripe checkout
      if (!canClaimFreeTerritory && pricing.oneTimeFee > 0) {
        // TODO: Integrate Stripe checkout
        toast.info("Stripe integration coming soon. Territory claimed (demo mode)")
      }
      
      toast.success(
        canClaimFreeTerritory 
          ? "Territory claimed successfully! (First 300 Free)" 
          : "Territory claimed successfully!"
      )
      
      onClaimSuccess()
    } catch (error) {
      console.error("Error claiming territory:", error)
      toast.error("Failed to claim territory. Please try again.")
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-black/20 dark:border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={24} weight="duotone" />
            Claim Territory
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {territory.countyName}, {territory.state || 'Unknown State'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* County Information */}
          <Card className="border-0 bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">County Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">County:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{territory.countyName}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">State:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{territory.state || 'N/A'}</p>
                </div>
                {territory.population && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Population:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {territory.population.toLocaleString()}
                    </p>
                  </div>
                )}
                {territory.ruralityClassification && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Classification:</span>
                    <Badge variant="outline" className="ml-2">
                      {territory.ruralityClassification}
                    </Badge>
                  </div>
                )}
                {territory.projectedJobOutput && (
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Projected Job Output:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {territory.projectedJobOutput.toLocaleString()} jobs/year
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing Display */}
          <Card className={cn(
            "border-0",
            canClaimFreeTerritory ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-gray-900"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {canClaimFreeTerritory ? (
                  <Gift size={20} className="text-green-600 dark:text-green-400" weight="fill" />
                ) : (
                  <CreditCard size={20} className="text-gray-600 dark:text-gray-400" weight="duotone" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">Pricing</h3>
              </div>
              
              {canClaimFreeTerritory ? (
                <div className="space-y-2">
                  <Badge variant="default" className="bg-green-600 dark:bg-green-400 text-white">
                    FREE - First 300 Claim
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This territory is free as part of the First 300 free claims program.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">One-time Fee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${pricing.oneTimeFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Fee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${pricing.monthlyFee.toLocaleString()}/month
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">Total First Year:</span>
                    <span className="text-gray-900 dark:text-white">
                      ${pricing.totalFirstYear.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Entity Information Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Entity Information</h3>
            
            <div>
              <Label className="mb-2 block">Entity Type</Label>
              <RadioGroup value={entityType} onValueChange={(v) => setEntityType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="llc" id="llc" />
                  <Label htmlFor="llc" className="cursor-pointer">LLC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corporation" id="corporation" />
                  <Label htmlFor="corporation" className="cursor-pointer">Corporation</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="entityEmail">Email *</Label>
              <Input
                id="entityEmail"
                type="email"
                value={entityEmail}
                onChange={(e) => setEntityEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            {(entityType === 'llc' || entityType === 'corporation') && (
              <>
                <div>
                  <Label htmlFor="entityName">Business Name</Label>
                  <Input
                    id="entityName"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="entityTaxId">Tax ID (EIN) *</Label>
                  <Input
                    id="entityTaxId"
                    value={entityTaxId}
                    onChange={(e) => setEntityTaxId(e.target.value)}
                    placeholder="12-3456789"
                    required
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              disabled={processing || !entityEmail}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black"
            >
              {processing ? (
                "Processing..."
              ) : canClaimFreeTerritory ? (
                <>
                  <Gift size={16} className="mr-2" />
                  Claim Free Territory
                </>
              ) : (
                <>
                  <CreditCard size={16} className="mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
