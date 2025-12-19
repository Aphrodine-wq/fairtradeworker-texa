import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhotoUploader } from "@/components/ui/PhotoUploader"
import { VideoCamera, Plus, Trash, Camera, Microphone, ArrowLeft, Play, Stop } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job, ReferralCode } from "@/lib/types"
import type { UploadedPhoto } from "@/hooks/usePhotoUpload"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { fakeAIScope } from "@/lib/ai"
import { generateReferralCode } from "@/lib/viral"
import { Badge } from "@/components/ui/badge"

interface PostJobVideoProps {
  user: User
  onNavigate: (page: string) => void
}

export function PostJobVideo({ user, onNavigate }: PostJobVideoProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([])
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [referralCodes, setReferralCodes] = useKV<ReferralCode[]>("referral-codes", [])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedVideo(blob)
        setRecordedVideoUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success("Recording started...")
    } catch (error) {
      toast.error("Could not access camera")
      console.error(error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success("Video recorded!")
    }
  }

  const deleteRecording = () => {
    setRecordedVideo(null)
    setRecordedVideoUrl(null)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedVideos(prev => [...prev, ...files])
      toast.success(`${files.length} video(s) added`)
    }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
      toast.success("Audio file added")
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

    if (!recordedVideo && uploadedVideos.length === 0) {
      toast.error("Please record or upload at least one video")
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
        description: description.trim() || "Video attached",
        mediaType: 'video',
        aiScope: aiResult,
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        questions: [],
        photoCount: uploadedPhotos.filter(p => p.status === 'complete').length,
        videoCount: uploadedVideos.length + (recordedVideo ? 1 : 0),
        hasAudioFile: !!audioFile,
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
  }, [title, description, recordedVideo, uploadedVideos, uploadedPhotos, audioFile, user, setJobs, setReferralCodes, onNavigate])

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
              <VideoCamera className="w-8 h-8 text-primary" weight="fill" />
            </div>
            <h1 className="text-3xl font-bold">Post Job with Video</h1>
            <p className="text-muted-foreground mt-2">Record or upload videos showing the work needed</p>
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

          {/* Video Recording - Primary */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VideoCamera className="w-5 h-5 text-primary" weight="fill" />
                Record Video
              </CardTitle>
              <CardDescription>Record a video walkthrough of the job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!recordedVideoUrl ? (
                <>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {isRecording ? (
                      <video ref={videoRef} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <VideoCamera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>Click record to start</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      variant={isRecording ? "destructive" : "default"}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="w-48"
                    >
                      {isRecording ? (
                        <><Stop className="w-5 h-5 mr-2" weight="fill" /> Stop Recording</>
                      ) : (
                        <><VideoCamera className="w-5 h-5 mr-2" weight="fill" /> Start Recording</>
                      )}
                    </Button>
                  </div>
                  {isRecording && (
                    <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      Recording...
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <video src={recordedVideoUrl} controls className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={deleteRecording}>
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </Button>
                    <Button variant="outline" onClick={startRecording}>
                      <VideoCamera className="w-4 h-4 mr-2" /> Re-record
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-green-600">
                      ✓ Video recorded
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Additional Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload More Videos (Optional)
              </CardTitle>
              <CardDescription>Add additional video files</CardDescription>
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
                      Upload Videos
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

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description (Optional)</CardTitle>
              <CardDescription>Add details about what you need done</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the work needed..."
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
              <CardDescription>Upload photos to supplement your video</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={uploadedPhotos}
                onPhotosChange={setUploadedPhotos}
                maxPhotos={10}
              />
            </CardContent>
          </Card>

          {/* Audio Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microphone className="w-5 h-5" />
                Add Voice Note (Optional)
              </CardTitle>
              <CardDescription>Upload an audio recording</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload">
                  <Button variant="outline" asChild className="cursor-pointer">
                    <span>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Audio
                    </span>
                  </Button>
                </label>
              </div>
              
              {audioFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm truncate">{audioFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)}>
                    <Trash className="w-4 h-4" />
                  </Button>
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
              disabled={isProcessing || !title.trim() || (!recordedVideo && uploadedVideos.length === 0)}
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
