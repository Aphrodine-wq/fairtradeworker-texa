import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Toolbox, 
  Sparkle,
  CheckCircle,
  Calculator,
  Shield,
  FileText,
  ChartLine,
  Receipt,
  Calendar,
  Package,
  Clock,
  Users,
  MapTrifold
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface AllInOneToolkitPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function AllInOneToolkitPage({ user, onNavigate }: AllInOneToolkitPageProps) {
  const categories = [
    {
      name: "Financial Tools",
      tools: [
        { name: "Job Cost Calculator", icon: Calculator, description: "Calculate profit margins", featured: true },
        { name: "Invoice Manager", icon: Receipt, description: "Create professional invoices", featured: true },
        { name: "Expense Tracker", icon: ChartLine, description: "Track business expenses", featured: false },
      ]
    },
    {
      name: "Productivity Tools",
      tools: [
        { name: "Quick Notes", icon: FileText, description: "Capture job details", featured: true },
        { name: "Calendar Sync", icon: Calendar, description: "Sync with external calendars", featured: false },
        { name: "Time Tracker", icon: Clock, description: "Track time on projects", featured: false },
      ]
    },
    {
      name: "Planning Tools",
      tools: [
        { name: "Material Calculator", icon: Package, description: "Calculate materials needed", featured: false },
        { name: "Route Optimizer", icon: MapTrifold, description: "Optimize job routes", featured: true },
        { name: "Team Manager", icon: Users, description: "Manage your crew", featured: false },
      ]
    },
    {
      name: "Tracking Tools",
      tools: [
        { name: "Warranty Tracker", icon: Shield, description: "Track warranties given", featured: true },
      ]
    },
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
              <Toolbox size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">All-in-One Toolkit</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Everything you need to run your contracting business efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Featured Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
            <Sparkle size={24} className="text-primary" />
            Featured Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.flatMap(cat => cat.tools.filter(t => t.featured)).map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.name} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon size={20} weight="duotone" className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-black dark:text-white mb-1">{tool.name}</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">{tool.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-transparent dark:border-white text-black dark:text-white"
                      onClick={() => onNavigate?.(tool.name.toLowerCase().replace(/\s+/g, '-'))}
                    >
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* All Tools by Category */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.name}>
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Card 
                      key={tool.name} 
                      className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onNavigate?.(tool.name.toLowerCase().replace(/\s+/g, '-'))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black dark:bg-white">
                            <Icon size={20} weight="duotone" className="text-white dark:text-black" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-black dark:text-white text-sm">{tool.name}</h3>
                            <p className="text-xs text-black/60 dark:text-white/60">{tool.description}</p>
                          </div>
                          {tool.featured && (
                            <Badge className="bg-primary/10 text-primary">Featured</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
