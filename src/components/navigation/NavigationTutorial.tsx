import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  GripVertical, 
  Eye, 
  EyeSlash,
  CheckCircle,
  Sparkle
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface TutorialStep {
  id: string
  title: string
  description: string
  highlight?: string
  action?: string
}

interface NavigationTutorialProps {
  open: boolean
  onClose: () => void
  onComplete?: () => void
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "Welcome to Navigation Customization!",
    description: "Learn how to personalize your navigation menu to match your workflow. This quick tutorial will show you the basics.",
    action: "Let's get started!"
  },
  {
    id: "reorder",
    title: "Reorder Items",
    description: "Click and drag items by the grip handle (⋮⋮) to reorder them. Your most-used items can go first!",
    highlight: "grip",
    action: "Try dragging an item now"
  },
  {
    id: "toggle",
    title: "Show or Hide Items",
    description: "Use the visibility toggle buttons to show or hide navigation items. Hidden items won't appear in your menu but remain available.",
    highlight: "toggle",
    action: "Toggle an item's visibility"
  },
  {
    id: "preview",
    title: "Preview Your Changes",
    description: "Check the preview panel on the right to see how your navigation will look. Changes are saved automatically when you click 'Save Changes'.",
    highlight: "preview",
    action: "Check the preview panel"
  },
  {
    id: "add-tools",
    title: "Add Business Tools",
    description: "Click 'Add Business Tools' to add more tools to your navigation. You can add calculators, trackers, and other helpful features.",
    highlight: "add-tools",
    action: "Explore available tools"
  },
  {
    id: "customize",
    title: "Customize Fields",
    description: "Use the 'Customize' button to choose which fields to display. Make your CRM view exactly what you need!",
    highlight: "customize",
    action: "Try customizing your view"
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "You now know how to customize your navigation. Feel free to experiment and make it your own!",
    action: "Start customizing!"
  }
]

export function NavigationTutorial({ open, onClose, onComplete }: NavigationTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.()
      onClose()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    // Auto-advance after a short delay if it's not the last step
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 1000)
    }
  }

  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
    }
  }, [open])

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Sparkle size={24} weight="duotone" className="text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                {step.title}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>
          <DialogDescription className="text-base mt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            {tutorialSteps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Visual Guide */}
          {step.highlight && (
            <div className="p-6 bg-muted/30 rounded-lg border-2 border-dashed border-primary/50">
              <div className="flex items-center justify-center gap-3 text-primary">
                {step.highlight === "grip" && (
                  <>
                    <GripVertical size={32} weight="duotone" />
                    <span className="text-lg font-semibold">Drag this handle to reorder</span>
                  </>
                )}
                {step.highlight === "toggle" && (
                  <>
                    <Eye size={32} weight="duotone" />
                    <EyeSlash size={32} weight="duotone" />
                    <span className="text-lg font-semibold">Click to show/hide</span>
                  </>
                )}
                {step.highlight === "preview" && (
                  <>
                    <Eye size={32} weight="duotone" />
                    <span className="text-lg font-semibold">Preview your navigation</span>
                  </>
                )}
                {step.highlight === "add-tools" && (
                  <>
                    <Sparkle size={32} weight="duotone" />
                    <span className="text-lg font-semibold">Add business tools</span>
                  </>
                )}
                {step.highlight === "customize" && (
                  <>
                    <CheckCircle size={32} weight="duotone" />
                    <span className="text-lg font-semibold">Customize your view</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Hint */}
          {step.action && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkle size={16} weight="duotone" className="text-primary" />
                {step.action}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft size={18} className="mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {isLastStep ? (
                <>
                  <CheckCircle size={18} weight="duotone" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}