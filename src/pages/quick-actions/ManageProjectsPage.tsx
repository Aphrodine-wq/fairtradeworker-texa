import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  FolderOpen, 
  Calendar,
  Users,
  CurrencyDollar,
  CheckCircle,
  Clock,
  AlertCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ManageProjectsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function ManageProjectsPage({ user, onNavigate }: ManageProjectsPageProps) {
  const projects = [
    { 
      id: 1, 
      name: "Smith Residence Remodel", 
      client: "John Smith", 
      status: "active", 
      progress: 72, 
      budget: "$45,000", 
      spent: "$32,400", 
      startDate: "2024-12-01", 
      endDate: "2025-02-15",
      team: 3,
      tasks: { completed: 18, total: 25 }
    },
    { 
      id: 2, 
      name: "Johnson Kitchen Renovation", 
      client: "Sarah Johnson", 
      status: "active", 
      progress: 45, 
      budget: "$28,000", 
      spent: "$12,600", 
      startDate: "2025-01-05", 
      endDate: "2025-03-20",
      team: 2,
      tasks: { completed: 9, total: 20 }
    },
    { 
      id: 3, 
      name: "Davis Office Buildout", 
      client: "Mike Davis", 
      status: "planning", 
      progress: 15, 
      budget: "$65,000", 
      spent: "$9,750", 
      startDate: "2025-01-15", 
      endDate: "2025-05-01",
      team: 4,
      tasks: { completed: 3, total: 20 }
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
              <FolderOpen size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Manage Projects</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Track progress, budgets, and timelines for all your projects
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-black dark:text-white">{projects.filter(p => p.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-black dark:text-white">$138K</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Avg. Progress</p>
              <p className="text-2xl font-bold text-primary">44%</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Team Members</p>
              <p className="text-2xl font-bold text-black dark:text-white">9</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="border-2 border-transparent dark:border-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-black dark:text-white mb-2">{project.name}</CardTitle>
                    <CardDescription className="text-black/60 dark:text-white/60">
                      Client: {project.client}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'}
                    className={project.status === 'active' ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300" : ""}
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-black/60 dark:text-white/60">Overall Progress</span>
                      <span className="font-semibold text-black dark:text-white">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CurrencyDollar size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs text-black/60 dark:text-white/60">Budget</span>
                      </div>
                      <p className="font-bold text-black dark:text-white">{project.budget}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CurrencyDollar size={16} className="text-primary" />
                        <span className="text-xs text-black/60 dark:text-white/60">Spent</span>
                      </div>
                      <p className="font-bold text-black dark:text-white">{project.spent}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={16} className="text-primary" />
                        <span className="text-xs text-black/60 dark:text-white/60">Team</span>
                      </div>
                      <p className="font-bold text-black dark:text-white">{project.team} members</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs text-black/60 dark:text-white/60">Tasks</span>
                      </div>
                      <p className="font-bold text-black dark:text-white">
                        {project.tasks.completed}/{project.tasks.total}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Start: {project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>End: {project.endDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Update Progress
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Manage Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
