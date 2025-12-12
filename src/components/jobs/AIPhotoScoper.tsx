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
    toast.info('Analyzing photos with AI vision... this may take 20-40 seconds')

    try {
      const base64Images = await Promise.all(
        photos.map(photo => convertToBase64(photo.file))
      )

      const imageContent = base64Images.map((base64, i) => ({
        type: 'image_url',
        image_url: {
          url: `data:${photos[i].file.type};base64,${base64}`,
          detail: 'high'
        }
      }))

      const textPrompt = `You are analyzing construction project photos to create a detailed Scope of Services document.

Project Information:
- Project Name: ${projectInfo.name}
- Address: ${projectInfo.address}, ${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}

Analyze the ${photos.length} photo(s) provided and create a comprehensive Scope of Services document following this EXACT format:

Scope of Services
${projectInfo.name}
${projectInfo.address}
${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}
__________________________________________________________________

Project Overview:
Provide a detailed 2-4 sentence overview based on what you see in the photos. Describe the type of structure, its purpose, key features, and overall scope.

Divisions of Work

For each visible work area, create sections like:

[Work Category - e.g., Site Preparation, Foundation, Structural Construction, Exterior Finish, etc.]
[Subsection Name]
Detailed description of work visible in photos. Be VERY specific about:
- Materials you can identify (e.g., "6x6x12 posts", "treated 4x6 timbers", specific finishes)
- Dimensions and measurements you can estimate
- Construction methods visible
- Specific components (doors, windows, fixtures, etc.)

Continue for ALL work areas visible in the photos. Common categories: Site Preparation, Foundation, Structural Construction, Exterior Finish, Windows and Doors, Electrical, Plumbing, Interior Finishing, Landscaping, HVAC, Roofing, etc.

Additional Notes
Include 2-4 detailed notes about future expansion, drainage, material choices, permitting needs, design considerations, or other relevant observations from the photos.
__________________________________________________________________
${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

CRITICAL INSTRUCTIONS:

1. ACTUALLY ANALYZE THE PHOTOS: Look carefully at what's visible and describe ONLY what you can see
2. BE SPECIFIC: Use measurements, materials, and professional terminology for everything visible
3. NO GENERIC CONTENT: Every detail should be based on the actual photos provided
4. PROFESSIONAL TONE: Write as a construction professional would document a site
5. COMPREHENSIVE: Cover all visible work areas, materials, and construction details

Now analyze the photos carefully and generate the scope based on what you actually see.`
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: textPrompt
                },
                ...imageContent
              ]
            }
          ],
          max_tokens: 4000
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || 'API request failed')
      }

      const generatedScope = data.choices[0]?.message?.content || 'No scope generated'

      setScope(generatedScope)
      toast.success('Scope generated successfully!')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate scope'
      setError(`Error: ${errorMessage}`)
      toast.error(errorMessage)
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
