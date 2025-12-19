/**
 * Contractor Bio Builder
 * Free Feature - Guided form → rich profile with trades/certs
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Upload,
  Plus,
  Trash,
  Award
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User as UserType } from "@/lib/types"
import { toast } from "sonner"

interface BioBuilderProps {
  user: UserType
}

export function BioBuilder({ user }: BioBuilderProps) {
  const [bio, setBio] = useLocalKV<any>(`bio-${user.id}`, {
    photo: '',
    headline: '',
    yearsExperience: 0,
    specialties: [] as string[],
    certifications: [] as string[],
    serviceArea: '',
    bio: ''
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCert, setNewCert] = useState("")

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return
    setBio({
      ...bio,
      specialties: [...(bio.specialties || []), newSpecialty]
    })
    setNewSpecialty("")
    toast.success("Specialty added")
  }

  const removeSpecialty = (idx: number) => {
    setBio({
      ...bio,
      specialties: bio.specialties.filter((_: any, i: number) => i !== idx)
    })
  }

  const addCert = () => {
    if (!newCert.trim()) return
    setBio({
      ...bio,
      certifications: [...(bio.certifications || []), newCert]
    })
    setNewCert("")
    toast.success("Certification added")
  }

  const removeCert = (idx: number) => {
    setBio({
      ...bio,
      certifications: bio.certifications.filter((_: any, i: number) => i !== idx)
    })
  }

  const handlePhotoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setBio({ ...bio, photo: dataUrl })
        toast.success("Photo uploaded")
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const completionPercentage = () => {
    let completed = 0
    let total = 8

    if (bio.photo) completed++
    if (bio.headline) completed++
    if (bio.yearsExperience > 0) completed++
    if (bio.specialties?.length > 0) completed++
    if (bio.certifications?.length > 0) completed++
    if (bio.serviceArea) completed++
    if (bio.bio) completed++
    // Always count user name as completed

    return Math.round((completed / total) * 100)
  }

  const saveBio = () => {
    toast.success("Bio saved!")
  }

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User weight="duotone" size={24} />
            Contractor Bio Builder
          </CardTitle>
          <CardDescription>
            Create a professional profile to attract more clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mb-2">
              <div className="w-full bg-white dark:bg-black border-0 shadow-md hover:shadow-lg h-6">
                <div 
                  className="h-full bg-black dark:bg-white"
                  style={{ width: `${completionPercentage()}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-black dark:text-white">
              Profile {completionPercentage()}% complete
            </p>
          </div>

          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2">
              {bio.photo ? (
                <div className="relative w-32 h-32">
                  <img src={bio.photo} alt="Profile" className="w-full h-32 object-cover border-0 shadow-md hover:shadow-lg" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1"
                    onClick={handlePhotoUpload}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handlePhotoUpload}>
                  <Upload size={16} className="mr-2" />
                  Upload Photo
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={bio.headline || ''}
              onChange={(e) => setBio({ ...bio, headline: e.target.value })}
              placeholder="e.g., Licensed General Contractor with 15+ Years Experience"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              type="number"
              value={bio.yearsExperience || 0}
              onChange={(e) => setBio({ ...bio, yearsExperience: Number(e.target.value) })}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Specialties</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="e.g., Kitchen Remodeling"
                onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                className="flex-1"
              />
              <Button onClick={addSpecialty}>
                <Plus size={16} />
              </Button>
            </div>
            {bio.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {bio.specialties.map((spec: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    {spec}
                    <button onClick={() => removeSpecialty(idx)}>
                      <Trash size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Certifications & Licenses</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="e.g., Texas General Contractor License #12345"
                onKeyDown={(e) => e.key === 'Enter' && addCert()}
                className="flex-1"
              />
              <Button onClick={addCert}>
                <Plus size={16} />
              </Button>
            </div>
            {bio.certifications?.length > 0 && (
              <div className="space-y-2 mt-2">
                {bio.certifications.map((cert: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 border-0 shadow-md hover:shadow-lg">
                    <span className="text-sm text-black dark:text-white flex items-center gap-2">
                      <Award size={16} />
                      {cert}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCert(idx)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="service-area">Service Area</Label>
            <Input
              id="service-area"
              value={bio.serviceArea || ''}
              onChange={(e) => setBio({ ...bio, serviceArea: e.target.value })}
              placeholder="e.g., Dallas, TX and surrounding areas"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="bio-text">Bio</Label>
            <Textarea
              id="bio-text"
              value={bio.bio || ''}
              onChange={(e) => setBio({ ...bio, bio: e.target.value })}
              placeholder="Tell potential clients about your experience, approach, and what makes you different..."
              className="mt-2 min-h-[150px]"
            />
          </div>

          <Button onClick={saveBio} className="w-full">
            Save Bio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
