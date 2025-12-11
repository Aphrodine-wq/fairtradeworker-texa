import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Video, Microphone, FileText, Upload } from "@phosphor-icons/react"
import { fakeAIScope } from "@/lib/ai"
import { ScopeResults } from "./ScopeResults"
import { ReferralCodeCard } from "@/components/viral/ReferralCodeCard"
import { VideoUploader } from "./VideoUploader"
import type { Job, User, ReferralCode } from "@/lib/types"
import type { VideoAnalysis } from "@/lib/video/types"
import { calculateJobSize } from "@/lib/types"
import { generateReferralCode } from "@/lib/viral"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface JobPosterProps {
  user: User
  onNavigate: (page: string) => void
}

type InputMethod = 'video' | 'audio' | 'text' | null
type Step = 'select' | 'input' | 'processing' | 'results' | 'posted'

export function JobPoster({ user, onNavigate }: JobPosterProps) {
  const [step, setStep] = useState<Step>('select')
  const [inputMethod, setInputMethod] = useState<InputMethod>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [referralCodes, setReferralCodes] = useKV<ReferralCode[]>("referral-codes", [])
  const [currentReferralCode, setCurrentReferralCode] = useState<ReferralCode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method)
    setStep('input')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleVideoUploadComplete = async (uploadedFile: File, analysis: VideoAnalysis) => {
    setFile(uploadedFile)
    setVideoAnalysis(analysis)
    setStep('results')
    
    const enhancedPrompt = `
Video Analysis:
- Duration: ${analysis.duration.toFixed(0)}s
- Scene cuts: ${analysis.sceneCuts.length}
- Objects detected: ${analysis.objects.map(o => `${o.label} (${(o.confidence * 100).toFixed(0)}%)`).join(', ')}
- Sound events: ${analysis.soundEvents.map(e => e.type).join(', ')}
- Transcript: "${analysis.transcript.map(w => w.word).join(' ')}"
- Location: ${analysis.metadata.gpsCoordinates ? `${analysis.metadata.gpsCoordinates.lat}, ${analysis.metadata.gpsCoordinates.lon}` : 'Unknown'}
- Device: ${analysis.metadata.deviceMake} ${analysis.metadata.deviceModel}
- Audio quality: ${analysis.audioQuality}

Job title: ${title || 'Untitled job'}
    `.trim()
    
    const mockFile = new File([enhancedPrompt], "enhanced-scope.txt")
    const result = await fakeAIScope(mockFile)
    setAiResult(result)
  }

  const handleProcess = async () => {
    if (!title) {
      toast.error("Please enter a job title")
      return
    }

    if (inputMethod === 'text' && !description) {
      toast.error("Please enter a job description")
      return
    }

    if ((inputMethod === 'video' || inputMethod === 'audio') && !file) {
      toast.error(`Please upload a ${inputMethod} file`)
      return
    }

    setStep('processing')

    const mockFile = new File(["mock"], "mock.txt")
    const result = await fakeAIScope(mockFile)
    setAiResult(result)
    setStep('results')
  }

  const handlePostJob = () => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      homeownerId: user.id,
      title,
      description: description || aiResult.scope,
      mediaType: inputMethod === 'text' || inputMethod === null ? undefined : inputMethod,
      aiScope: aiResult,
      size: calculateJobSize(aiResult.priceHigh),
      status: 'open',
      createdAt: new Date().toISOString(),
      bids: []
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
              Contractors can now bid on your job. Share your referral code below to earn $20!
            </p>
          </div>
          
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
              setStep('select')
              setTitle("")
              setDescription("")
              setFile(null)
              setAiResult(null)
              setInputMethod(null)
              setCurrentReferralCode(null)
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
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
      {step === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post a Job</CardTitle>
            <CardDescription className="text-base">
              Choose how you'd like to describe your project
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => handleMethodSelect('video')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
                <Video weight="fill" className="text-primary-foreground" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Video</h3>
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

            {(inputMethod === 'video' || inputMethod === 'audio') && (
              <>
                <div className="space-y-2">
                  <Label>Upload {inputMethod === 'video' ? 'Video' : 'Audio'}</Label>
                  {inputMethod === 'video' ? (
                    <VideoUploader 
                      onUploadComplete={handleVideoUploadComplete}
                      onCancel={() => setStep('select')}
                    />
                  ) : (
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
                  )}
                  {file && inputMethod !== 'video' && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                {inputMethod !== 'video' && (
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep('select')}>
                      Back
                    </Button>
                    <Button onClick={handleProcess} className="flex-1">
                      Generate AI Scope
                    </Button>
                  </div>
                )}
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
  )
}
