import type { Job } from './types'

export interface JobCluster {
  id: string
  jobs: Job[]
  centerLat: number
  centerLon: number
  centerArea: string
  radius: number
  totalDriveTime: number
  driveTimeSaved: number
  efficiencyScore: number
}

function getJobLocation(job: Job): { lat: number; lon: number; area: string } {
  const seed = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const texasRegions = [
    { name: 'Downtown Austin', lat: 30.2672, lon: -97.7431 },
    { name: 'North Austin', lat: 30.3922, lon: -97.7278 },
    { name: 'South Austin', lat: 30.2241, lon: -97.7470 },
    { name: 'East Austin', lat: 30.2711, lon: -97.7097 },
    { name: 'West Austin', lat: 30.3048, lon: -97.8206 },
    { name: 'Round Rock', lat: 30.5083, lon: -97.6789 },
    { name: 'Pflugerville', lat: 30.4394, lon: -97.6200 },
    { name: 'Cedar Park', lat: 30.5051, lon: -97.8203 },
    { name: 'Georgetown', lat: 30.6327, lon: -97.6779 },
    { name: 'Kyle', lat: 29.9894, lon: -97.8772 },
  ]
  
  const region = texasRegions[seed % texasRegions.length]
  
  const offset = (seed % 100) / 10000
  
  return {
    lat: region.lat + offset,
    lon: region.lon + offset,
    area: region.name
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateDriveTime(job1: Job, job2: Job): number {
  const loc1 = getJobLocation(job1)
  const loc2 = getJobLocation(job2)
  
  const distance = calculateDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon)
  
  const avgSpeedMph = 25
  const timeHours = distance / avgSpeedMph
  const timeMinutes = timeHours * 60
  
  return Math.round(timeMinutes)
}

function findNearestJob(currentJob: Job, remainingJobs: Job[], maxDistance: number): Job | null {
  const currentLoc = getJobLocation(currentJob)
  let nearest: Job | null = null
  let minDistance = maxDistance
  
  for (const job of remainingJobs) {
    const jobLoc = getJobLocation(job)
    const distance = calculateDistance(currentLoc.lat, currentLoc.lon, jobLoc.lat, jobLoc.lon)
    
    if (distance < minDistance) {
      minDistance = distance
      nearest = job
    }
  }
  
  return nearest
}

function optimizeRoute(jobs: Job[]): Job[] {
  if (jobs.length <= 1) return jobs
  
  const optimized: Job[] = [jobs[0]]
  const remaining = jobs.slice(1)
  
  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1]
    const nearest = findNearestJob(current, remaining, Infinity)
    
    if (nearest) {
      optimized.push(nearest)
      remaining.splice(remaining.indexOf(nearest), 1)
    } else {
      optimized.push(remaining.shift()!)
    }
  }
  
  return optimized
}

function calculateRouteDriveTime(jobs: Job[]): number {
  if (jobs.length <= 1) return 0
  
  let totalTime = 0
  for (let i = 1; i < jobs.length; i++) {
    totalTime += calculateDriveTime(jobs[i - 1], jobs[i])
  }
  
  return totalTime
}

function calculateDriveTimeSaved(jobs: Job[]): number {
  if (jobs.length <= 1) return 0
  
  const unoptimizedTime = (jobs.length - 1) * 25
  
  const optimizedTime = calculateRouteDriveTime(jobs)
  
  return Math.max(0, unoptimizedTime - optimizedTime)
}

