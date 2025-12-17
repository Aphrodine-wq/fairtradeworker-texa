import { AIPhotoScoper } from "@/components/jobs/AIPhotoScoper"

export function PhotoScoperPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <AIPhotoScoper />
      </div>
    </div>
  )
}

export default PhotoScoperPage
