import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  MapTrifold,
  Clock,
  Sparkle,
  CheckCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface FindOpportunitiesPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function FindOpportunitiesPage({ user, onNavigate }: FindOpportunitiesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const opportunities = [
    { id: 1, title: "High-Priority Plumbing Jobs", count: 12, match: 95, trend: "+15%", category: "plumbing" },
    { id: 2, title: "Electrical Projects in Your Area", count: 8, match: 88, trend: "+22%", category: "electrical" },
    { id: 3, title: "HVAC Emergency Calls", count: 5, match: 92, trend: "+8%", category: "hvac" },
    { id: 4, title: "Remodeling Projects", count: 18, match: 75, trend: "+30%", category: "remodeling" },
    { id: 5, title: "Quick Fix Opportunities", count: 24, match: 85, trend: "+12%", category: "repair" },
  ]

  const categories = [
    { id: "all", label: "All Opportunities", count: 67 },
    { id: "plumbing", label: "Plumbing", count: 12 },
    { id: "electrical", label: "Electrical", count: 8 },
    { id: "hvac", label: "HVAC", count: 5 },
    { id: "remodeling", label: "Remodeling", count: 18 },
    { id: "repair", label: "Repairs", count: 24 },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-black dark:bg-white">
              <Target size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Find Opportunities</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Discover jobs that match your skills and location
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id === "all" ? null : cat.id)}
              className={cn(
                selectedCategory === cat.id 
                  ? "bg-black dark:bg-white text-white dark:text-black" 
                  : "border-transparent dark:border-white text-black dark:text-white"
              )}
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-black dark:text-white">{opp.title}</CardTitle>
                  <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                    {opp.match}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-black dark:text-white">{opp.count}</span>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp size={16} />
                      <span className="text-sm font-semibold">{opp.trend}</span>
                    </div>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Active opportunities in this category
                  </p>
                  <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                    View Opportunities
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <Card className="border-2 border-transparent dark:border-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
              <Sparkle size={20} className="text-primary" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Based on your profile and past performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Plumbing jobs within 5 miles", value: "8 matches" },
                { label: "Jobs matching your skills", value: "15 matches" },
                { label: "High-value projects", value: "3 matches" },
                { label: "Quick turnaround jobs", value: "12 matches" },
              ].map((rec, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-black dark:text-white">{rec.label}</span>
                  </div>
                  <Badge variant="outline" className="border-transparent dark:border-white">
                    {rec.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