function calculateEfficiencyScore(cluster: Omit<JobCluster, 'efficiencyScore'>): number {
  const jobCount = cluster.jobs.length
  const radiusMiles = cluster.radius
  const driveTimeSaved = cluster.driveTimeSaved
  
  let score = 50
  
  if (jobCount >= 4) score += 20
  else if (jobCount >= 3) score += 15
  else if (jobCount >= 2) score += 10
  
  if (radiusMiles <= 3) score += 20
  else if (radiusMiles <= 5) score += 15
  else if (radiusMiles <= 8) score += 10
  else score -= 10
  
  if (driveTimeSaved >= 30) score += 15
  else if (driveTimeSaved >= 20) score += 10
  else if (driveTimeSaved >= 10) score += 5
  
  const avgDriveTime = cluster.totalDriveTime / Math.max(1, cluster.jobs.length - 1)
  if (avgDriveTime <= 10) score += 15
  else if (avgDriveTime <= 15) score += 10
  else if (avgDriveTime <= 20) score += 5
  else if (avgDriveTime >= 30) score -= 10
  
  return Math.min(100, Math.max(0, score))
}

export function clusterJobsByProximity(jobs: Job[], maxRadiusMiles: number = 8): JobCluster[] {
  if (jobs.length === 0) return []
  
  const clusters: JobCluster[] = []
  const processed = new Set<string>()
  
  for (const seedJob of jobs) {
    if (processed.has(seedJob.id)) continue
    
    const seedLoc = getJobLocation(seedJob)
    const clusterJobs: Job[] = [seedJob]
    processed.add(seedJob.id)
    
    for (const job of jobs) {
      if (processed.has(job.id)) continue
      
      const jobLoc = getJobLocation(job)
      const distance = calculateDistance(seedLoc.lat, seedLoc.lon, jobLoc.lat, jobLoc.lon)
      
      if (distance <= maxRadiusMiles) {
        clusterJobs.push(job)
        processed.add(job.id)
      }
    }
    
    if (clusterJobs.length >= 2) {
      const optimizedJobs = optimizeRoute(clusterJobs)
      
      let centerLat = 0
      let centerLon = 0
      let maxDist = 0
      
      for (const job of clusterJobs) {
        const loc = getJobLocation(job)
        centerLat += loc.lat
        centerLon += loc.lon
      }
      
      centerLat /= clusterJobs.length
      centerLon /= clusterJobs.length
      
      for (const job of clusterJobs) {
        const loc = getJobLocation(job)
        const dist = calculateDistance(centerLat, centerLon, loc.lat, loc.lon)
        if (dist > maxDist) maxDist = dist
      }
      
      const totalDriveTime = calculateRouteDriveTime(optimizedJobs)
      const driveTimeSaved = calculateDriveTimeSaved(optimizedJobs)
      
      const clusterData: Omit<JobCluster, 'efficiencyScore'> = {
        id: `cluster-${seedJob.id}`,
        jobs: optimizedJobs,
        centerLat,
        centerLon,
        centerArea: getJobLocation(seedJob).area,
        radius: maxDist,
        totalDriveTime,
        driveTimeSaved
      }
      
      const efficiencyScore = calculateEfficiencyScore(clusterData)
      
      clusters.push({
        ...clusterData,
        efficiencyScore
      })
    }
  }
  
  return clusters.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
}

export function calculateRouteEfficiency(jobs: Job[]): number {
  if (jobs.length <= 1) return 100
  
  const totalDriveTime = calculateRouteDriveTime(jobs)
  const avgDriveTime = totalDriveTime / (jobs.length - 1)
  
  if (avgDriveTime <= 10) return 100
  if (avgDriveTime <= 15) return 80
  if (avgDriveTime <= 20) return 60
  if (avgDriveTime <= 30) return 40
  return 20
}

export function findNearbyJobs(anchorJob: Job, availableJobs: Job[], maxDistanceMiles: number = 10): Job[] {
  const anchorLoc = getJobLocation(anchorJob)
  
  const nearby: Array<{ job: Job; distance: number }> = []
  
  for (const job of availableJobs) {
    if (job.id === anchorJob.id) continue
    
    const jobLoc = getJobLocation(job)
    const distance = calculateDistance(anchorLoc.lat, anchorLoc.lon, jobLoc.lat, jobLoc.lon)
    
    if (distance <= maxDistanceMiles) {
      nearby.push({ job, distance })
    }
  }
  
  nearby.sort((a, b) => a.distance - b.distance)
  
  return nearby.map(item => item.job)
}
