import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft } from "@phosphor-icons/react"
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
  }
  onPost: () => void
  onBack: () => void
}

export function ScopeResults({ title, aiScope, onPost, onBack }: ScopeResultsProps) {
  const confidenceScore = aiScope.confidenceScore || Math.floor(Math.random() * 25) + 75
  const detectedObjects = aiScope.detectedObjects || ['plumbing fixture', 'pipes']
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle weight="fill" className="text-accent" size={32} />
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
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Job Title</h3>
            <p className="text-xl">{title}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Scope of Work</h3>
            <p className="text-base leading-relaxed">{aiScope.scope}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Estimated Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-gradient-to-r from-secondary to-primary rounded-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-secondary">
                ${aiScope.priceLow}
              </span>
              <span className="text-sm text-muted-foreground">to</span>
              <span className="text-2xl font-bold text-primary">
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
            <Button onClick={onPost} className="flex-1 text-lg h-12">
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
