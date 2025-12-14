/**
 * Review & Rating System
 * Free Feature - Post-job ratings → display on profiles + sort higher
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Star,
  Camera,
  Upload,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface Review {
  id: string
  jobId: string
  contractorId: string
  homeownerId: string
  rating: number // 1-5
  text: string
  photos: string[]
  response?: string
  createdAt: string
}

interface ReviewRatingSystemProps {
  user: User
  job: Job
  onComplete?: () => void
}

export function ReviewRatingSystem({ user, job, onComplete }: ReviewRatingSystemProps) {
  const [reviews, setReviews] = useLocalKV<Review[]>("reviews", [])
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState("")
  const [photos, setPhotos] = useState<string[]>([])

  const handlePhotoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          setPhotos([...photos, dataUrl])
        }
        reader.readAsDataURL(file)
      })
      toast.success("Photos uploaded")
    }
    input.click()
  }

  const submitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review")
      return
    }

    const newReview: Review = {
      id: `review-${Date.now()}`,
      jobId: job.id,
      contractorId: job.contractorId || '',
      homeownerId: user.id,
      rating,
      text: reviewText,
      photos,
      createdAt: new Date().toISOString()
    }

    setReviews([...reviews, newReview])
    toast.success("Review submitted!")
    
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <CardDescription>
          Help others by sharing your experience with {job.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Rating</Label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  size={32}
                  weight={star <= rating ? "fill" : "regular"}
                  className={star <= rating ? "text-yellow-400" : "text-black dark:text-white"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="review-text">Your Review</Label>
          <Textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell others about your experience..."
            className="mt-2 min-h-[150px]"
          />
        </div>

        <div>
          <Label>Photos (optional)</Label>
          <Button
            variant="outline"
            onClick={handlePhotoUpload}
            className="mt-2"
          >
            <Camera size={16} className="mr-2" />
            Add Photos
          </Button>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {photos.map((photo, idx) => (
                <img key={idx} src={photo} alt={`Review ${idx + 1}`} className="w-full h-24 object-cover border-2 border-black dark:border-white" />
              ))}
            </div>
          )}
        </div>

        <Button onClick={submitReview} className="w-full">
          <CheckCircle size={16} className="mr-2" />
          Submit Review
        </Button>
      </CardContent>
    </Card>
  )
}
