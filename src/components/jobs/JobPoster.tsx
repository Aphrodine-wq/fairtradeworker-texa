import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PhotoUploader } from "@/components/ui/PhotoUploader"
import { Camera, Microphone, FileText, Upload, Wrench, House, CirclesThree, Timer, Plus, Trash } from "@phosphor-icons/react"
import { fakeAIScope } from "@/lib/ai"
import { ScopeResults } from "./ScopeResults"
import { ReferralCodeCard } from "@/components/viral/ReferralCodeCard"
import { JobPostingTimer } from "./JobPostingTimer"
import { MajorProjectScopeBuilder, type ProjectScope } from "./MajorProjectScopeBuilder"
import { TierBadge } from "./TierBadge"
import type { Job, User, ReferralCode, JobTier, BundledTask } from "@/lib/types"
import type { UploadedPhoto } from "@/hooks/usePhotoUpload"
import { calculateJobSize } from "@/lib/types"
import { generateReferralCode } from "@/lib/viral"
import { generateMilestonesFromTemplate } from "@/lib/milestones"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface JobPosterProps {
  user: User
  onNavigate: (page: string) => void
}

type InputMethod = 'photos' | 'audio' | 'text' | null
type ProjectType = 'kitchen-remodel' | 'bathroom-remodel' | 'roof-replacement' | 'deck-build' | 'fence-installation' | 'room-addition' | 'custom' | null
type Step = 'tier-select' | 'project-select' | 'scope-builder' | 'select' | 'input' | 'processing' | 'results' | 'posted'

const PROJECT_TEMPLATES = [
  {
    type: 'kitchen-remodel' as const,
    emoji: '🍳',
    title: 'Kitchen Remodel',
    priceRange: '$15K-$50K · 4-8 weeks',
  },
  {
    type: 'bathroom-remodel' as const,
    emoji: '🚿',
    title: 'Bathroom Remodel',
    priceRange: '$8K-$35K · 2-5 weeks',
  },
  {
    type: 'roof-replacement' as const,
    emoji: '🏠',
    title: 'Roof Replacement',
    priceRange: '$8K-$25K · 2-5 days',
  },
  {
    type: 'deck-build' as const,
    emoji: '🪵',
    title: 'Deck Build',
    priceRange: '$8K-$35K · 1-3 weeks',
  },
  {
    type: 'fence-installation' as const,
    emoji: '🚧',
    title: 'Fence Installation',
    priceRange: '$3K-$15K · 2-5 days',
  },
  {
    type: 'room-addition' as const,
    emoji: '🏗️',
    title: 'Room Addition',
    priceRange: '$25K-$100K · 6-12 weeks',
  },
  {
    type: 'custom' as const,
    emoji: '✏️',
    title: 'Custom Project',
    priceRange: 'Describe your own project',
    isCustom: true,
  },
] as const

