import { useState, useCallback, useEffect } from 'react'
import { safeInput } from '@/lib/utils'
import { Camera, FileText, Download, CircleNotch, WarningCircle, Copy, Image, ArrowsClockwise, CheckCircle, LinkSimple, Heart, Microphone, Stop, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { revenueConfig } from '@/lib/revenueConfig'
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription'

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
  originalSize: number
  compressedSize?: number
  isCompressed?: boolean
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
  const [compressionQuality, setCompressionQuality] = useState(80)
  const [compressing, setCompressing] = useState(false)
  const [notes, setNotes] = useState('')
  
  const { 
    transcript, 
    interimTranscript, 
    isListening, 
    isSupported, 
    start: startRecording, 
    stop: stopRecording, 
    reset: resetRecording 
  } = useVoiceTranscription()

  const handleStopRecording = () => {
    stopRecording()
    if (transcript) {
      setNotes(prev => {
        const newNotes = prev ? `${prev}\n${transcript}` : transcript
        return newNotes
      })
      resetRecording()
    }
  }

  const [uploadErrors, setUploadErrors] = useState<string[]>([])

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const errors: string[] = []
    const validPhotos: Photo[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const maxPhotos = 20

    if (photos.length + files.length > maxPhotos) {
      errors.push(`Maximum ${maxPhotos} photos allowed. You have ${photos.length} and tried to add ${files.length}.`)
      toast.error(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 10MB)`)
        return
      }
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`)
        return
      }

      try {
        validPhotos.push({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          originalSize: file.size,
          isCompressed: false
        })
      } catch (err) {
        errors.push(`Failed to process ${file.name}`)
        console.error(`Error processing ${file.name}:`, err)
      }
    })

    if (errors.length > 0) {
      setUploadErrors(errors)
      toast.error(`${errors.length} file${errors.length > 1 ? 's' : ''} failed to upload`)
    }

    if (validPhotos.length > 0) {
      setPhotos([...photos, ...validPhotos])
      setError('')
      setUploadErrors([])
      toast.success(`${validPhotos.length} photo${validPhotos.length > 1 ? 's' : ''} added`)
    }
  }, [photos])

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    URL.revokeObjectURL(newPhotos[index].preview)
    newPhotos.splice(index, 1)
    setPhotos(newPhotos)
  }

  const compressImage = async (file: File, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          const maxDimension = 2048
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            quality / 100
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const compressBatch = async () => {
    if (photos.length === 0) {
      toast.error('No photos to compress')
      return
    }

    setCompressing(true)
    let successCount = 0
    let totalSaved = 0

    try {
      const compressedPhotos = await Promise.all(
        photos.map(async (photo) => {
          try {
            if (photo.isCompressed) {
              return photo
            }

            const compressed = await compressImage(photo.file, compressionQuality)
            const saved = photo.originalSize - compressed.size
            totalSaved += saved
            successCount++

            URL.revokeObjectURL(photo.preview)
            return {
              ...photo,
              file: compressed,
              preview: URL.createObjectURL(compressed),
              compressedSize: compressed.size,
              isCompressed: true
            }
          } catch (err) {
            console.error(`Failed to compress ${photo.name}:`, err)
            return photo
          }
        })
      )

      setPhotos(compressedPhotos)
      
      const savedMB = (totalSaved / (1024 * 1024)).toFixed(2)
      toast.success(
        `Compressed ${successCount} photo${successCount !== 1 ? 's' : ''} • Saved ${savedMB} MB`,
        { duration: 4000 }
      )
    } catch (err) {
      console.error('Batch compression error:', err)
      toast.error('Failed to compress some photos')
    } finally {
      setCompressing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getTotalSize = () => {
    return photos.reduce((sum, photo) => {
      return sum + (photo.compressedSize || photo.originalSize)
    }, 0)
  }

  const getCompressionStats = () => {
    const original = photos.reduce((sum, p) => sum + p.originalSize, 0)
    const current = getTotalSize()
    const saved = original - current
    const percent = original > 0 ? ((saved / original) * 100).toFixed(1) : '0'
    return { original, current, saved, percent }
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

  const [scopeErrors, setScopeErrors] = useState<{
    name?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    photos?: string
  }>({})

  const generateScope = useCallback(async () => {
    setScopeErrors({})
    setError('')

    // Validation
    if (photos.length === 0) {
      setScopeErrors({ photos: "Please upload at least one photo" })
      setError('Please upload at least one photo')
      toast.error('Please upload at least one photo')
      return
    }

    if (!projectInfo.name?.trim()) {
      setScopeErrors({ name: "Project name is required" })
      setError('Please enter project name')
      toast.error('Please enter project name')
      return
    } else if (projectInfo.name.trim().length < 3) {
      setScopeErrors({ name: "Project name must be at least 3 characters" })
      setError('Project name must be at least 3 characters')
      toast.error('Project name must be at least 3 characters')
      return
    }

    if (!projectInfo.address?.trim()) {
      setScopeErrors({ address: "Street address is required" })
      setError('Please enter street address')
      toast.error('Please enter street address')
      return
    } else if (projectInfo.address.trim().length < 3) {
      setScopeErrors({ address: "Address must be at least 3 characters" })
      setError('Address must be at least 3 characters')
      toast.error('Address must be at least 3 characters')
      return
    }

    if (!projectInfo.city?.trim()) {
      setScopeErrors({ city: "City is required" })
      setError('Please enter city')
      toast.error('Please enter city')
      return
    }

    if (!projectInfo.state?.trim()) {
      setScopeErrors({ state: "State is required" })
      setError('Please enter state')
      toast.error('Please enter state')
      return
    } else if (projectInfo.state.trim().length !== 2) {
      setScopeErrors({ state: "State must be 2 characters (e.g., TX)" })
      setError('State must be 2 characters')
      toast.error('State must be 2 characters (e.g., TX)')
      return
    }

    if (!projectInfo.zip?.trim()) {
      setScopeErrors({ zip: "ZIP code is required" })
      setError('Please enter ZIP code')
      toast.error('Please enter ZIP code')
      return
    } else if (!/^\d{5}(-\d{4})?$/.test(projectInfo.zip.trim())) {
      setScopeErrors({ zip: "Please enter a valid ZIP code (e.g., 78701 or 78701-1234)" })
      setError('Please enter a valid ZIP code')
      toast.error('Please enter a valid ZIP code')
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
${notes ? `- Additional Voice Notes/Instructions: ${notes}` : ''}

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
  }, [photos, projectInfo])

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
          <div className="max-w-2xl mx-auto bg-white dark:bg-black border border-border rounded-md p-4">
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
                    onChange={(e) => {
                      setProjectInfo({...projectInfo, name: safeInput(e.target.value)})
                      if (scopeErrors.name) setScopeErrors(prev => ({ ...prev, name: undefined }))
                    }}
                    onBlur={() => {
                      if (projectInfo.name && projectInfo.name.trim().length < 3) {
                        setScopeErrors(prev => ({ ...prev, name: "Project name must be at least 3 characters" }))
                      }
                    }}
                    className={`mt-2 ${scopeErrors.name ? "border-[#FF0000]" : ""}`}
                    disabled={loading}
                    required
                    aria-invalid={!!scopeErrors.name}
                    aria-describedby={scopeErrors.name ? "project-name-error" : undefined}
                  />
                  {scopeErrors.name && (
                    <p id="project-name-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                      {scopeErrors.name}
                    </p>
                  )}
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
                      onChange={(e) => {
                        setProjectInfo({...projectInfo, city: safeInput(e.target.value)})
                        if (scopeErrors.city) setScopeErrors(prev => ({ ...prev, city: undefined }))
                      }}
                      onBlur={() => {
                        if (!projectInfo.city?.trim()) {
                          setScopeErrors(prev => ({ ...prev, city: "City is required" }))
                        }
                      }}
                      className={`mt-2 ${scopeErrors.city ? "border-[#FF0000]" : ""}`}
                      disabled={loading}
                      required
                      aria-invalid={!!scopeErrors.city}
                      aria-describedby={scopeErrors.city ? "city-error" : undefined}
                    />
                    {scopeErrors.city && (
                      <p id="city-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                        {scopeErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="TX"
                      value={projectInfo.state}
                      onChange={(e) => {
                        const value = safeInput(e.target.value).toUpperCase().slice(0, 2)
                        setProjectInfo({...projectInfo, state: value})
                        if (scopeErrors.state) setScopeErrors(prev => ({ ...prev, state: undefined }))
                      }}
                      onBlur={() => {
                        if (!projectInfo.state?.trim()) {
                          setScopeErrors(prev => ({ ...prev, state: "State is required" }))
                        } else if (projectInfo.state.trim().length !== 2) {
                          setScopeErrors(prev => ({ ...prev, state: "State must be 2 characters (e.g., TX)" }))
                        }
                      }}
                      className={`mt-2 ${scopeErrors.state ? "border-[#FF0000]" : ""}`}
                      disabled={loading}
                      required
                      maxLength={2}
                      aria-invalid={!!scopeErrors.state}
                      aria-describedby={scopeErrors.state ? "state-error" : undefined}
                    />
                    {scopeErrors.state && (
                      <p id="state-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                        {scopeErrors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zip" className="text-sm font-semibold">ZIP</Label>
                    <Input
                      id="zip"
                      type="text"
                      placeholder="78701"
                      value={projectInfo.zip}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5) + (e.target.value.includes('-') && e.target.value.length > 5 ? '-' + e.target.value.replace(/\D/g, '').slice(5, 9) : '')
                        setProjectInfo({...projectInfo, zip: value})
                        if (scopeErrors.zip) setScopeErrors(prev => ({ ...prev, zip: undefined }))
                      }}
                      onBlur={() => {
                        if (!projectInfo.zip?.trim()) {
                          setScopeErrors(prev => ({ ...prev, zip: "ZIP code is required" }))
                        } else if (!/^\d{5}(-\d{4})?$/.test(projectInfo.zip.trim())) {
                          setScopeErrors(prev => ({ ...prev, zip: "Please enter a valid ZIP code (e.g., 78701 or 78701-1234)" }))
                        }
                      }}
                      className={`mt-2 ${scopeErrors.zip ? "border-[#FF0000]" : ""}`}
                      disabled={loading}
                      required
                      maxLength={10}
                      pattern="^\d{5}(-\d{4})?$"
                      aria-invalid={!!scopeErrors.zip}
                      aria-describedby={scopeErrors.zip ? "zip-error" : undefined}
                    />
                    {scopeErrors.zip && (
                      <p id="zip-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                        {scopeErrors.zip}
                      </p>
                    )}
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
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm hover:shadow-md">
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

                {uploadErrors.length > 0 && (
                  <div className="mt-4 p-3 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-md">
                    <p className="text-sm font-bold text-[#FF0000] mb-2">Upload Errors:</p>
                    <ul className="text-xs text-[#FF0000] space-y-1 list-disc list-inside">
                      {uploadErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Total: {formatFileSize(getTotalSize())}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-all"
                          />
                          {photo.isCompressed && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle weight="fill" className="w-3 h-3" />
                              Compressed
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 right-1 bg-black dark:bg-white text-white dark:text-black text-xs px-1.5 py-0.5 rounded-md border-0 shadow-sm truncate font-mono">
                            {formatFileSize(photo.compressedSize || photo.originalSize)}
                          </div>
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

            {photos.length > 0 && (
              <Card className="border border-border bg-white dark:bg-black">
                <CardHeader>
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <ArrowsClockwise className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl">Batch Compression</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">
                        Compression Quality: {compressionQuality}%
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {compressionQuality >= 90 ? 'Maximum' : compressionQuality >= 70 ? 'High' : compressionQuality >= 50 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <Slider
                      value={[compressionQuality]}
                      onValueChange={(value) => setCompressionQuality(value[0])}
                      min={30}
                      max={95}
                      step={5}
                      className="w-full"
                      disabled={compressing}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Smaller size</span>
                      <span>Better quality</span>
                    </div>
                  </div>

                  {(() => {
                    const stats = getCompressionStats()
                    const hasCompressed = photos.some(p => p.isCompressed)
                    
                    return hasCompressed ? (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-900 dark:text-green-100 font-medium">Compression Results:</span>
                          <CheckCircle weight="fill" className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-xs text-green-800 dark:text-green-200 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Original:</span>
                            <span className="font-mono">{formatFileSize(stats.original)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Compressed:</span>
                            <span className="font-mono">{formatFileSize(stats.current)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-1 border-t border-green-200 dark:border-green-800">
                            <span>Saved:</span>
                            <span className="font-mono">{formatFileSize(stats.saved)} ({stats.percent}%)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-black border border-border rounded-md p-3">
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          <strong>Tip:</strong> Compressing photos reduces upload time and improves processing speed. 
                          Recommended quality: 80% for best balance.
                        </p>
                      </div>
                    )
                  })()}

                  <Button
                    onClick={compressBatch}
                    disabled={compressing || photos.every(p => p.isCompressed)}
                    className="w-full"
                    variant={photos.every(p => p.isCompressed) ? "outline" : "default"}
                  >
                    {compressing ? (
                      <>
                        <CircleNotch className="w-4 h-4 animate-spin mr-2" />
                        Compressing {photos.length} Photo{photos.length !== 1 ? 's' : ''}...
                      </>
                    ) : photos.every(p => p.isCompressed) ? (
                      <>
                        <CheckCircle weight="fill" className="w-4 h-4 mr-2" />
                        All Photos Compressed
                      </>
                    ) : (
                      <>
                        <ArrowsClockwise className="w-4 h-4 mr-2" />
                        Compress {photos.filter(p => !p.isCompressed).length} Photo{photos.filter(p => !p.isCompressed).length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Microphone className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">Voice Notes & Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Record Additional Details</Label>
                  <div className="flex flex-col gap-3">
                    {isSupported ? (
                      <div className="flex gap-2">
                        {!isListening ? (
                          <Button
                            onClick={startRecording}
                            variant="outline"
                            className="w-full h-12 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <Microphone className="w-5 h-5 mr-2" />
                            Start Recording
                          </Button>
                        ) : (
                          <Button
                            onClick={handleStopRecording}
                            variant="destructive"
                            className="w-full h-12 animate-pulse"
                          >
                            <Stop className="w-5 h-5 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                        {notes && (
                          <Button
                            onClick={() => setNotes('')}
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 text-muted-foreground hover:text-destructive"
                            title="Clear notes"
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                        Voice recording is not supported in this browser. Please type your notes below.
                      </div>
                    )}

                    {isListening && (
                      <div className="bg-primary/5 border border-primary/10 rounded-md p-3 min-h-[60px]">
                        <div className="flex items-center gap-2 mb-1 text-xs text-primary font-semibold uppercase tracking-wider">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          Listening...
                        </div>
                        <p className="text-foreground/80 italic">
                          {transcript}
                          <span className="opacity-50">{interimTranscript}</span>
                        </p>
                      </div>
                    )}

                    <Textarea
                      placeholder="Type additional notes here or use voice recording..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[120px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use voice notes to describe specific materials, room dimensions, or special client requests not visible in photos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateScope}
              disabled={loading || photos.length === 0 || !projectInfo.name?.trim() || !projectInfo.address?.trim()}
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

            <div className="bg-white dark:bg-black border border-border rounded-md p-4">
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
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-5 min-h-[500px] max-h-[700px] overflow-y-auto border-2 border-border">
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

                {scope && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {revenueConfig.affiliates.enabled && revenueConfig.affiliates.materialsUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="justify-start h-auto py-3 flex items-start gap-2 text-left"
                      >
                        <a href={revenueConfig.affiliates.materialsUrl} target="_blank" rel="noreferrer">
                          <LinkSimple className="w-4 h-4 mt-1" />
                          <span>
                            Materials & tools (affiliate)
                            <span className="block text-xs text-muted-foreground">Order with tracked links to save time</span>
                          </span>
                        </a>
                      </Button>
                    )}

                    {revenueConfig.affiliates.enabled && revenueConfig.affiliates.toolsUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="justify-start h-auto py-3 flex items-start gap-2 text-left"
                      >
                        <a href={revenueConfig.affiliates.toolsUrl} target="_blank" rel="noreferrer">
                          <LinkSimple className="w-4 h-4 mt-1" />
                          <span>
                            Recommended tools (affiliate)
                            <span className="block text-xs text-muted-foreground">Curated contractor gear</span>
                          </span>
                        </a>
                      </Button>
                    )}

                    {revenueConfig.donations.enabled && revenueConfig.donations.donateUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="justify-start h-auto py-3 flex items-start gap-2 text-left"
                      >
                        <a href={revenueConfig.donations.donateUrl} target="_blank" rel="noreferrer">
                          <Heart className="w-4 h-4 mt-1 text-red-500" weight="fill" />
                          <span>
                            Support Fair Trade
                            <span className="block text-xs text-muted-foreground">Keep the platform zero-fee for contractors</span>
                          </span>
                        </a>
                      </Button>
                    )}
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
