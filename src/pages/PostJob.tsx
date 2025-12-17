import { useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PhotoUploader } from "@/components/ui/PhotoUploader"
import { BackButton } from "@/components/ui/BackButton"
import {
  Camera, Microphone, FileText, MapPin, Calendar, Clock, DollarSign,
  Users, Wrench, Alert, CheckCircle, Upload, X, Plus, Phone, Mail,
  Building, Home, Ruler, Palette, Lightbulb, Shield, CreditCard
} from "@phosphor-icons/react"
import type { User, Job, JobTier, JobSize } from "@/lib/types"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { fakeAIScope } from "@/lib/ai"
import { calculateJobSize } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface PostJobProps {
  user: User
  onNavigate: (page: string) => void
}

type Step = 'details' | 'location' | 'media' | 'budget' | 'timeline' | 'requirements' | 'review'

export function PostJob({ user, onNavigate }: PostJobProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Job Details
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobCategory, setJobCategory] = useState("")
  const [jobType, setJobType] = useState<'one-time' | 'recurring' | 'maintenance'>('one-time')
  
  // Location
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [allowRemote, setAllowRemote] = useState(false)
  
  // Media
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; file: File }>>([])
  const [uploadedVideos, setUploadedVideos] = useState<Array<{ id: string; url: string; file: File }>>([])
  const [uploadedAudio, setUploadedAudio] = useState<Array<{ id: string; url: string; file: File }>>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ id: string; name: string; file: File }>>([])
  
  // Budget
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number } | null>(null)
  const [budgetFlexible, setBudgetFlexible] = useState(true)
  const [showBudget, setShowBudget] = useState(true)
  
  // Timeline
  const [preferredStart, setPreferredStart] = useState<Date | null>(null)
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)
  const [timelineFlexible, setTimelineFlexible] = useState(true)
  
  // Requirements
  const [requiredLicenses, setRequiredLicenses] = useState<string[]>([])
  const [requiredInsurance, setRequiredInsurance] = useState(false)
  const [requiredExperience, setRequiredExperience] = useState<'entry' | 'intermediate' | 'expert'>('intermediate')
  const [specialRequirements, setSpecialRequirements] = useState("")
  const [accessInstructions, setAccessInstructions] = useState("")
  
  // Additional Details
  const [homeownerPresent, setHomeownerPresent] = useState(true)
  const [petsPresent, setPetsPresent] = useState(false)
  const [parkingAvailable, setParkingAvailable] = useState(true)
  const [parkingInstructions, setParkingInstructions] = useState("")
  
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  
  const steps: Array<{ id: Step; label: string; icon: any }> = [
    { id: 'details', label: 'Job Details', icon: FileText },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'media', label: 'Photos & Media', icon: Camera },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'requirements', label: 'Requirements', icon: Shield },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ]
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100
  
  const handleNext = useCallback(() => {
    // Validation
    if (currentStep === 'details') {
      if (!jobTitle.trim() || jobTitle.trim().length < 5) {
        toast.error("Please enter a job title (at least 5 characters)")
        return
      }
      if (!jobDescription.trim() || jobDescription.trim().length < 20) {
        toast.error("Please enter a detailed description (at least 20 characters)")
        return
      }
      if (!jobCategory) {
        toast.error("Please select a job category")
        return
      }
    }
    
    if (currentStep === 'location') {
      if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
        toast.error("Please complete all address fields")
        return
      }
    }
    
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, currentStepIndex, steps, jobTitle, jobDescription, jobCategory, address, city, state, zipCode])
  
  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStepIndex, steps])
  
  const handleFileUpload = useCallback((type: 'photo' | 'video' | 'audio' | 'document', file: File) => {
    const id = uuidv4()
    const url = URL.createObjectURL(file)
    
    switch (type) {
      case 'photo':
        setUploadedPhotos(prev => [...prev, { id, url, file }])
        break
      case 'video':
        setUploadedVideos(prev => [...prev, { id, url, file }])
        break
      case 'audio':
        setUploadedAudio(prev => [...prev, { id, url, file }])
        break
      case 'document':
        setUploadedDocuments(prev => [...prev, { id, name: file.name, file }])
        break
    }
    toast.success(`${type === 'photo' ? 'Photo' : type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Document'} uploaded`)
  }, [])
  
  const handleRemoveFile = useCallback((type: 'photo' | 'video' | 'audio' | 'document', id: string) => {
    switch (type) {
      case 'photo':
        setUploadedPhotos(prev => {
          const item = prev.find(p => p.id === id)
          if (item) URL.revokeObjectURL(item.url)
          return prev.filter(p => p.id !== id)
        })
        break
      case 'video':
        setUploadedVideos(prev => {
          const item = prev.find(v => v.id === id)
          if (item) URL.revokeObjectURL(item.url)
          return prev.filter(v => v.id !== id)
        })
        break
      case 'audio':
        setUploadedAudio(prev => {
          const item = prev.find(a => a.id === id)
          if (item) URL.revokeObjectURL(item.url)
          return prev.filter(a => a.id !== id)
        })
        break
      case 'document':
        setUploadedDocuments(prev => prev.filter(d => d.id !== id))
        break
    }
  }, [])
  
  const handleSubmit = useCallback(async () => {
    setIsProcessing(true)
    
    try {
      // Generate AI scope
      const mockFile = new File(["mock"], "mock.txt")
      const aiResult = await fakeAIScope(mockFile)
      
      // Determine job tier and size
      const estimatedCost = budgetRange ? (budgetRange.min + budgetRange.max) / 2 : 500
      let tier: JobTier = 'QUICK_FIX'
      if (estimatedCost > 5000) tier = 'MAJOR_PROJECT'
      else if (estimatedCost > 500) tier = 'STANDARD'
      
      const size: JobSize = calculateJobSize(estimatedCost)
      
      const newJob: Job = {
        id: `job-${Date.now()}`,
        homeownerId: user.id,
        title: jobTitle,
        description: jobDescription + (specialRequirements ? `\n\nSpecial Requirements: ${specialRequirements}` : '') + (accessInstructions ? `\n\nAccess Instructions: ${accessInstructions}` : ''),
        photos: uploadedPhotos.map(p => p.url),
        preferredStartDate: preferredStart?.toISOString(),
        isUrgent,
        aiScope: {
          ...aiResult,
          scope: jobDescription,
          priceLow: budgetRange?.min || 100,
          priceHigh: budgetRange?.max || 1000,
          materials: [],
        },
        size,
        tier,
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        tradesRequired: requiredLicenses.length > 0 ? requiredLicenses : undefined,
        permitRequired: requiredInsurance,
      }
      
      setJobs(prev => [...(prev || []), newJob])
      toast.success("Job posted successfully!")
      onNavigate('my-jobs')
    } catch (error) {
      console.error("Error posting job:", error)
      toast.error("Failed to post job. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [
    budgetRange, budgetFlexible, jobTitle, jobDescription, jobCategory, jobType,
    address, city, state, zipCode, uploadedPhotos, preferredStart, deadline,
    isUrgent, requiredLicenses, requiredInsurance, requiredExperience,
    specialRequirements, accessInstructions, homeownerPresent, petsPresent,
    parkingAvailable, parkingInstructions, user.id, setJobs, onNavigate
  ])
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-base font-semibold">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Kitchen Faucet Replacement"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Be specific about what needs to be done
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-base font-semibold">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe the job in detail. Include any relevant information about the current state, what you want done, materials preferences, etc."
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {jobDescription.length}/500 characters (minimum 20 required)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobCategory" className="text-base font-semibold">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={jobCategory} onValueChange={setJobCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                  <SelectItem value="flooring">Flooring</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="carpentry">Carpentry</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="appliance">Appliance Repair</SelectItem>
                  <SelectItem value="general">General Handyman</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold">Job Type</Label>
              <RadioGroup value={jobType} onValueChange={(v) => setJobType(v as any)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                    <div className="font-medium">One-time Job</div>
                    <div className="text-sm text-muted-foreground">Single project or service</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="flex-1 cursor-pointer">
                    <div className="font-medium">Recurring Service</div>
                    <div className="text-sm text-muted-foreground">Weekly, monthly, or seasonal service</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance" className="flex-1 cursor-pointer">
                    <div className="font-medium">Maintenance Contract</div>
                    <div className="text-sm text-muted-foreground">Ongoing maintenance agreement</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
        
      case 'location':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-semibold">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-semibold">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-base font-semibold">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  maxLength={2}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-base font-semibold">
                ZIP Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                maxLength={5}
              />
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Switch
                id="allowRemote"
                checked={allowRemote}
                onCheckedChange={setAllowRemote}
              />
              <Label htmlFor="allowRemote" className="flex-1 cursor-pointer">
                <div className="font-medium">Allow remote consultation</div>
                <div className="text-sm text-muted-foreground">
                  Some contractors can provide advice remotely
                </div>
              </Label>
            </div>
          </div>
        )
        
      case 'media':
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Camera size={20} />
                  Photos
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  Add Photos
                </Button>
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(file => {
                    handleFileUpload('photo', file)
                  })
                }}
              />
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Upload"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveFile('photo', photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Microphone size={20} />
                  Audio Notes
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('audio-upload')?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  Add Audio
                </Button>
              </div>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload('audio', e.target.files[0])
                  }
                }}
              />
              {uploadedAudio.length > 0 && (
                <div className="space-y-2">
                  {uploadedAudio.map((audio) => (
                    <div key={audio.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{audio.file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile('audio', audio.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Tip:</strong> Photos help contractors understand your project better. Include pictures of the area that needs work, existing fixtures or materials, and any relevant details.
              </p>
            </div>
          </div>
        )
        
      case 'budget':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="showBudget" className="font-semibold cursor-pointer">
                  Show Budget to Contractors
                </Label>
                <p className="text-sm text-muted-foreground">
                  Showing your budget helps contractors provide accurate bids
                </p>
              </div>
              <Switch
                id="showBudget"
                checked={showBudget}
                onCheckedChange={setShowBudget}
              />
            </div>
            
            {showBudget && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin" className="text-base font-semibold">
                      Minimum Budget ($)
                    </Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={budgetRange?.min || ''}
                      onChange={(e) => setBudgetRange(prev => ({
                        min: parseInt(e.target.value) || 0,
                        max: prev?.max || parseInt(e.target.value) || 0
                      }))}
                      placeholder="100"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax" className="text-base font-semibold">
                      Maximum Budget ($)
                    </Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={budgetRange?.max || ''}
                      onChange={(e) => setBudgetRange(prev => ({
                        min: prev?.min || 0,
                        max: parseInt(e.target.value) || 0
                      }))}
                      placeholder="1000"
                      min={0}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="budgetFlexible"
                    checked={budgetFlexible}
                    onCheckedChange={setBudgetFlexible}
                  />
                  <Label htmlFor="budgetFlexible" className="flex-1 cursor-pointer">
                    <div className="font-medium">Budget is flexible</div>
                    <div className="text-sm text-muted-foreground">
                      I'm open to suggestions outside this range
                    </div>
                  </Label>
                </div>
              </>
            )}
            
            {!showBudget && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Note:</strong> Contractors will provide bids based on your description. You can discuss budget privately with them.
                </p>
              </div>
            )}
          </div>
        )
        
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Switch
                id="isUrgent"
                checked={isUrgent}
                onCheckedChange={setIsUrgent}
              />
              <Label htmlFor="isUrgent" className="flex-1 cursor-pointer">
                <div className="font-medium text-red-900 dark:text-red-100">Urgent Job</div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  This job needs to be completed urgently (within 24-48 hours)
                </div>
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredStart" className="text-base font-semibold">
                Preferred Start Date
              </Label>
              <Input
                id="preferredStart"
                type="date"
                value={preferredStart ? preferredStart.toISOString().split('T')[0] : ''}
                onChange={(e) => setPreferredStart(e.target.value ? new Date(e.target.value) : null)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-base font-semibold">
                Deadline (Optional)
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline ? deadline.toISOString().split('T')[0] : ''}
                onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value) : null)}
                min={preferredStart ? preferredStart.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Switch
                id="timelineFlexible"
                checked={timelineFlexible}
                onCheckedChange={setTimelineFlexible}
              />
              <Label htmlFor="timelineFlexible" className="flex-1 cursor-pointer">
                <div className="font-medium">Timeline is flexible</div>
                <div className="text-sm text-muted-foreground">
                  I can work with the contractor's schedule
                </div>
              </Label>
            </div>
          </div>
        )
        
      case 'requirements':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Required Experience Level</Label>
              <Select value={requiredExperience} onValueChange={(v) => setRequiredExperience(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level - Anyone can apply</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Some experience preferred</SelectItem>
                  <SelectItem value="expert">Expert - Extensive experience required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Switch
                id="requiredInsurance"
                checked={requiredInsurance}
                onCheckedChange={setRequiredInsurance}
              />
              <Label htmlFor="requiredInsurance" className="flex-1 cursor-pointer">
                <div className="font-medium">Require Insurance</div>
                <div className="text-sm text-muted-foreground">
                  Contractor must have valid insurance
                </div>
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-semibold">Required Licenses (if any)</Label>
              <div className="flex flex-wrap gap-2">
                {['Plumbing', 'Electrical', 'HVAC', 'General Contractor', 'Roofing'].map(license => (
                  <Badge
                    key={license}
                    variant={requiredLicenses.includes(license) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setRequiredLicenses(prev =>
                        prev.includes(license)
                          ? prev.filter(l => l !== license)
                          : [...prev, license]
                      )
                    }}
                  >
                    {license}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialRequirements" className="text-base font-semibold">
                Special Requirements or Preferences
              </Label>
              <Textarea
                id="specialRequirements"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any specific requirements, preferences, or constraints..."
                rows={4}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessInstructions" className="text-base font-semibold">
                  Access Instructions
                </Label>
                <Textarea
                  id="accessInstructions"
                  value={accessInstructions}
                  onChange={(e) => setAccessInstructions(e.target.value)}
                  placeholder="How to access the property, gate codes, entry instructions, etc."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="homeownerPresent"
                    checked={homeownerPresent}
                    onCheckedChange={setHomeownerPresent}
                  />
                  <Label htmlFor="homeownerPresent" className="cursor-pointer">
                    Homeowner will be present
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="petsPresent"
                    checked={petsPresent}
                    onCheckedChange={setPetsPresent}
                  />
                  <Label htmlFor="petsPresent" className="cursor-pointer">
                    Pets present on property
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="parkingAvailable"
                    checked={parkingAvailable}
                    onCheckedChange={setParkingAvailable}
                  />
                  <Label htmlFor="parkingAvailable" className="cursor-pointer">
                    Parking available
                  </Label>
                </div>
                {parkingAvailable && (
                  <Input
                    value={parkingInstructions}
                    onChange={(e) => setParkingInstructions(e.target.value)}
                    placeholder="Parking instructions..."
                  />
                )}
              </div>
            </div>
          </div>
        )
        
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Title:</strong> {jobTitle}</div>
                <div><strong>Description:</strong> {jobDescription}</div>
                <div><strong>Category:</strong> {jobCategory}</div>
                <div><strong>Type:</strong> {jobType}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div>{address}</div>
                <div>{city}, {state} {zipCode}</div>
              </CardContent>
            </Card>
            
            {showBudget && budgetRange && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>${budgetRange.min.toLocaleString()} - ${budgetRange.max.toLocaleString()}</div>
                  {budgetFlexible && <Badge variant="outline">Flexible</Badge>}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {preferredStart && <div><strong>Preferred Start:</strong> {preferredStart.toLocaleDateString()}</div>}
                {deadline && <div><strong>Deadline:</strong> {deadline.toLocaleDateString()}</div>}
                {isUrgent && <Badge variant="destructive">Urgent</Badge>}
              </CardContent>
            </Card>
            
            {(uploadedPhotos.length > 0 || uploadedAudio.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadedPhotos.length > 0 && <div>{uploadedPhotos.length} photos</div>}
                  {uploadedAudio.length > 0 && <div>{uploadedAudio.length} audio files</div>}
                </CardContent>
              </Card>
            )}
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton onNavigate={onNavigate} defaultPage="home" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Post a Job</h1>
          <p className="text-muted-foreground">
            Fill out the details below to get bids from qualified contractors
          </p>
        </div>
        
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStepIndex
                const isCompleted = index < currentStepIndex
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-2 flex-1 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? 'border-primary bg-primary text-white'
                          : isCompleted
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-muted-foreground bg-white dark:bg-black'
                      }`}
                    >
                      <Icon size={20} weight={isActive || isCompleted ? 'bold' : 'regular'} />
                    </div>
                    <span className="text-xs text-center hidden sm:block">{step.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex].label}</CardTitle>
            <CardDescription>
              {currentStepIndex === 0 && "Tell us about the job you need done"}
              {currentStepIndex === 1 && "Where is this job located?"}
              {currentStepIndex === 2 && "Add photos or audio to help contractors understand your project"}
              {currentStepIndex === 3 && "What's your budget for this project?"}
              {currentStepIndex === 4 && "When do you need this done?"}
              {currentStepIndex === 5 && "Any special requirements or preferences?"}
              {currentStepIndex === 6 && "Review all details before posting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>
          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? 'Posting...' : 'Post Job'}
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
