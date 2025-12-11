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
import type { Job, User } from "@/lib/types"
import { calculateJobSize } from "@/lib/types"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface JobPosterProps {
  user: User
  onNavigate: (page: string) => void
}

type InputMethod = 'video' | 'audio' | 'text' | null
type Step = 'select' | 'input' | 'processing' | 'results'

export function JobPoster({ user, onNavigate }: JobPosterProps) {
  const [step, setStep] = useState<Step>('select')
  const [inputMethod, setInputMethod] = useState<InputMethod>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
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
    toast.success("Job posted! Contractors can now bid.")
    onNavigate('home')
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
              <div className="space-y-2">
                <Label htmlFor="file">Upload {inputMethod === 'video' ? 'Video' : 'Audio'}</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept={inputMethod === 'video' ? 'video/*' : 'audio/*'}
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
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={handleProcess} className="flex-1">
                Generate AI Scope
              </Button>
            </div>
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
