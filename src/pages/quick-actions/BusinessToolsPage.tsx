import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Wrench, 
  Calculator,
  Shield,
  FileText,
  Clock,
  ChartLine,
  Receipt,
  Calendar,
  Package,
  MagnifyingGlass,
  Funnel,
  Sparkle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BusinessToolsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function BusinessToolsPage({ user, onNavigate }: BusinessToolsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const tools = [
    { id: 1, name: "Job Cost Calculator", icon: Calculator, description: "Calculate profit margins and hourly rates", category: "financial", featured: true },
    { id: 2, name: "Warranty Tracker", icon: Shield, description: "Never lose track of warranties you've given", category: "tracking", featured: false },
    { id: 3, name: "Quick Notes", icon: FileText, description: "Capture job details and customer info on the go", category: "productivity", featured: true },
    { id: 4, name: "Invoice Manager", icon: Receipt, description: "Create and manage professional invoices", category: "financial", featured: true },
    { id: 5, name: "Expense Tracker", icon: ChartLine, description: "Track business expenses for tax deductions", category: "financial", featured: false },
    { id: 6, name: "Calendar Sync", icon: Calendar, description: "Sync with Google Calendar and Outlook", category: "productivity", featured: false },
    { id: 7, name: "Material Calculator", icon: Package, description: "Calculate materials needed for projects", category: "planning", featured: false },
    { id: 8, name: "Time Tracker", icon: Clock, description: "Track time spent on jobs and projects", category: "tracking", featured: false },
  ]

  const categories = [
    { id: "all", label: "All Tools", count: tools.length },
    { id: "financial", label: "Financial", count: tools.filter(t => t.category === "financial").length },
    { id: "productivity", label: "Productivity", count: tools.filter(t => t.category === "productivity").length },
    { id: "tracking", label: "Tracking", count: tools.filter(t => t.category === "tracking").length },
    { id: "planning", label: "Planning", count: tools.filter(t => t.category === "planning").length },
  ]

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || selectedCategory === "all" || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

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
              <Wrench size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Business Tools</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                All-in-one toolkit to manage your contracting business
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                  <Input
                    placeholder="Search tools by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-black border-transparent dark:border-white"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="h-12 px-6 border-transparent dark:border-white text-black dark:text-white"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                  }}
                >
                  <Funnel size={20} className="mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id || (cat.id === "all" && !selectedCategory) ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id === "all" ? null : cat.id)}
                className={cn(
                  selectedCategory === cat.id || (cat.id === "all" && !selectedCategory)
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "border-transparent dark:border-white text-black dark:text-white"
                )}
              >
                {cat.label} ({cat.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Tools */}
        {filteredTools.filter(t => t.featured).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkle size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-black dark:text-white">Featured Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredTools.filter(t => t.featured).map((tool) => {
                const Icon = tool.icon
                return (
                  <Card 
                    key={tool.id} 
                    className="border-2 border-primary hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => onNavigate?.(tool.id.toString())}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon size={24} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-black dark:text-white">{tool.name}</h3>
                            <Badge className="bg-primary/10 text-primary">Featured</Badge>
                          </div>
                          <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigate?.(tool.id.toString())
                        }}
                      >
                        Open Tool
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Tools by Category */}
        <div className="space-y-8">
          {categories.filter(cat => cat.id !== "all").map((category) => {
            const categoryTools = filteredTools.filter(t => t.category === category.id)
            if (categoryTools.length === 0) return null
            
            return (
              <div key={category.id}>
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">{category.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <Card 
                        key={tool.id} 
                        className="border-2 border-transparent dark:border-white hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => onNavigate?.(tool.id.toString())}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-black dark:bg-white flex-shrink-0">
                              <Icon size={24} weight="duotone" className="text-white dark:text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-black dark:text-white mb-1">{tool.name}</h3>
                              <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            className="w-full border-transparent dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigate?.(tool.id.toString())
                            }}
                          >
                            Open Tool
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-black/60 dark:text-white/60">No tools found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Pro Tools Section */}
        <Card className="mt-8 border-2 border-transparent dark:border-white">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Pro Tools</CardTitle>
            <CardDescription className="text-black/60 dark:text-white/60">
              Unlock advanced features with Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-black dark:text-white mb-2">Advanced Analytics</h4>
                <p className="text-sm text-black/60 dark:text-white/60">Deep insights into your business performance</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-black dark:text-white mb-2">Automated Workflows</h4>
                <p className="text-sm text-black/60 dark:text-white/60">Streamline repetitive tasks</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-black dark:text-white mb-2">Priority Support</h4>
                <p className="text-sm text-black/60 dark:text-white/60">Get help when you need it most</p>
              </div>
            </div>
            <Button className="mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
