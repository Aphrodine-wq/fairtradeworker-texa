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
    toast.info('Analyzing photos... this may take 30-60 seconds')

    try {
      const scopePrompt = `You are creating a detailed Scope of Services document for a construction project.

Project Information:
- Project Name: ${projectInfo.name}
- Address: ${projectInfo.address}, ${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}
- Number of Photos Provided: ${photos.length}

Based on a typical construction project with ${photos.length} photos uploaded, create a comprehensive Scope of Services document following this EXACT format:

Scope of Services
${projectInfo.name}
${projectInfo.address}
${projectInfo.city}, ${projectInfo.state} ${projectInfo.zip}
__________________________________________________________________

Project Overview:
Provide a detailed 2-4 sentence overview describing the apparent scope of work for this type of project. Note that this is a preliminary scope based on limited information and should be verified on-site.

Divisions of Work

Site Preparation
Initial Assessment
Detailed description of typical site preparation work including survey, clearing, grading, and access considerations. Include standard safety protocols and utility location requirements.

Foundation Work
Foundation and Structural Elements
Description of foundation inspection, preparation, and any structural work typically involved in this type of project. Include material specifications and construction methods.

Primary Construction
Main Structure and Systems
Comprehensive description of the primary construction activities, systems installation, and major components. Be specific about materials, dimensions where standard, and construction methods.

Exterior Work
Exterior Finishing and Weatherproofing  
Description of exterior finishing work, weatherproofing, trim, and protective coatings typical for this project type.

Interior Work
Interior Finishing and Systems
Description of interior finishing work including walls, ceilings, floors, and interior systems completion.

Final Details
Completion and Quality Control
Description of final inspections, cleanup, and project completion standards.

Additional Notes
Include 3-4 detailed professional notes about:
- Permitting and compliance requirements
- Material selection and quality standards
- Timeline and scheduling considerations
- Safety and site management protocols
__________________________________________________________________
${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

IMPORTANT NOTE TO INCLUDE AT TOP:
"This preliminary scope is generated based on project information provided. A detailed on-site assessment is required to finalize specifications, measurements, and complete material lists. This document serves as a starting point for project planning and should be reviewed and amended by qualified contractors."

CRITICAL INSTRUCTIONS:
1. Write in professional construction documentation language
2. Be comprehensive but acknowledge this is preliminary
3. Use industry-standard terminology and best practices
4. Include all typical work divisions for this type of project
5. Focus on quality, safety, and compliance throughout

Generate a complete, professional scope document now.`

      const generatedScope = await window.spark.llm(scopePrompt, 'gpt-4o', false)

      if (!generatedScope || generatedScope.trim().length < 100) {
        throw new Error('Generated scope is too short or empty')
      }

      setScope(generatedScope)
      toast.success('Scope generated successfully! Please review and adjust based on your specific photos.')
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
            AI Scope Generator
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Generate professional scope of services documents for your projects</p>
          <p className="text-sm text-primary font-medium mb-4">Powered by GPT-4o</p>
          <div className="max-w-2xl mx-auto bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Upload photos to help document your project. The AI will generate a comprehensive preliminary scope template that you can customize based on your specific project details and on-site assessment.
            </p>
          </div>
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
