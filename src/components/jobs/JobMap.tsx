import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Job } from "@/lib/types"
import { MapPin, X } from "@phosphor-icons/react"

// Using a simple marker-based approach without Leaflet to avoid complexity
// This creates a simplified map view using CSS positioning

interface JobMapProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
}

export function JobMap({ jobs, onJobClick }: JobMapProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Simple geocoding simulation - in production, would use actual coordinates
  // For demo, we'll use a hash of the job ID to create pseudo-random positions
  const getJobPosition = (job: Job) => {
    const hash = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
      x: (hash % 70) + 15, // 15-85% range
      y: ((hash * 7) % 60) + 15 // 15-75% range
    }
  }

  // Group nearby jobs (within 5% distance)
  const clusterJobs = () => {
    const clusters: { jobs: Job[], position: { x: number, y: number } }[] = []
    const processed = new Set<string>()

    jobs.forEach(job => {
      if (processed.has(job.id)) return
      
      const pos = getJobPosition(job)
      const nearby = jobs.filter(j => {
        if (processed.has(j.id)) return false
        const jPos = getJobPosition(j)
        const distance = Math.sqrt(Math.pow(pos.x - jPos.x, 2) + Math.pow(pos.y - jPos.y, 2))
        return distance < 8 // Cluster threshold
      })

      nearby.forEach(j => processed.add(j.id))
      clusters.push({
        jobs: nearby,
        position: pos
      })
    })

    return clusters
  }

  const clusters = clusterJobs()
  const totalJobs = jobs.length

  return (
    <div className="space-y-4">
      {/* Map Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          <MapPin className="mr-1" weight="duotone" size={16} />
          {totalJobs} jobs on map
        </Badge>
        <Badge variant="outline" className="text-sm">
          {clusters.length} locations
        </Badge>
      </div>

      {/* Map Container */}
      <Card className="relative h-[600px] overflow-hidden bg-white dark:bg-black">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Job Markers */}
        {clusters.map((cluster, idx) => {
          const isMultiple = cluster.jobs.length > 1
          const position = cluster.position

          return (
            <button
              key={idx}
              onClick={() => setSelectedJob(cluster.jobs[0])}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`
              }}
            >
              <div className="relative">
                {/* Marker Pin */}
                <div className="relative">
                  <MapPin 
                    size={isMultiple ? 40 : 32} 
                    weight="fill" 
                    className="text-black dark:text-white drop-shadow-lg"
                  />
                  {/* Cluster Count */}
                  {isMultiple && (
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-0 shadow-sm">
                      {cluster.jobs.length}
                    </div>
                  )}
                </div>
                {/* Pulse animation for fresh jobs */}
                {cluster.jobs.some(j => {
                  const jobAge = Date.now() - new Date(j.createdAt).getTime()
                  return jobAge <= 15 * 60 * 1000
                }) && (
                  <div className="absolute inset-0 animate-ping">
                    <MapPin 
                      size={isMultiple ? 40 : 32} 
                      weight="fill" 
                      className="text-green-500 opacity-75"
                    />
                  </div>
                )}
              </div>
            </button>
          )
        })}

        {/* Job Preview Popup */}
        {selectedJob && (
          <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto z-10">
            <Card className="p-4 shadow-xl border-2 border-primary">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selectedJob.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedJob.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedJob(null)
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">
                  {selectedJob.size}
                </Badge>
                <span className="text-sm font-semibold text-black dark:text-white">
                  ${selectedJob.aiScope.priceLow} - ${selectedJob.aiScope.priceHigh}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedJob.bids.length} bids
                </span>
              </div>

              <Button 
                onClick={() => onJobClick(selectedJob)}
                className="w-full"
              >
                View Full Details
              </Button>
            </Card>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white dark:bg-black rounded-lg p-3 shadow-lg space-y-2 text-xs">
          <div className="font-semibold mb-2">Legend</div>
          <div className="flex items-center gap-2">
            <MapPin size={20} weight="fill" className="text-black dark:text-white" />
            <span>Single Job</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={24} weight="fill" className="text-orange-500" />
            <span>Multiple Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 animate-pulse"></div>
            <span>Fresh Job</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
