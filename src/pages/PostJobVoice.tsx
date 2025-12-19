import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PhotoUploader } from "@/components/ui/PhotoUploader"
import { Microphone, Plus, Trash, Camera, VideoCamera, ArrowLeft, Check, Play, Pause, Stop } from "@phosphor-icons/react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import type { User, Job } from "@/lib/types"
import type { UploadedPhoto } from "@/hooks/usePhotoUpload"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { fakeAIScope } from "@/lib/ai"
import { generateReferralCode } from "@/lib/viral"
import type { ReferralCode } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PostJobVoiceProps {
  user: User
  onNavigate: (page: string) => void
}

export function PostJobVoice({ user, onNavigate }: PostJobVoiceProps) {
  // All hooks must be called unconditionally
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [referralCodes, setReferralCodes] = useKV<ReferralCode[]>("referral-codes", [])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      onNavigate('home')
    }
  }, [user, onNavigate])

  if (!user) {
    return null
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success("Recording started...")
    } catch (error) {
      toast.error("Could not access microphone")
      console.error(error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success("Recording saved!")
    }
  }

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedVideos(prev => [...prev, ...files])
      toast.success(`${files.length} video(s) added`)
    }
  }

  const removeVideo = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Please enter a job title")
      return
    }

    if (!audioBlob && !description.trim()) {
      toast.error("Please record audio or add a description")
      return
    }

    setIsProcessing(true)

    try {
      const mockFile = new File(["mock"], "mock.txt")
      const aiResult = await fakeAIScope(mockFile)

      const newJob: Job = {
        id: `job-${Date.now()}`,
        homeownerId: user.id,
        title: title.trim(),
        description: description.trim() || "Voice description attached",
        mediaType: 'audio',
        aiScope: aiResult,
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        questions: [],
        hasVoiceRecording: !!audioBlob,
        photoCount: uploadedPhotos.filter(p => p.status === 'complete').length,
        videoCount: uploadedVideos.length,
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

      toast.success("Job posted! Redirecting to browse jobs...")
      
      setTimeout(() => {
        onNavigate('browse-jobs')
      }, 1000)

    } catch (error) {
      toast.error("Failed to post job")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }, [title, description, audioBlob, uploadedPhotos, uploadedVideos, user, setJobs, setReferralCodes, onNavigate])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => onNavigate('unified-post-job')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Microphone className="w-8 h-8 text-primary" weight="fill" />
            </div>
            <h1 className="text-3xl font-bold">Post Job with Voice</h1>
            <p className="text-muted-foreground mt-2">Record your job description and add photos/videos</p>
          </div>

          {/* Job Title */}
          <Card>
            <CardHeader>
              <CardTitle>Job Title</CardTitle>
              <CardDescription>Give your job a clear, descriptive title</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., Fix leaky kitchen faucet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Voice Recording */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microphone className="w-5 h-5" />
                Voice Recording
              </CardTitle>
              <CardDescription>Record a description of your job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!audioUrl ? (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-48 h-16"
                  >
                    {isRecording ? (
                      <>
                        <Stop className="w-6 h-6 mr-2" weight="fill" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Microphone className="w-6 h-6 mr-2" weight="fill" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={isPlaying ? pauseAudio : playAudio}
                    >
                      {isPlaying ? (
                        <><Pause className="w-5 h-5 mr-2" /> Pause</>
                      ) : (
                        <><Play className="w-5 h-5 mr-2" /> Play</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={deleteRecording}
                    >
                      <Trash className="w-5 h-5 mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={startRecording}
                    >
                      <Microphone className="w-5 h-5 mr-2" />
                      Re-record
                    </Button>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="text-green-600">
                      <Check className="w-4 h-4 mr-1" /> Recording saved
                    </Badge>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  Recording...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Description */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details (Optional)</CardTitle>
              <CardDescription>Add any extra information about the job</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Add Photos (Optional)
              </CardTitle>
              <CardDescription>Upload photos to help contractors understand the job</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={uploadedPhotos}
                onPhotosChange={setUploadedPhotos}
                maxPhotos={10}
              />
            </CardContent>
          </Card>

          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VideoCamera className="w-5 h-5" />
                Add Videos (Optional)
              </CardTitle>
              <CardDescription>Upload videos showing the work needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button variant="outline" asChild className="cursor-pointer">
                    <span>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Videos
                    </span>
                  </Button>
                </label>
              </div>
              
              {uploadedVideos.length > 0 && (
                <div className="space-y-2">
                  {uploadedVideos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm truncate">{video.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeVideo(index)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate('unified-post-job')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || !title.trim()}
              className="flex-1"
            >
              {isProcessing ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
