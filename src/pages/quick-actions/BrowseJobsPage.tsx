import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MagnifyingGlass, 
  Funnel, 
  Briefcase, 
  MapPin, 
  CurrencyDollar,
  Clock,
  Users,
  Sparkle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BrowseJobsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function BrowseJobsPage({ user, onNavigate }: BrowseJobsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const mockJobs = [
    { id: 1, title: "Kitchen Plumbing Repair", location: "Downtown", price: "$250-$400", bids: 3, time: "2h ago", size: "small" },
    { id: 2, title: "HVAC System Installation", location: "Northside", price: "$3,500-$5,000", bids: 8, time: "5h ago", size: "large" },
    { id: 3, title: "Electrical Panel Upgrade", location: "Eastside", price: "$1,200-$1,800", bids: 5, time: "1d ago", size: "medium" },
    { id: 4, title: "Bathroom Remodel", location: "Westside", price: "$8,000-$12,000", bids: 12, time: "2d ago", size: "large" },
    { id: 5, title: "Deck Repair", location: "Southside", price: "$600-$900", bids: 4, time: "3d ago", size: "medium" },
    { id: 6, title: "Roof Inspection", location: "Central", price: "$150-$250", bids: 7, time: "4d ago", size: "small" },
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Browse Jobs</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Discover opportunities in your area
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
                <Input
                  placeholder="Search jobs by keyword, location, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-black border-transparent dark:border-white"
                />
              </div>
              <Button className="h-12 px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                <Funnel size={20} className="mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Available Jobs</p>
              <p className="text-2xl font-bold text-black dark:text-white">142</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">New Today</p>
              <p className="text-2xl font-bold text-black dark:text-white">23</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Avg. Bid Time</p>
              <p className="text-2xl font-bold text-black dark:text-white">4.2m</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Your Matches</p>
              <p className="text-2xl font-bold text-primary">18</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <Card key={job.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{job.time}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={job.size === 'small' ? 'default' : job.size === 'medium' ? 'secondary' : 'destructive'}>
                        {job.size}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={20} className="text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-black dark:text-white">{job.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        <span className="text-black dark:text-white">{job.bids} bids</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Quick Bid
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
            Load More Jobs
          </Button>
        </div>
      </div>
    </div>
  )
}