export function JobPoster({ user, onNavigate }: JobPosterProps) {
  const [step, setStep] = useState<Step>('tier-select')
  const [selectedTier, setSelectedTier] = useState<JobTier | null>(null)
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(null)
  const [projectScope, setProjectScope] = useState<ProjectScope | null>(null)
  const [inputMethod, setInputMethod] = useState<InputMethod>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [aiResult, setAiResult] = useState<any>(null)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [referralCodes, setReferralCodes] = useKV<ReferralCode[]>("referral-codes", [])
  const [currentReferralCode, setCurrentReferralCode] = useState<ReferralCode | null>(null)
  const [postingStartTime, setPostingStartTime] = useState<number>(0)
  const [postingEndTime, setPostingEndTime] = useState<number>(0)
  const [isUrgent, setIsUrgent] = useState(false)
  const [bundledTasks, setBundledTasks] = useState<Array<{title: string, description: string, estimatedCost: number}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'tier-select' && postingStartTime === 0) {
      setPostingStartTime(Date.now())
    }
  }, [step, postingStartTime])

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method)
    setStep('input')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)

  const handleProcess = useCallback(async () => {
    setProcessingError(null)
    
    if (!title.trim()) {
      toast.error("Please enter a job title")
      setProcessingError("Job title is required")
      return
    }

    if (title.trim().length < 5) {
      toast.error("Job title must be at least 5 characters")
      setProcessingError("Job title too short")
      return
    }

    if (inputMethod === 'text' && !description.trim()) {
      toast.error("Please enter a job description")
      setProcessingError("Job description is required")
      return
    }

    if (inputMethod === 'text' && description.trim().length < 20) {
      toast.error("Please provide a more detailed description (at least 20 characters)")
      setProcessingError("Description too short")
      return
    }

    if (inputMethod === 'photos') {
      const completedPhotos = uploadedPhotos.filter(p => p.status === 'complete')
      if (completedPhotos.length === 0) {
        toast.error("Please upload at least one photo")
        setProcessingError("At least one photo required")
        return
      }
    }

    if (inputMethod === 'audio' && !file) {
      toast.error("Please upload an audio file")
      setProcessingError("Audio file required")
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      const mockFile = new File(["mock"], "mock.txt")
      const result = await fakeAIScope(mockFile)
      
      // Generate smart title suggestion
      const suggestedTitle = generateSmartTitle(title, description, result)
      result.suggestedTitle = suggestedTitle
      
      setAiResult(result)
      setStep('results')
      toast.success("AI scope generated successfully!")
    } catch (error) {
      console.error("Error processing job:", error)
      toast.error("Failed to generate AI scope. Please try again.")
      setProcessingError("AI processing failed. Please try again.")
      setStep('input')
    } finally {
      setIsProcessing(false)
    }
  }, [title, description, inputMethod, uploadedPhotos, file])

  // Helper function to generate smart titles
  const generateSmartTitle = (originalTitle: string, desc: string, aiResult: any): string => {
    // Simple smart title generation based on keywords
    const titleLower = originalTitle.toLowerCase()
    const descLower = (desc || '').toLowerCase()
    const combined = titleLower + ' ' + descLower
    
    // Check for common patterns and improve them
    if (combined.includes('help') || combined.includes('need') || combined.includes('fix')) {
      // Try to extract specific items
      if (combined.includes('faucet')) return 'Kitchen Faucet Repair'
      if (combined.includes('toilet')) return 'Toilet Repair'
      if (combined.includes('drain')) return 'Drain Cleaning'
      if (combined.includes('outlet')) return 'Electrical Outlet Repair'
      if (combined.includes('door')) return 'Door Repair/Installation'
      if (combined.includes('window')) return 'Window Repair'
      if (combined.includes('leak')) return 'Leak Repair'
      if (combined.includes('paint')) return 'Interior Painting'
      if (combined.includes('drywall')) return 'Drywall Repair'
    }
    
    // If title is too short or generic, use AI scope
    if (originalTitle.length < 10 || ['fix', 'help', 'repair', 'need'].some(word => titleLower === word)) {
      const scopeSentence = aiResult.scope?.split('.')[0]
      return scopeSentence || originalTitle
    }
    
    return originalTitle // Return original if no improvement found
  }

  const handlePostJob = () => {
    const endTime = Date.now()
    setPostingEndTime(endTime)
    const postedInSeconds = Math.round((endTime - postingStartTime) / 1000)
    
    const confidenceScore = Math.floor(Math.random() * 25) + 75
    const detectedObjects = ['plumbing fixture', 'pipes']
    
    const estimatedDays = projectScope 
      ? parseInt(projectScope.estimatedTimeline.split('-')[1]?.match(/\d+/)?.[0] || '5')
      : Math.ceil((aiResult.priceHigh || 500) / 500)
    
    const tradesRequired = projectScope?.requiredTrades || []
    const permitRequired = projectScope?.permitsNeeded && projectScope.permitsNeeded.length > 0
    
    let tier: JobTier = 'QUICK_FIX'
    const estimatedCost = aiResult?.priceHigh || projectScope?.estimatedPrice.high || 500
    
    if (estimatedCost > 5000) {
      tier = 'MAJOR_PROJECT'
    } else if (estimatedCost > 500) {
      tier = 'STANDARD'
    }
    
    const newJob: Job = {
      id: `job-${Date.now()}`,
      homeownerId: user.id,
      title: title || (projectScope ? `${selectedProjectType?.replace(/-/g, ' ')} Project` : 'Untitled Job'),
      description: description || projectScope?.customDescription || aiResult.scope,
      mediaType: inputMethod === 'text' || inputMethod === null ? undefined : inputMethod === 'photos' ? 'photo' : inputMethod,
      aiScope: {
        ...aiResult,
        confidenceScore,
        detectedObjects,
      },
      size: calculateJobSize(estimatedCost),
      tier,
      estimatedDays,
      tradesRequired,
      permitRequired,
      status: 'open',
      createdAt: new Date().toISOString(),
      postedInSeconds,
      bids: [],
      milestones: tier === 'MAJOR_PROJECT' && projectScope && selectedProjectType
        ? generateMilestonesFromTemplate(
            `job-${Date.now()}`,
            selectedProjectType,
            estimatedCost,
            estimatedCost >= 15000
          )
        : undefined,
      isUrgent,
      urgentDeadline: isUrgent ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : undefined,
      bundledTasks: bundledTasks.length > 0 ? bundledTasks.map((task) => ({
        id: uuidv4(),
        ...task
      })) : undefined,
      questions: []
    }

    setJobs((currentJobs) => [...(currentJobs || []), newJob])
    
    const code = generateReferralCode(user.fullName, user.id)
    const newReferralCode: ReferralCode = {
      id: `ref-${Date.now()}`,
      code,
      ownerId: user.id,
      ownerName: user.fullName,
      discount: 20,
      earnings: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
    }
    
    setReferralCodes((current) => [...(current || []), newReferralCode])
    setCurrentReferralCode(newReferralCode)
    setStep('posted')
    toast.success("Job posted! Share your code to earn $20.")
  }

  if (step === 'posted' && currentReferralCode) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-heading font-bold text-primary">Job Posted Successfully! 🎉</h1>
            <p className="text-muted-foreground text-lg">
              Contractors/Subcontractors can now bid on your job. Share your referral code below to earn $20!
            </p>
          </div>
          
          {postingEndTime > 0 && (
            <JobPostingTimer
              startTime={postingStartTime}
              isComplete={true}
              finalTime={Math.round((postingEndTime - postingStartTime) / 1000)}
            />
          )}
          
          <ReferralCodeCard
            code={currentReferralCode.code}
            userName={user.fullName}
            earnings={currentReferralCode.earnings}
            usedCount={currentReferralCode.usedBy.length}
          />
          
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={() => onNavigate('home')}>
              Back to Home
            </Button>
            <Button onClick={() => {
              setStep('tier-select')
              setSelectedTier(null)
              setSelectedProjectType(null)
              setProjectScope(null)
              setTitle("")
              setDescription("")
              setFile(null)
              setAiResult(null)
              setInputMethod(null)
              setCurrentReferralCode(null)
              setPostingStartTime(Date.now())
              setPostingEndTime(0)
            }}>
              Post Another Job
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'results' && aiResult) {
    return (
      <ScopeResults
        title={title}
        aiScope={aiResult}
        onPost={handlePostJob}
        onBack={() => setStep('input')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-[1pt]">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-12 max-w-5xl">
      {step === 'tier-select' && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-2xl md:text-3xl">What size project do you have?</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Choose the category that best matches your project
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
            <button
              onClick={() => {
                setSelectedTier('QUICK_FIX')
                setStep('select')
              }}
              className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-md border border-black/20 dark:border-white/20 hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench weight="fill" className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <TierBadge tier="QUICK_FIX" />
              </div>
              <div className="text-left space-y-1 md:space-y-2">
                <h3 className="font-semibold text-lg md:text-xl">Quick Fix</h3>
                <p className="text-xs md:text-sm text-muted-foreground">$50 - $500</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Leaky faucet, clogged drain, outlet repair, running toilet
                </p>
                <div className="pt-1 md:pt-2 space-y-1 text-xs text-muted-foreground">
                  <div>⚡ Same-day service</div>
                  <div>👤 One contractor</div>
                  <div>🕐 1-4 hours</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedTier('STANDARD')
                setStep('select')
              }}
              className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-md border border-black/20 dark:border-white/20 hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-[#FFFF00] dark:bg-[#FFFF00] border border-black/20 dark:border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <House weight="fill" className="text-amber-600 dark:text-amber-400" size={24} />
                </div>
                <TierBadge tier="STANDARD" />
              </div>
              <div className="text-left space-y-1 md:space-y-2">
                <h3 className="font-semibold text-lg md:text-xl">Standard Job</h3>
                <p className="text-xs md:text-sm text-muted-foreground">$500 - $5,000</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Water heater, AC repair, fence section, deck repair
                </p>
                <div className="pt-1 md:pt-2 space-y-1 text-xs text-muted-foreground">
                  <div>📅 1-5 days</div>
                  <div>👤 One contractor</div>
                  <div>💵 Simple payment</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedTier('MAJOR_PROJECT')
                setStep('project-select')
              }}
              className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-md border border-black/20 dark:border-white/20 hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <CirclesThree weight="fill" className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <TierBadge tier="MAJOR_PROJECT" />
              </div>
              <div className="text-left space-y-1 md:space-y-2">
                <h3 className="font-semibold text-lg md:text-xl">Major Project</h3>
                <p className="text-xs md:text-sm text-muted-foreground">$5,000 - $50,000</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Kitchen remodel, bathroom reno, roof, room addition
                </p>
                <div className="pt-1 md:pt-2 space-y-1 text-xs text-muted-foreground">
                  <div>📆 1-8 weeks</div>
                  <div>👥 Multiple trades</div>
                  <div>📋 Milestone payments</div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {step === 'project-select' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('tier-select')}
              >
                ← Back
              </Button>
            </div>
            <CardTitle className="text-3xl">Select Your Project Type</CardTitle>
            <CardDescription className="text-base">
              Choose a template or describe a custom project
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
            {PROJECT_TEMPLATES.map((project) => (
              <button
                key={project.type}
                onClick={() => {
                  setSelectedProjectType(project.type)
                  setStep('scope-builder')
                }}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-md transition-all text-left",
                  project.isCustom
                    ? "border-2 border-dashed border-black dark:border-white hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]"
                    : "border border-black/20 dark:border-white/20 hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]"
                )}
              >
                <div className="text-2xl sm:text-4xl">{project.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-lg truncate">{project.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{project.priceRange}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 'scope-builder' && selectedProjectType && (
        <div>
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setStep('project-select')}
            >
              ← Back to Projects
            </Button>
          </div>
          <MajorProjectScopeBuilder
            projectType={selectedProjectType}
            onComplete={(scope) => {
              setProjectScope(scope)
              const mockResult = {
                scope: `${selectedProjectType?.replace(/-/g, ' ')} project with selected items: ${scope.itemsChanging.join(', ')}`,
                priceLow: scope.estimatedPrice.low,
                priceHigh: scope.estimatedPrice.high,
                materials: scope.itemsChanging,
                timeline: scope.estimatedTimeline
              }
              setAiResult(mockResult)
              setStep('results')
            }}
          />
        </div>
      )}

      {step === 'select' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('tier-select')}
              >
                ← Back
              </Button>
            </div>
            <CardTitle className="text-3xl">Post a Job</CardTitle>
            <CardDescription className="text-base">
              Choose how you'd like to describe your project
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => handleMethodSelect('photos')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                <Camera weight="fill" className="text-primary-foreground" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Photos</h3>
                <p className="text-sm text-muted-foreground">Show us the issue</p>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('audio')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                <Microphone weight="fill" className="text-secondary-foreground" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Voice</h3>
                <p className="text-sm text-muted-foreground">Describe it verbally</p>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('text')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center">
                <FileText weight="fill" className="text-accent-foreground" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Text</h3>
                <p className="text-sm text-muted-foreground">Type the details</p>
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {step === 'input' && inputMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Job Details</CardTitle>
            <CardDescription>
              Provide information about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Fix leaking kitchen faucet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Urgency Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Timer weight="duotone" size={24} className="text-orange-500" />
                <div>
                  <Label htmlFor="urgent" className="text-base font-semibold cursor-pointer">
                    Need it today?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Creates 2-hour countdown timer visible to all contractors
                  </p>
                </div>
              </div>
              <Switch
                id="urgent"
                checked={isUrgent}
                onCheckedChange={setIsUrgent}
              />
            </div>

            {/* Job Bundles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Bundle Multiple Tasks (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBundledTasks([...bundledTasks, { title: "", description: "", estimatedCost: 0 }])}
                >
                  <Plus className="mr-2" weight="bold" size={16} />
                  Add Task
                </Button>
              </div>
              
              {bundledTasks.map((task, idx) => (
                <Card key={idx} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Task {idx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBundledTasks(bundledTasks.filter((_, i) => i !== idx))}
                      >
                        <Trash weight="duotone" size={16} />
                      </Button>
                    </div>
                    <Input
                      placeholder="Task title"
                      value={task.title}
                      onChange={(e) => {
                        const updated = [...bundledTasks]
                        updated[idx].title = e.target.value
                        setBundledTasks(updated)
                      }}
                    />
                    <Textarea
                      placeholder="Task description"
                      value={task.description}
                      onChange={(e) => {
                        const updated = [...bundledTasks]
                        updated[idx].description = e.target.value
                        setBundledTasks(updated)
                      }}
                      rows={2}
                    />
                    <Input
                      type="number"
                      placeholder="Estimated cost"
                      value={task.estimatedCost || ""}
                      onChange={(e) => {
                        const updated = [...bundledTasks]
                        updated[idx].estimatedCost = parseFloat(e.target.value) || 0
                        setBundledTasks(updated)
                      }}
                    />
                  </div>
                </Card>
              ))}
              
              {bundledTasks.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Contractors can bid on the full bundle or individual items
                </p>
              )}
            </div>

            {inputMethod === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work needed in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>
            )}

            {inputMethod === 'photos' && (
              <>
                <div className="space-y-2">
                  <Label>Upload Photos</Label>
                  <PhotoUploader
                    maxPhotos={10}
                    maxSize={10 * 1024 * 1024}
                    onPhotosChange={setUploadedPhotos}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep('select')}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleProcess} 
                    className="flex-1"
                    disabled={uploadedPhotos.filter(p => p.status === 'complete').length === 0}
                  >
                    Generate AI Scope
                  </Button>
                </div>
              </>
            )}

            {inputMethod === 'audio' && (
              <>
                <div className="space-y-2">
                  <Label>Upload Audio</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                    </Button>
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep('select')}>
                    Back
                  </Button>
                  <Button onClick={handleProcess} className="flex-1">
                    Generate AI Scope
                  </Button>
                </div>
              </>
            )}

            {inputMethod === 'text' && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button onClick={handleProcess} className="flex-1">
                  Generate AI Scope
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Analyzing Your Job</CardTitle>
            <CardDescription>
              Our AI is reviewing your project details...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={66} className="h-2" />
            <p className="text-center text-muted-foreground">
              This takes about 60 seconds
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
