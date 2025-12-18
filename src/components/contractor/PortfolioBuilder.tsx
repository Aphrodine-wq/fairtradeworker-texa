/**
 * Contractor Portfolio Builder
 * Free Feature - Drag-and-drop before/after photos + testimonials → shareable link
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Images, 
  Upload,
  Trash,
  Share,
  Copy,
  User,
  Plus
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface Portfolio {
  id: string
  contractorId: string
  bio: string
  services: string[]
  beforeAfterPhotos: { before: string; after: string; description: string }[]
  testimonials: { name: string; text: string; rating: number }[]
  publicUrl: string
  views: number
}

interface PortfolioBuilderProps {
  user: User
}

export function PortfolioBuilder({ user }: PortfolioBuilderProps) {
  const [portfolio, setPortfolio] = useLocalKV<Portfolio | null>("portfolio", null)
  const [bio, setBio] = useState(portfolio?.bio || "")
  const [services, setServices] = useState(portfolio?.services.join(", ") || "")

  const publicUrl = portfolio ? `ftw.io/pro/${user.id}` : ""

  const savePortfolio = () => {
    const updated: Portfolio = {
      id: portfolio?.id || `portfolio-${Date.now()}`,
      contractorId: user.id,
      bio,
      services: services.split(',').map(s => s.trim()).filter(Boolean),
      beforeAfterPhotos: portfolio?.beforeAfterPhotos || [],
      testimonials: portfolio?.testimonials || [],
      publicUrl,
      views: portfolio?.views || 0
    }
    setPortfolio(updated)
    toast.success("Portfolio saved!")
  }

  const handlePhotoUpload = (type: 'before' | 'after', index?: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const current = portfolio || {
          id: `portfolio-${Date.now()}`,
          contractorId: user.id,
          bio: "",
          services: [],
          beforeAfterPhotos: [],
          testimonials: [],
          publicUrl: "",
          views: 0
        }

        if (index !== undefined) {
          // Update existing pair
          const updated = [...current.beforeAfterPhotos]
          updated[index] = { ...updated[index], [type]: dataUrl }
          setPortfolio({ ...current, beforeAfterPhotos: updated })
        } else {
          // Create new pair
          setPortfolio({
            ...current,
            beforeAfterPhotos: [...current.beforeAfterPhotos, {
              before: type === 'before' ? dataUrl : '',
              after: type === 'after' ? dataUrl : '',
              description: ''
            }]
          })
        }
        toast.success("Photo uploaded!")
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${publicUrl}`)
    toast.success("Link copied!")
  }

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images weight="duotone" size={24} />
            Portfolio Builder
          </CardTitle>
          <CardDescription>
            Create a shareable portfolio with before/after photos and testimonials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential clients about your experience..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="services">Services (comma-separated)</Label>
            <Input
              id="services"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Kitchen remodeling, Bathroom renovation, Flooring..."
              className="mt-2"
            />
          </div>

          <div>
            <Label>Before/After Photos</Label>
            <div className="mt-2 space-y-4">
              {(portfolio?.beforeAfterPhotos || []).map((pair, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 p-4 border-0 shadow-md hover:shadow-lg">
                  <div>
                    <Label>Before</Label>
                    {pair.before ? (
                      <div className="relative mt-2">
                        <img src={pair.before} alt="Before" className="w-full h-48 object-cover border-0 shadow-md hover:shadow-lg" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1"
                          onClick={() => handlePhotoUpload('before', idx)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-48 mt-2"
                        onClick={() => handlePhotoUpload('before', idx)}
                      >
                        <Upload size={24} className="mr-2" />
                        Upload Before
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>After</Label>
                    {pair.after ? (
                      <div className="relative mt-2">
                        <img src={pair.after} alt="After" className="w-full h-48 object-cover border-0 shadow-md hover:shadow-lg" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1"
                          onClick={() => handlePhotoUpload('after', idx)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-48 mt-2"
                        onClick={() => handlePhotoUpload('after', idx)}
                      >
                        <Upload size={24} className="mr-2" />
                        Upload After
                      </Button>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Textarea
                      placeholder="Description of this project..."
                      value={pair.description}
                      onChange={(e) => {
                        const updated = [...(portfolio?.beforeAfterPhotos || [])]
                        updated[idx].description = e.target.value
                        setPortfolio({ ...portfolio!, beforeAfterPhotos: updated })
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handlePhotoUpload('before')}
              >
                <Plus size={16} className="mr-2" />
                Add Before/After Pair
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={savePortfolio}>Save Portfolio</Button>
            {publicUrl && (
              <Button variant="outline" onClick={copyLink}>
                <Copy size={16} className="mr-2" />
                Copy Public Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {portfolio && (
        <Card glass={false}>
          <CardHeader>
            <CardTitle>Portfolio Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-black dark:text-white">{portfolio.beforeAfterPhotos.length}</p>
                <p className="text-sm text-black dark:text-white">Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-black dark:text-white">{portfolio.views}</p>
                <p className="text-sm text-black dark:text-white">Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-black dark:text-white">{portfolio.testimonials.length}</p>
                <p className="text-sm text-black dark:text-white">Testimonials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
