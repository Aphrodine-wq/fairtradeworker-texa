import { useState, lazy, Suspense, memo } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { FreeToolsHub } from "@/components/shared/FreeToolsHub"
import { HeroSection, GlassCard } from "@/components/ui/MarketingSections"

// Lazy load heavy components
const JobCostCalculator = lazy(() => import("@/components/contractor/JobCostCalculator").then((m) => ({ default: m.JobCostCalculator })))
const WarrantyTracker = lazy(() => import("@/components/contractor/WarrantyTracker").then((m) => ({ default: m.WarrantyTracker })))
const SavedContractors = lazy(() => import("@/components/homeowner/SavedContractors").then((m) => ({ default: m.SavedContractors })))
const QuickNotes = lazy(() => import("@/components/shared/QuickNotes").then((m) => ({ default: m.QuickNotes })))

interface FreeToolsPageProps {
  user: User
  onNavigate: (page: string) => void
}

function FreeToolsPageComponent({ user, onNavigate }: FreeToolsPageProps) {
  // Support initial tool selection from URL or navigation
  const [activeTool, setActiveTool] = useState<string | null>(() => {
    // Check URL hash for tool parameter
    if (typeof window !== 'undefined' && window.location.hash) {
      const toolId = window.location.hash.replace('#', '')
      if (['cost-calculator', 'warranty-tracker', 'quick-notes', 'saved-contractors'].includes(toolId)) {
        return toolId
      }
    }
    return null
  })

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
  }

  const handleBack = () => {
    setActiveTool(null)
  }

  const renderTool = () => {
    const fallback = (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
    switch (activeTool) {
      case "cost-calculator":
        return (
          <Suspense fallback={fallback}>
            <JobCostCalculator />
          </Suspense>
        )
      case "warranty-tracker":
        return (
          <Suspense fallback={fallback}>
            <WarrantyTracker user={user} />
          </Suspense>
        )
      case "saved-contractors":
        return (
          <Suspense fallback={fallback}>
            <SavedContractors user={user} onNavigate={onNavigate} />
          </Suspense>
        )
      case "quick-notes":
        return (
          <Suspense fallback={fallback}>
            <QuickNotes user={user} />
          </Suspense>
        )
      default:
        return <FreeToolsHub user={user} onToolSelect={handleToolSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-12 px-4 max-w-7xl mx-auto space-y-6">
        <HeroSection
          title="Free tools for every role"
          subtitle="Scope, calculate, track, and organize—no fees, ever."
          primaryAction={{ label: "Back to marketplace", onClick: () => onNavigate("home") }}
        />

        {activeTool && (
          <Button variant="ghost" onClick={handleBack} className="mb-2">
            <ArrowLeft size={16} className="mr-2" />
            Back to Free Tools
          </Button>
        )}

        <GlassCard className="p-4 md:p-6">{renderTool()}</GlassCard>
      </div>
    </div>
  )
}

export const FreeToolsPage = memo(FreeToolsPageComponent)
