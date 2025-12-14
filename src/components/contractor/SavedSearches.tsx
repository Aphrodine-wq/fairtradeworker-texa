/**
 * Job Alerts & Saved Searches
 * Free Feature - Save filters → browser notifications for matches
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Plus, 
  Trash,
  MapPin,
  DollarSign
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface SavedSearch {
  id: string
  name: string
  filters: {
    zipCodes?: string[]
    jobTypes?: string[]
    budgetRange?: { min: number; max: number }
    keywords?: string[]
  }
  active: boolean
  createdAt: string
}

interface SavedSearchesProps {
  user: User
}

export function SavedSearches({ user }: SavedSearchesProps) {
  const [searches, setSearches] = useLocalKV<SavedSearch[]>("saved-searches", [])
  const [searchName, setSearchName] = useState("")
  const [zipCodes, setZipCodes] = useState("")
  const [jobTypes, setJobTypes] = useState("")
  const [minBudget, setMinBudget] = useState<number>(0)
  const [maxBudget, setMaxBudget] = useState<number>(100000)

  const createSearch = () => {
    if (!searchName.trim()) {
      toast.error("Enter a search name")
      return
    }

    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: searchName,
      filters: {
        zipCodes: zipCodes.split(',').map(z => z.trim()).filter(Boolean),
        jobTypes: jobTypes.split(',').map(t => t.trim()).filter(Boolean),
        budgetRange: { min: minBudget, max: maxBudget },
        keywords: []
      },
      active: true,
      createdAt: new Date().toISOString()
    }

    setSearches([...searches, newSearch])
    toast.success(`Search "${searchName}" saved!`)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    setSearchName("")
    setZipCodes("")
    setJobTypes("")
  }

  const toggleSearch = (id: string) => {
    setSearches(searches.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ))
  }

  const deleteSearch = (id: string) => {
    setSearches(searches.filter(s => s.id !== id))
    toast.success("Search deleted")
  }

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell weight="duotone" size={24} />
            Saved Searches & Job Alerts
          </CardTitle>
          <CardDescription>
            Save your job filters and get notified when new matching jobs are posted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Kitchen Jobs in Dallas"
              />
            </div>
            <div>
              <Label htmlFor="zip-codes">ZIP Codes (comma-separated)</Label>
              <Input
                id="zip-codes"
                value={zipCodes}
                onChange={(e) => setZipCodes(e.target.value)}
                placeholder="75001, 75002, 75003"
              />
            </div>
            <div>
              <Label htmlFor="job-types">Job Types (comma-separated)</Label>
              <Input
                id="job-types"
                value={jobTypes}
                onChange={(e) => setJobTypes(e.target.value)}
                placeholder="kitchen, bathroom, flooring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-budget">Min Budget</Label>
                <Input
                  id="min-budget"
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="max-budget">Max Budget</Label>
                <Input
                  id="max-budget"
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <Button onClick={createSearch}>
            <Plus size={16} className="mr-2" />
            Save Search
          </Button>
        </CardContent>
      </Card>

      {searches.length > 0 && (
        <Card glass={false}>
          <CardHeader>
            <CardTitle>Your Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searches.map((search) => (
              <div key={search.id} className="p-4 border-2 border-black dark:border-white flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-black dark:text-white">{search.name}</h3>
                    <Badge variant={search.active ? "default" : "outline"}>
                      {search.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-black dark:text-white">
                    {search.filters.zipCodes && search.filters.zipCodes.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {search.filters.zipCodes.join(", ")}
                      </span>
                    )}
                    {search.filters.budgetRange && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        ${search.filters.budgetRange.min.toLocaleString()} - ${search.filters.budgetRange.max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSearch(search.id)}
                  >
                    {search.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSearch(search.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
