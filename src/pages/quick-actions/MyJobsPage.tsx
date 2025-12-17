import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle,
  CircleNotch,
  Calendar,
  CurrencyDollar
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface MyJobsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function MyJobsPage({ user, onNavigate }: MyJobsPageProps) {
  const activeJobs = [
    { id: 1, title: "Kitchen Sink Installation", client: "John Smith", status: "in-progress", progress: 65, dueDate: "2025-01-20", value: "$450" },
    { id: 2, title: "Bathroom Tile Repair", client: "Sarah Johnson", status: "scheduled", progress: 0, dueDate: "2025-01-22", value: "$320" },
    { id: 3, title: "Electrical Outlet Replacement", client: "Mike Davis", status: "in-progress", progress: 40, dueDate: "2025-01-21", value: "$280" },
  ]

  const completedJobs = [
    { id: 4, title: "Plumbing Leak Fix", client: "Emily Brown", completedDate: "2025-01-15", value: "$380", rating: 5 },
    { id: 5, title: "HVAC Filter Replacement", client: "David Wilson", completedDate: "2025-01-14", value: "$150", rating: 5 },
  ]

  const pendingJobs = [
    { id: 6, title: "Deck Repair", client: "Lisa Anderson", bidAmount: "$850", submittedDate: "2025-01-18" },
    { id: 7, title: "Window Installation", client: "Robert Taylor", bidAmount: "$1,200", submittedDate: "2025-01-17" },
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
              <Briefcase size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">My Jobs</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Manage your active projects and track progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Active Jobs</p>
              <p className="text-2xl font-bold text-black dark:text-white">{activeJobs.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedJobs.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Pending Bids</p>
              <p className="text-2xl font-bold text-primary">{pendingJobs.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-black dark:text-white">$2,680</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-transparent dark:border-white">
            <TabsTrigger value="active" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Completed ({completedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Pending ({pendingJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6 space-y-4">
            {activeJobs.map((job) => (
              <Card key={job.id} className="border-2 border-transparent dark:border-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black dark:text-white">{job.title}</h3>
                        <Badge variant="outline" className="border-transparent dark:border-white">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-3">Client: {job.client}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
                          <Calendar size={16} />
                          <span>Due: {job.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CurrencyDollar size={16} />
                          <span className="font-semibold">{job.value}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-black/60 dark:text-white/60">Progress</span>
                          <span className="font-semibold text-black dark:text-white">{job.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                        View Details
                      </Button>
                      <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedJobs.map((job) => (
              <Card key={job.id} className="border-2 border-transparent dark:border-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black dark:text-white">{job.title}</h3>
                        <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-3">Client: {job.client}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
                          <Calendar size={16} />
                          <span>Completed: {job.completedDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CurrencyDollar size={16} />
                          <span className="font-semibold">{job.value}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600 dark:text-yellow-400">★</span>
                          <span className="font-semibold text-black dark:text-white">{job.rating}.0</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingJobs.map((job) => (
              <Card key={job.id} className="border-2 border-transparent dark:border-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black dark:text-white">{job.title}</h3>
                        <Badge variant="outline" className="border-transparent dark:border-white">
                          <Clock size={12} className="mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-3">Client: {job.client}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
                          <Calendar size={16} />
                          <span>Submitted: {job.submittedDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <CurrencyDollar size={16} />
                          <span className="font-semibold">{job.bidAmount}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      View Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
