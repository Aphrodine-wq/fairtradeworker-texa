import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Navigation, 
  Sparkle,
  TrendingDown,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface OptimizeRoutesPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function OptimizeRoutesPage({ user, onNavigate }: OptimizeRoutesPageProps) {
  const [optimizing, setOptimizing] = useState(false)
  
  const currentRoute = {
    stops: 5,
    distance: "18.5 mi",
    time: "4h 30m",
    jobs: [
      { name: "Kitchen Repair", address: "123 Main St", time: "9:00 AM", duration: "1h" },
      { name: "Bathroom Tile", address: "456 Oak Ave", time: "10:30 AM", duration: "2h" },
      { name: "Electrical Panel", address: "789 Pine Rd", time: "1:00 PM", duration: "1.5h" },
      { name: "Plumbing Leak", address: "321 Elm St", time: "3:00 PM", duration: "45m" },
      { name: "HVAC Service", address: "654 Maple Dr", time: "4:15 PM", duration: "1h" },
    ]
  }

  const optimizedRoute = {
    stops: 5,
    distance: "14.2 mi",
    time: "3h 45m",
    savings: { distance: "4.3 mi", time: "45m" },
    jobs: [
      { name: "Kitchen Repair", address: "123 Main St", time: "9:00 AM", duration: "1h" },
      { name: "Plumbing Leak", address: "321 Elm St", time: "10:15 AM", duration: "45m" },
      { name: "Bathroom Tile", address: "456 Oak Ave", time: "11:30 AM", duration: "2h" },
      { name: "Electrical Panel", address: "789 Pine Rd", time: "2:00 PM", duration: "1.5h" },
      { name: "HVAC Service", address: "654 Maple Dr", time: "4:00 PM", duration: "1h" },
    ]
  }

  const handleOptimize = () => {
    setOptimizing(true)
    setTimeout(() => setOptimizing(false), 2000)
  }

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
              <Navigation size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Optimize Routes</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                AI-powered route optimization to save time and fuel
              </p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Route */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Current Route</CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                {currentRoute.stops} stops • {currentRoute.distance} • {currentRoute.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentRoute.jobs.map((job, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white dark:text-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black dark:text-white text-sm">{job.name}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{job.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-black dark:text-white">{job.time}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{job.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimized Route */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black dark:text-white">Optimized Route</CardTitle>
                <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                  <Sparkle size={12} className="mr-1" />
                  Optimized
                </Badge>
              </div>
              <CardDescription className="text-black/60 dark:text-white/60">
                {optimizedRoute.stops} stops • {optimizedRoute.distance} • {optimizedRoute.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {optimizedRoute.jobs.map((job, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white dark:text-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-black dark:text-white text-sm">{job.name}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{job.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-black dark:text-white">{job.time}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{job.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-black dark:text-white">Time Saved</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {optimizedRoute.savings.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-black dark:text-white">Distance Saved</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {optimizedRoute.savings.distance}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            onClick={handleOptimize}
            disabled={optimizing}
          >
            {optimizing ? (
              <>
                <Clock size={20} className="mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkle size={20} className="mr-2" />
                Optimize Route
              </>
            )}
          </Button>
          <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
            Apply Optimization
          </Button>
          <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
            View on Map
          </Button>
        </div>
      </div>
    </div>
  )
}
