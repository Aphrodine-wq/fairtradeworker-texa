import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { FreeToolsHub } from "@/components/shared/FreeToolsHub"
import { JobCostCalculator } from "@/components/contractor/JobCostCalculator"
import { WarrantyTracker } from "@/components/contractor/WarrantyTracker"
import { SavedContractors } from "@/components/homeowner/SavedContractors"
import { QuickNotes } from "@/components/shared/QuickNotes"

interface FreeToolsPageProps {
  user: User
  onNavigate: (page: string) => void
}

export function FreeToolsPage({ user, onNavigate }: FreeToolsPageProps) {
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
        return <JobCostCalculator />
      case "warranty-tracker":
        return <WarrantyTracker user={user} />
      case "saved-contractors":
        return <SavedContractors user={user} onNavigate={onNavigate} />
      case "quick-notes":
        return <QuickNotes user={user} />
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
