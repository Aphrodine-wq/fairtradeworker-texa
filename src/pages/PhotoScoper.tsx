import { AIPhotoScoper } from "@/components/jobs/AIPhotoScoper"

export function PhotoScoperPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-12 px-4 md:px-8 w-full">
        <AIPhotoScoper />
      </div>
    </div>
  )
}

export default PhotoScoperPage
