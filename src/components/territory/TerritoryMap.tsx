import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { MapPin } from "@phosphor-icons/react"
import { SpeedMetricsDashboard } from "@/components/viral/SpeedMetricsDashboard"
import type { Territory, User, Job, ContractorReferral } from "@/lib/types"

interface TerritoryMapProps {
  user: User
}

const TEXAS_COUNTIES = [
  "Anderson", "Andrews", "Angelina", "Aransas", "Archer", "Bastrop", "Bell", "Bexar",
  "Brazoria", "Brazos", "Collin", "Dallas", "Denton", "El Paso", "Fort Bend",
  "Galveston", "Harris", "Tarrant", "Travis", "Williamson"
]

export function TerritoryMap({ user }: TerritoryMapProps) {
  const [territories, setTerritories] = useKV<Territory[]>("territories", [])
  const [users] = useKV<User[]>("users", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [referrals] = useKV<ContractorReferral[]>("contractor-referrals", [])

  // Move side effect to useEffect instead of useMemo
  useEffect(() => {
    if (!territories || territories.length === 0) {
      const initialTerritories: Territory[] = TEXAS_COUNTIES.map((county, idx) => ({
        id: idx + 1,
        countyName: `${county} County`,
        status: 'available' as const
      }))
      setTerritories(initialTerritories)
    }
  }, [territories, setTerritories])

  const currentTerritories = useMemo(() => {
    if (!territories || territories.length === 0) {
      // Return default territories for display (side effect handled in useEffect above)
      return TEXAS_COUNTIES.map((county, idx) => ({
        id: idx + 1,
        countyName: `${county} County`,
        status: 'available' as const
      }))
    }
    return territories
  }, [territories])

  const handleClaimTerritory = (territory: Territory) => {
    if (territory.status === 'claimed') {
      toast.error("This territory is already claimed")
      return
    }

    // Operators can only control one territory
    // BACKWARD COMPATIBLE: Check both old and new formats
    const existingTerritory = (currentTerritories || []).find(t => 
      t.operatorId === user.id || t.claimedBy === user.id
    )
    if (existingTerritory) {
      toast.error(`You already control ${existingTerritory.countyName}. Operators can only manage one territory.`)
      return
    }

    // Upgrade to enhanced format if legacy
    const updatedTerritory: Territory = {
      ...territory,
      status: 'claimed' as const,
      operatorId: user.id,
      operatorName: user.fullName,
      claimedBy: user.id, // New format
      claimedAt: new Date().toISOString(), // New format
      version: 'enhanced', // Mark as enhanced
    }

    setTerritories((current) =>
      (current || []).map(t =>
        t.id === territory.id ? updatedTerritory : t
      )
    )

    toast.success(`${territory.countyName} claimed successfully!`)
  }

  // BACKWARD COMPATIBLE: Works with both old and new territory formats
  const { myTerritories, availableTerritories } = useMemo(() => ({
    myTerritories: (currentTerritories || []).filter(t => 
      t.operatorId === user.id || t.claimedBy === user.id
    ),
    availableTerritories: (currentTerritories || []).filter(t => t.status === 'available')
  }), [currentTerritories, user.id])

  return (
    <div className="min-h-screen bg-background p-[1pt]">
      <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Territory Map</h1>
          <p className="text-muted-foreground">
            Operators are contractors who perform well in their zip code. You get priority access to leads. Claim one county to manage jobs in your area.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Territories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{myTerritories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{availableTerritories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Counties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{TEXAS_COUNTIES.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="territories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="territories">Territories</TabsTrigger>
            <TabsTrigger value="metrics">Speed Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="territories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Texas Counties</CardTitle>
                <CardDescription>Click on an available county to claim it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                  {(currentTerritories || []).slice(0, 50).map(territory => {
                    const isMine = territory.operatorId === user.id
                    const isAvailable = territory.status === 'available'
                    
                    return (
                      <button
                        key={territory.id}
                        onClick={() => isAvailable && handleClaimTerritory(territory)}
                        disabled={!isAvailable}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${isMine ? 'bg-primary/10 border-primary hover:bg-primary/20' : ''}
                          ${isAvailable && !isMine ? 'border-accent/30 hover:border-accent hover:bg-accent/5' : ''}
                          ${!isAvailable && !isMine ? 'border-muted bg-muted/30 opacity-60 cursor-not-allowed' : ''}
                          ${isAvailable ? 'hover:shadow-md' : ''}
                        `}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin
                            weight="fill"
                            className={`
                              shrink-0
                              ${isMine ? 'text-primary' : ''}
                              ${isAvailable && !isMine ? 'text-accent' : ''}
                              ${!isAvailable && !isMine ? 'text-muted-foreground' : ''}
                            `}
                            size={20}
                          />
                          <span className="font-medium text-sm leading-tight">
                            {territory.countyName}
                          </span>
                        </div>
                        <Badge
                          variant={isMine ? 'default' : isAvailable ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {isMine ? 'My Territory' : isAvailable ? 'Available' : 'Claimed'}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <SpeedMetricsDashboard jobs={jobs || []} referrals={referrals || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>
  )
}
