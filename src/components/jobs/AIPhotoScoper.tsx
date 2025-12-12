import { useState } from 'react'
import { Camera, FileText, Download, CircleNotch, WarningCircle, Copy, Image } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ProjectInfo {
  name: string
  address: string
  city: string
  state: string
  zip: string
}

interface Photo {
  file: File
  preview: string
  name: string
}

export function AIPhotoScoper() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    address: '',
    city: '',
    state: 'TX',
    zip: ''
  })
  const [scope, setScope] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))
    setPhotos([...photos, ...newPhotos])
    setError('')
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    URL.revokeObjectURL(newPhotos[index].preview)
    newPhotos.splice(index, 1)
    setPhotos(newPhotos)
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const generateScope = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo')
      return
    }

    if (!projectInfo.name || !projectInfo.address) {
      setError('Please fill in project name and address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const photoData = await Promise.all(
        photos.map(async (photo) => ({
          type: "image",
          source: {
            type: "base64",
            media_type: photo.file.type,
            data: await convertToBase64(photo.file)
          }
        }))
      )

      const prompt = `You are analyzing construction project photos to create a detailed Scope of Services document.

Project Information:
- Project Name: ${projectInfo.name}
- Address: ${projectInfo.address}, ${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}

Please analyze the provided photos and create a comprehensive Scope of Services document following this EXACT format:

Scope of Services
${projectInfo.name}
${projectInfo.address}
${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}
__________________________________________________________________

Project Overview:
[Provide a detailed 2-4 sentence overview of what the project entails based on the photos. Describe the type of structure, its purpose, key features, and overall scope.]

Divisions of Work

[Work Category 1 - e.g., Site Preparation, Foundation, Structural Construction, etc.]
[Subsection Name]
[Detailed description of work to be performed. Be very specific about materials (e.g., "6x6x12 posts", "treated 4x6 timbers"), dimensions (e.g., "30' x 40' layout", "12' side walls"), and construction methods. Include specific measurements, materials, and techniques visible in the photos.]

[Work Category 2]
[Subsection Name]
[Detailed description with specifics]

[Continue for all work areas visible in photos - common categories include: Site Preparation, Foundation, Structural Construction, Exterior Finish, Windows and Doors, Electrical, Plumbing, Interior Finishing, Landscaping, etc.]

Additional Notes
[Include 2-4 detailed notes about: future expansion possibilities, drainage considerations, material efficiency choices, HOA compliance needs, permitting requirements, design considerations, or other relevant project-specific information]
__________________________________________________________________
${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

CRITICAL FORMATTING AND CONTENT GUIDELINES:

1. NO COMPANY OR PERSONAL NAMES: Do not include any company names, CEO names, contractor names, or personal names anywhere in the document. Only include the date at the bottom.

2. BE EXTREMELY SPECIFIC WITH MATERIALS AND DIMENSIONS:
   - Use exact measurements: "6x6x12 posts", "30' x 40' pole barn", "12' side walls"
   - Name specific materials: "R-7 temp seal insulation", "treated 4x6 timbers", "galvalume finish"
   - Include door/window specs: "3/0 x 6/8 exterior door", "36" x 36" windows", "12' wide x 10' tall roll-up garage door"
   - Mention finishes: "Architecture shingles", "Hardie board lap siding", "brick (2 ½" x 7 ¾")"

3. ORGANIZE INTO CLEAR DIVISIONS:
   - Use major category headers (Site Preparation, Foundation, Structural Construction, etc.)
   - Include subsections under each category
   - Common categories: Site Preparation, Foundation/Concrete, Structural Construction, Exterior Finish, Windows and Doors, Electrical, Plumbing, Interior Finishing, Additional Features

4. USE PROFESSIONAL CONSTRUCTION TERMINOLOGY:
   - "Form and pour" for concrete work
   - "Rough in" for plumbing/electrical prep
   - "Erect posts", "install trusses", "wrap exterior"
   - "Level the site", "excavation", "backfill"

5. INCLUDE LOCATION SPECIFICS:
   - When exact location matters: "centered on the front of the building"
   - When flexible: "at customer-preferred locations" or "per client specification"

6. ADDITIONAL NOTES SHOULD COVER:
   - Future expansion considerations
   - Drainage and water management
   - Material choices and efficiency
   - Compliance needs (HOA, permits, codes)
   - Design integration with existing structures

7. WRITING STYLE:
   - Professional and detailed
   - Use complete sentences in paragraph form under each subsection
   - Be thorough but concise
   - Match the tone of formal construction documentation

8. ONLY DESCRIBE WHAT YOU SEE:
   - Base all descriptions on visible elements in photos
   - Use "customer-preferred" or "per specification" for unclear details
   - Don't make assumptions about work not visible

Now analyze the photos carefully and generate the complete, professionally formatted scope of services document.`
      
      const generatedScope = await window.spark.llm(prompt, "gpt-4o")

      setScope(generatedScope)
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadScope = () => {
    const blob = new Blob([scope], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectInfo.name.replace(/\s+/g, '_')}_Scope.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Scope downloaded!')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scope)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 pb-6 border-b-2 border-primary">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-3">
            AI Photo Scoper
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Transform project photos into professional scope documents</p>
          <p className="text-sm text-primary font-medium">Powered by GPT-4o</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <FileText className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">Project Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-sm font-semibold">Project Name</Label>
                  <Input
                    id="project-name"
                    type="text"
                    placeholder="e.g., Holland Pole Barn Project"
                    value={projectInfo.name}
                    onChange={(e) => setProjectInfo({...projectInfo, name: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold">Street Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="e.g., CR 215"
                    value={projectInfo.address}
                    onChange={(e) => setProjectInfo({...projectInfo, address: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Austin"
                      value={projectInfo.city}
                      onChange={(e) => setProjectInfo({...projectInfo, city: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="TX"
                      value={projectInfo.state}
                      onChange={(e) => setProjectInfo({...projectInfo, state: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip" className="text-sm font-semibold">ZIP</Label>
                    <Input
                      id="zip"
                      type="text"
                      placeholder="78701"
                      value={projectInfo.zip}
                      onChange={(e) => setProjectInfo({...projectInfo, zip: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Image className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">Project Photos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-all">
                  <div className="flex flex-col items-center">
                    <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                    <span className="text-base text-foreground font-medium mb-1">Click to upload photos</span>
                    <span className="text-sm text-muted-foreground">or drag and drop</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photos.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-all"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={generateScope}
              disabled={loading}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <CircleNotch className="w-6 h-6 animate-spin mr-3" />
                  Analyzing Photos...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 mr-3" />
                  Generate Scope of Services
                </>
              )}
            </Button>

            {error && (
              <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 flex items-start gap-3">
                <WarningCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}

            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4">
              <p className="text-sm text-foreground text-center font-medium">
                💰 Fast, accurate, and powered by AI
              </p>
            </div>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">Generated Scope</CardTitle>
                </div>
                {scope && (
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      onClick={downloadScope}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-5 min-h-[700px] max-h-[700px] overflow-y-auto border-2 border-border">
                {scope ? (
                  <pre className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-mono">{scope}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-4">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                    </div>
                    <p className="text-foreground text-lg font-semibold mb-2">
                      Your scope will appear here
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Upload photos and project info, then click generate
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
