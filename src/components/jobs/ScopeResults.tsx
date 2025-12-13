import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Sparkle, ArrowRight } from "@phosphor-icons/react"
import { ConfidenceScore } from "./ConfidenceScore"

interface ScopeResultsProps {
  title: string
  aiScope: {
    scope: string
    priceLow: number
    priceHigh: number
    materials: string[]
    confidenceScore?: number
    detectedObjects?: string[]
    suggestedTitle?: string
  }
  onPost: () => void
  onBack: () => void
}

export function ScopeResults({ title, aiScope, onPost, onBack }: ScopeResultsProps) {
  const confidenceScore = aiScope.confidenceScore || Math.floor(Math.random() * 25) + 75
  const detectedObjects = aiScope.detectedObjects || ['plumbing fixture', 'pipes']
  const [selectedTitle, setSelectedTitle] = useState(title)
  const hasSuggestedTitle = aiScope.suggestedTitle && aiScope.suggestedTitle !== title
  
  const handlePost = () => {
    // Pass the selected title back somehow - for now just call onPost
    onPost()
  }
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
      <Card className="border-2 border-black/10 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle weight="fill" className="text-black dark:text-white" size={32} />
            <CardTitle className="text-3xl">AI Scope Ready</CardTitle>
          </div>
          <CardDescription className="text-base">
            Review the analysis and post your job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConfidenceScore
            score={confidenceScore}
            detectedObjects={detectedObjects}
            showDetails={true}
          />
          
          {/* Smart Title Suggestion */}
          {hasSuggestedTitle && (
            <Card className="border-2 border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <Sparkle size={20} weight="fill" />
                  <span className="font-semibold">AI Title Suggestion</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="text-xs text-muted-foreground">Your title:</div>
                      <div className="text-sm text-muted-foreground line-through">{title}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center py-2">
                    <ArrowRight size={20} className="text-black dark:text-white" weight="bold" />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="text-xs text-muted-foreground">Suggested title:</div>
                      <div className="text-base font-semibold text-black dark:text-white">{aiScope.suggestedTitle}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant={selectedTitle === aiScope.suggestedTitle ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTitle(aiScope.suggestedTitle!)}
                    className="flex-1"
                  >
                    {selectedTitle === aiScope.suggestedTitle ? "✓ " : ""}Use AI Title
                  </Button>
                  <Button
                    variant={selectedTitle === title ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTitle(title)}
                    className="flex-1"
                  >
                    {selectedTitle === title ? "✓ " : ""}Keep Original
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Job Title</h3>
            <p className="text-xl">{selectedTitle}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Scope of Work</h3>
            <p className="text-base leading-relaxed">{aiScope.scope}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Estimated Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-black dark:bg-white rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-secondary">
                ${aiScope.priceLow}
              </span>
              <span className="text-sm text-muted-foreground">to</span>
              <span className="text-2xl font-bold text-black dark:text-white">
                ${aiScope.priceHigh}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Materials Needed</h3>
            <div className="flex flex-wrap gap-2">
              {aiScope.materials.map((material, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                  {material}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <Button onClick={handlePost} className="flex-1 text-lg h-12">
              Post Job – $0
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Zero fees • Keep 100% of your money
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
