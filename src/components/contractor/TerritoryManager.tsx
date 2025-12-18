import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MapTrifold, Plus, Trash, Users, MapPin,
  Package, Globe, Settings
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Territory } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TerritoryManagerProps {
  user: User
}

export function TerritoryManager({ user }: TerritoryManagerProps) {
  const [territories, setTerritories] = useKV<Territory[]>("crm-territories", [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTerritory, setNewTerritory] = useState({
    name: '',
    type: 'geographic' as Territory['type'],
    boundaries: [] as Territory['boundaries'],
    assignedUsers: [] as string[],
    rules: [] as Territory['rules']
  })

  const handleCreateTerritory = () => {
    if (!newTerritory.name) {
      toast.error("Please enter a territory name")
      return
    }

    const territory: Territory = {
      id: `territory-${Date.now()}`,
      contractorId: user.id,
      name: newTerritory.name,
      type: newTerritory.type,
      boundaries: newTerritory.boundaries,
      assignedUsers: newTerritory.assignedUsers,
      rules: newTerritory.rules,
      createdAt: new Date().toISOString()
    }

    setTerritories((current) => [...(current || []), territory])
    setShowCreateDialog(false)
    setNewTerritory({
      name: '',
      type: 'geographic',
      boundaries: [],
      assignedUsers: [],
      rules: []
    })
    toast.success("Territory created successfully")
  }

  const handleDeleteTerritory = (territoryId: string) => {
    setTerritories((current) => (current || []).filter(t => t.id !== territoryId))
    toast.success("Territory deleted")
  }

  const getTerritoryIcon = (type: Territory['type']) => {
    switch (type) {
      case 'geographic':
        return <MapPin weight="duotone" size={24} className="text-black dark:text-white" />
      case 'product':
        return <Package weight="duotone" size={24} className="text-black dark:text-white" />
      case 'hybrid':
        return <Globe weight="duotone" size={24} className="text-black dark:text-white" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <MapTrifold weight="duotone" size={28} className="text-black dark:text-white" />
            Territory Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage geographic and product-based territories for your sales team
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Territory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Territory</DialogTitle>
              <DialogDescription>
                Define territory boundaries and assignment rules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Territory Name</Label>
                <Input
                  value={newTerritory.name}
                  onChange={(e) => setNewTerritory({ ...newTerritory, name: e.target.value })}
                  placeholder="e.g., West Coast Region"
                />
              </div>
              <div>
                <Label>Territory Type</Label>
                <Select
                  value={newTerritory.type}
                  onValueChange={(v: any) => setNewTerritory({ ...newTerritory, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="product">Product-Based</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Boundaries</Label>
                <Textarea
                  placeholder="Enter zip codes, cities, states, or custom boundaries"
                  value={newTerritory.boundaries.map(b => 
                    b.type === 'zipcode' ? b.value as string :
                    b.type === 'city' ? b.value as string :
                    b.type === 'state' ? b.value as string :
                    `${b.coordinates?.lat}, ${b.coordinates?.lng} (${b.coordinates?.radius}mi)`
                  ).join('\n')}
                  onChange={(e) => {
                    // Simple parsing - in real app would be more sophisticated
                    const values = e.target.value.split('\n').filter(v => v.trim())
                    setNewTerritory({
                      ...newTerritory,
                      boundaries: values.map(v => ({
                        type: 'zipcode' as const,
                        value: v.trim()
                      }))
                    })
                  }}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter one boundary per line (zip codes, cities, states, or coordinates)
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTerritory}>
                  Create Territory
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {territories.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
          <MapTrifold size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
          <p className="text-muted-foreground mb-4">No territories defined yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>Create Your First Territory</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {territories.map(territory => (
            <Card key={territory.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTerritoryIcon(territory.type)}
                    <div>
                      <CardTitle className="text-lg">{territory.name}</CardTitle>
                      <CardDescription className="capitalize">{territory.type} territory</CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTerritory(territory.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Boundaries</span>
                      <Badge variant="outline">{territory.boundaries.length}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {territory.boundaries.slice(0, 3).map((b, idx) => (
                        <div key={idx}>
                          {b.type}: {b.value}
                        </div>
                      ))}
                      {territory.boundaries.length > 3 && (
                        <div>+{territory.boundaries.length - 3} more</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Assigned Users</span>
                      <Badge variant="outline">{territory.assignedUsers.length}</Badge>
                    </div>
                    {territory.assignedUsers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No users assigned</p>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {territory.assignedUsers.length} user{territory.assignedUsers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Rules</span>
                      <Badge variant="outline">{territory.rules.length}</Badge>
                    </div>
                    {territory.rules.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No rules defined</p>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {territory.rules.length} rule{territory.rules.length !== 1 ? 's' : ''} active
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings size={16} className="mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      View Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
