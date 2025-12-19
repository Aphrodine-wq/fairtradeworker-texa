import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhotoUploader } from "@/components/ui/PhotoUploader"
import { Camera, Plus, Trash, VideoCamera, Microphone, ArrowLeft } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job, ReferralCode } from "@/lib/types"
import type { UploadedPhoto } from "@/hooks/usePhotoUpload"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { fakeAIScope } from "@/lib/ai"
import { generateReferralCode } from "@/lib/viral"

interface PostJobPhotoProps {
  user: User
  onNavigate: (page: string) => void
}

export function PostJobPhoto({ user, onNavigate }: PostJobPhotoProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [referralCodes, setReferralCodes] = useKV<ReferralCode[]>("referral-codes", [])

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

    const completedPhotos = uploadedPhotos.filter(p => p.status === 'complete')
    if (completedPhotos.length === 0) {
      toast.error("Please upload at least one photo")
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
        description: description.trim() || "Photos attached",
        mediaType: 'photo',
        aiScope: aiResult,
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        questions: [],
        photoCount: completedPhotos.length,
        videoCount: uploadedVideos.length,
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
  }, [title, description, uploadedPhotos, uploadedVideos, audioFile, user, setJobs, setReferralCodes, onNavigate])

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
              <Camera className="w-8 h-8 text-primary" weight="fill" />
            </div>
            <h1 className="text-3xl font-bold">Post Job with Photos</h1>
            <p className="text-muted-foreground mt-2">Upload photos and add videos/audio</p>
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

          {/* Photo Upload - Primary */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" weight="fill" />
                Photos (Required)
              </CardTitle>
              <CardDescription>Upload photos showing the work needed</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={uploadedPhotos}
                onPhotosChange={setUploadedPhotos}
                maxPhotos={20}
              />
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

          {/* Audio Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microphone className="w-5 h-5" />
                Add Voice Note (Optional)
              </CardTitle>
              <CardDescription>Upload an audio recording explaining the job</CardDescription>
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
              disabled={isProcessing || !title.trim() || uploadedPhotos.filter(p => p.status === 'complete').length === 0}
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
