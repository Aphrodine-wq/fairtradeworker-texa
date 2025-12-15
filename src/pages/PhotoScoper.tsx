import { AIPhotoScoper } from "@/components/jobs/AIPhotoScoper"
import { GlassNav, ThemePersistenceToggle } from "@/components/ui/MarketingSections"

export function PhotoScoperPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Photo Scoper", href: "#", active: true },
        ]}
        primaryLabel="Post Job"
      >
        <ThemePersistenceToggle />
      </GlassNav>
      <div className="pt-20 pb-12 px-4 max-w-6xl mx-auto">
        <AIPhotoScoper />
      </div>
    </div>
  )
}

export default PhotoScoperPage
