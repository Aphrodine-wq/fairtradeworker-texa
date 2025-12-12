import { useState, lazy, Suspense, memo } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { FreeToolsHub } from "@/components/shared/FreeToolsHub"

// Lazy load heavy components
const JobCostCalculator = lazy(() => import("@/components/contractor/JobCostCalculator").then(m => ({ default: m.JobCostCalculator })))
const WarrantyTracker = lazy(() => import("@/components/contractor/WarrantyTracker").then(m => ({ default: m.WarrantyTracker })))
const SavedContractors = lazy(() => import("@/components/homeowner/SavedContractors").then(m => ({ default: m.SavedContractors })))
const QuickNotes = lazy(() => import("@/components/shared/QuickNotes").then(m => ({ default: m.QuickNotes })))

interface FreeToolsPageProps {
  user: User
  onNavigate: (page: string) => void
}

function FreeToolsPageComponent({ user, onNavigate }: FreeToolsPageProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
  }

  const handleBack = () => {
    setActiveTool(null)
  }

  const renderTool = () => {
    switch (activeTool) {
      case "cost-calculator":
        return (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <JobCostCalculator />
          </Suspense>
        )
      case "warranty-tracker":
        return (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <WarrantyTracker user={user} />
          </Suspense>
        )
      case "saved-contractors":
        return (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <SavedContractors user={user} onNavigate={onNavigate} />
          </Suspense>
        )
      case "quick-notes":
        return (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <QuickNotes user={user} />
          </Suspense>
        )
      default:
        return <FreeToolsHub user={user} onToolSelect={handleToolSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {activeTool && (
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Free Tools
          </Button>
        )}
        
        {renderTool()}
      </div>
    </div>
  )
}

export const FreeToolsPage = memo(FreeToolsPageComponent)
