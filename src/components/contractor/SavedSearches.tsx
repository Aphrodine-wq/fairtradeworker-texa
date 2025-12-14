/**
 * Job Alerts & Saved Searches
 * Free Feature - Save filters → browser notifications for matches
 */

import { useState, useCallback } from "react"
import { CircleNotch } from "@phosphor-icons/react"
import { safeInput } from "@/lib/utils"
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

  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<{
    searchName?: string
    zipCodes?: string
    budgetRange?: string
  }>({})

  const createSearch = useCallback(async () => {
    setErrors({})

    // Validation
    if (!searchName.trim()) {
      setErrors({ searchName: "Search name is required" })
      toast.error("Enter a search name")
      return
    } else if (searchName.trim().length < 3) {
      setErrors({ searchName: "Search name must be at least 3 characters" })
      toast.error("Search name must be at least 3 characters")
      return
    } else if (searchName.trim().length > 100) {
      setErrors({ searchName: "Search name must be less than 100 characters" })
      toast.error("Search name must be less than 100 characters")
      return
    }

    if (zipCodes.trim()) {
      const zipArray = zipCodes.split(',').map(z => z.trim()).filter(Boolean)
      const invalidZips = zipArray.filter(zip => !/^\d{5}(-\d{4})?$/.test(zip))
      if (invalidZips.length > 0) {
        setErrors({ zipCodes: "Please enter valid ZIP codes (e.g., 78701 or 78701-1234)" })
        toast.error("Please enter valid ZIP codes")
        return
      }
    }

    if (minBudget < 0 || maxBudget < 0) {
      setErrors({ budgetRange: "Budget cannot be negative" })
      toast.error("Budget cannot be negative")
      return
    }

    if (minBudget > maxBudget) {
      setErrors({ budgetRange: "Minimum budget cannot exceed maximum budget" })
      toast.error("Minimum budget cannot exceed maximum budget")
      return
    }

    setIsCreating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const newSearch: SavedSearch = {
        id: `search-${Date.now()}`,
        name: safeInput(searchName.trim()),
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
      setMinBudget(0)
      setMaxBudget(100000)
    } catch (error) {
      console.error("Error creating search:", error)
      toast.error("Failed to create search. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }, [searchName, zipCodes, jobTypes, minBudget, maxBudget, searches, setSearches])

  const toggleSearch = (id: string) => {
    setSearches(searches.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ))
  }

  const [deletingSearchId, setDeletingSearchId] = useState<string | null>(null)

  const deleteSearch = useCallback(async (id: string) => {
    if (deletingSearchId) return

    const search = searches.find(s => s.id === id)
    const confirmed = window.confirm(
      search
        ? `Are you sure you want to delete "${search.name}"? This action cannot be undone.`
        : "Are you sure you want to delete this search? This action cannot be undone."
    )
    if (!confirmed) return

    setDeletingSearchId(id)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setSearches(searches.filter(s => s.id !== id))
      toast.success("Search deleted successfully")
    } catch (error) {
      console.error("Error deleting search:", error)
      toast.error('Failed to delete search. Please try again.')
    } finally {
      setDeletingSearchId(null)
    }
  }, [searches, deletingSearchId, setSearches])

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
                onChange={(e) => {
                  setSearchName(safeInput(e.target.value))
                  if (errors.searchName) setErrors(prev => ({ ...prev, searchName: undefined }))
                }}
                onBlur={() => {
                  if (searchName.trim() && searchName.trim().length < 3) {
                    setErrors(prev => ({ ...prev, searchName: "Search name must be at least 3 characters" }))
                  }
                }}
                placeholder="e.g., Kitchen Jobs in Dallas"
                className={errors.searchName ? "border-[#FF0000]" : ""}
                disabled={isCreating}
                maxLength={100}
                required
                aria-invalid={!!errors.searchName}
                aria-describedby={errors.searchName ? "search-name-error" : undefined}
              />
              {errors.searchName && (
                <p id="search-name-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                  {errors.searchName}
                </p>
              )}
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
              <div key={search.id} className="p-4 border border-black/20 dark:border-white/20 flex items-start justify-between">
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
