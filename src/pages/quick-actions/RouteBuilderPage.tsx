import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapTrifold, 
  Plus,
  Navigation,
  Clock,
  MapPin,
  CheckCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface RouteBuilderPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function RouteBuilderPage({ user, onNavigate }: RouteBuilderPageProps) {
  const [routeName, setRouteName] = useState("")
  
  const routes = [
    { 
      id: 1, 
      name: "Monday Morning Route", 
      stops: 5, 
      distance: "12.5 mi", 
      time: "3h 20m", 
      jobs: ["Kitchen Repair", "Bathroom Tile", "Electrical Panel", "Plumbing Leak", "HVAC Service"],
      status: "active"
    },
    { 
      id: 2, 
      name: "Tuesday Afternoon Route", 
      stops: 3, 
      distance: "8.2 mi", 
      time: "2h 15m", 
      jobs: ["Deck Repair", "Window Install", "Roof Inspection"],
      status: "planned"
    },
    { 
      id: 3, 
      name: "Wednesday Route", 
      stops: 4, 
      distance: "15.8 mi", 
      time: "4h 10m", 
      jobs: ["Bathroom Remodel", "Kitchen Sink", "Electrical Outlet", "AC Repair"],
      status: "completed"
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black dark:bg-white">
                <MapTrifold size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Route Builder</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  Plan efficient routes for your daily jobs
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              New Route
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Routes</p>
              <p className="text-2xl font-bold text-black dark:text-white">{routes.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Stops</p>
              <p className="text-2xl font-bold text-primary">
                {routes.reduce((sum, r) => sum + r.stops, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Distance</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {routes.reduce((sum, r) => sum + parseFloat(r.distance.replace(' mi', '')), 0).toFixed(1)} mi
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Time Saved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">2.5h</p>
            </CardContent>
          </Card>
        </div>

        {/* Routes List */}
        <div className="space-y-6">
          {routes.map((route) => (
            <Card key={route.id} className="border-2 border-transparent dark:border-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-black dark:text-white mb-2">{route.name}</CardTitle>
                    <CardDescription className="text-black/60 dark:text-white/60">
                      {route.stops} stops • {route.distance} • {route.time}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={route.status === 'active' ? 'default' : route.status === 'completed' ? 'secondary' : 'outline'}
                    className={route.status === 'active' ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300" : ""}
                  >
                    {route.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Jobs List */}
                  <div>
                    <h4 className="text-sm font-semibold text-black dark:text-white mb-2">Jobs on Route:</h4>
                    <div className="flex flex-wrap gap-2">
                      {route.jobs.map((job, idx) => (
                        <Badge key={idx} variant="outline" className="border-transparent dark:border-white">
                          {idx + 1}. {job}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Route Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Navigation size={20} className="mx-auto mb-1 text-primary" />
                      <p className="text-xs text-black/60 dark:text-white/60">Distance</p>
                      <p className="font-bold text-black dark:text-white">{route.distance}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Clock size={20} className="mx-auto mb-1 text-primary" />
                      <p className="text-xs text-black/60 dark:text-white/60">Time</p>
                      <p className="font-bold text-black dark:text-white">{route.time}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <MapPin size={20} className="mx-auto mb-1 text-primary" />
                      <p className="text-xs text-black/60 dark:text-white/60">Stops</p>
                      <p className="font-bold text-black dark:text-white">{route.stops}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Map
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Edit Route
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Optimize
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
