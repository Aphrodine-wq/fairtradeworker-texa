export interface SmartReply {
  id: string
  text: string
  category: 'bidding' | 'scheduled' | 'in-progress' | 'completed'
  successRate?: number
  usageCount: number
  positiveResponses: number
  createdBy?: string
  isShared: boolean
  contractorRating?: number
  contractorJobCount?: number
}

export interface ReplyAnalytics {
  replyId: string
  sentAt: string
  responseReceived: boolean
  responseTimeMinutes?: number
  positiveResponse: boolean
}

export interface CustomerRelationship {
  customerId: string
  contractorId: string
  relationshipScore: number
  jobsCompleted: number
  onTimePayments: number
  latePayments: number
  fiveStarReviews: number
  referralsMade: number
  disputes: number
  cancelledJobs: number
  totalRevenue: number
  averageJobSize: number
  estimatedAnnualFrequency: number
  lifetimeValue: number
  lastContactDate?: string
  communicationPreferences: {
    preferredChannel: 'text' | 'email' | 'phone'
    averageResponseTimeMinutes: number
  }
  seasonalPatterns?: Array<{
    month: number
    jobType: string
    frequency: number
  }>
  propertyNetwork?: string[]
}

export interface BidDimension {
  dimension: 'hourOfDay' | 'dayOfWeek' | 'jobSize' | 'category' | 'zipCode' | 'customerType' | 'responseTime' | 'bidPosition' | 'weather'
  value: string | number
  winRate: number
  totalBids: number
  wins: number
}

export interface PhotoAnnotation {
  x: number
  y: number
  type: 'arrow' | 'circle' | 'text'
  text?: string
  color: string
}

export interface AnnotatedPhoto {
  originalUrl: string
  annotations: PhotoAnnotation[]
  annotatedDataUrl?: string
}

export interface InvoiceTemplate {
  id: string
  name: string
  jobType: string
  lineItems: Array<{
    description: string
    quantity: number
    rate: number
  }>
  notes?: string
  createdBy: string
  usageCount: number
}

export interface RecurringInvoice {
  id: string
  customerId: string
  templateId: string
  amount: number
  dayOfMonth: number
  nextGenerationDate: string
  autoSend: boolean
  isActive: boolean
}

export interface TruckInventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  minThreshold: number
  unit: string
  lastRestocked?: string
  cost?: number
}

export interface Certification {
  id: string
  name: string
  type: string
  issuer: string
  issueDate: string
  expirationDate: string
  documentUrl?: string
  verified: boolean
  autoReminderSent?: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  badgeIcon: string
  earnedAt?: string
  progress?: number
  requirement: number
  category: 'speed' | 'quality' | 'consistency' | 'growth'
}

export interface Streak {
  type: 'job' | 'response' | 'review'
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
}

export function calculateRelationshipScore(data: {
  jobsCompleted: number
  onTimePayments: number
  latePayments: number
  fiveStarReviews: number
  referralsMade: number
  disputes: number
  cancelledJobs: number
}): number {
  let score = 50
  
  score += Math.min(data.jobsCompleted * 5, 25)
  score += Math.min(data.onTimePayments * 3, 15)
  score += Math.min(data.fiveStarReviews * 5, 15)
  score += Math.min(data.referralsMade * 10, 20)
  score -= data.latePayments * 5
  score -= data.disputes * 15
  score -= data.cancelledJobs * 10
  
  return Math.max(0, Math.min(100, score))
}

export function calculateLifetimeValue(
  averageJobSize: number,
  annualFrequency: number,
  yearsAsCustomer: number
): number {
  return averageJobSize * annualFrequency * yearsAsCustomer
}

export function predictLifetimeValue(
  averageJobSize: number,
  jobsCompleted: number,
  daysSinceFirstJob: number
): number {
  if (daysSinceFirstJob === 0 || jobsCompleted === 0) return 0
  
  const yearsAsCustomer = daysSinceFirstJob / 365
  const annualFrequency = jobsCompleted / yearsAsCustomer
  const estimatedTotalYears = 5
  
  return calculateLifetimeValue(averageJobSize, annualFrequency, estimatedTotalYears)
}

export function detectMessageSentiment(message: string): 'frustrated' | 'happy' | 'neutral' {
  const lowerMessage = message.toLowerCase()
  
  const frustratedKeywords = ['waiting', 'still', 'when', 'delayed', 'late', 'not yet', 'haven\'t', 'disappointing']
  const happyKeywords = ['great', 'thanks', 'awesome', 'excellent', 'perfect', 'appreciate', 'wonderful', 'love']
  
  const frustratedCount = frustratedKeywords.filter(word => lowerMessage.includes(word)).length
  const happyCount = happyKeywords.filter(word => lowerMessage.includes(word)).length
  
  if (frustratedCount > happyCount && frustratedCount > 0) return 'frustrated'
  if (happyCount > frustratedCount && happyCount > 0) return 'happy'
  return 'neutral'
}

export function getTimeAwareReplies(hour: number): string[] {
  if (hour >= 6 && hour < 12) {
    return [
      "I can be there this afternoon",
      "I'll swing by this morning if that works",
      "Starting my route now, can add you today"
    ]
  } else if (hour >= 12 && hour < 17) {
    return [
      "I can stop by later today",
      "Available tomorrow morning",
      "I'll follow up first thing tomorrow"
    ]
  } else if (hour >= 17 && hour < 22) {
    return [
      "I'll check my schedule and follow up tomorrow morning",
      "I have availability Monday",
      "Let me get back to you first thing tomorrow"
    ]
  } else {
    return [
      "I'll respond first thing in the morning",
      "Will follow up as soon as I start my day",
      "I'll check my availability tomorrow morning"
    ]
  }
}

export function getSentimentBasedReplies(sentiment: 'frustrated' | 'happy' | 'neutral'): string[] {
  if (sentiment === 'frustrated') {
    return [
      "I apologize for any delay. Let me make this right - I can prioritize your job.",
      "I understand your frustration. I'm committed to getting this resolved quickly.",
      "Sorry for the wait. I can come by today to address this."
    ]
  } else if (sentiment === 'happy') {
    return [
      "Thanks so much! Let me know if you need anything else.",
      "Appreciate your kind words! Happy to help anytime.",
      "Glad I could help! I'm here if you need any future work done."
    ]
  } else {
    return [
      "I can take a look and provide a detailed estimate.",
      "Happy to help with that. When works best for you?",
      "I have experience with this type of work. Let's discuss details."
    ]
  }
}

export function calculateWinRateByDimension(
  bids: Array<{ status: string; hour?: number; day?: string; size?: string; category?: string }>,
  dimension: 'hour' | 'day' | 'size' | 'category'
): BidDimension[] {
  const groups: Record<string, { wins: number; total: number }> = {}
  
  bids.forEach(bid => {
    let key: string = 'unknown'
    
    if (dimension === 'hour' && bid.hour !== undefined) {
      key = bid.hour.toString()
    } else if (dimension === 'day' && bid.day) {
      key = bid.day
    } else if (dimension === 'size' && bid.size) {
      key = bid.size
    } else if (dimension === 'category' && bid.category) {
      key = bid.category
    }
    
    if (!groups[key]) {
      groups[key] = { wins: 0, total: 0 }
    }
    
    groups[key].total++
    if (bid.status === 'accepted') {
      groups[key].wins++
    }
  })
  
  return Object.entries(groups).map(([value, stats]) => ({
    dimension: dimension === 'hour' ? 'hourOfDay' : dimension === 'day' ? 'dayOfWeek' : dimension === 'size' ? 'jobSize' : 'category',
    value,
    winRate: stats.total > 0 ? stats.wins / stats.total : 0,
    totalBids: stats.total,
    wins: stats.wins
  }))
}

export function simulateBidOutcome(
  currentPrice: number,
  priceAdjustment: number,
  historicalBids: Array<{ amount: number; won: boolean }>
): { estimatedWinRate: number; confidence: number } {
  const adjustedPrice = currentPrice + priceAdjustment
  
  const similarBids = historicalBids.filter(bid => 
    Math.abs(bid.amount - adjustedPrice) < adjustedPrice * 0.2
  )
  
  if (similarBids.length < 5) {
    return { estimatedWinRate: 0.5, confidence: 0.3 }
  }
  
  const wins = similarBids.filter(bid => bid.won).length
  const winRate = wins / similarBids.length
  const confidence = Math.min(similarBids.length / 20, 1)
  
  return { estimatedWinRate: winRate, confidence }
}

export function checkAchievement(
  type: string,
  count: number,
  achievements: Achievement[]
): Achievement | null {
  const achievement = achievements.find(a => a.id === type && !a.earnedAt)
  
  if (achievement && count >= achievement.requirement) {
    return { ...achievement, earnedAt: new Date().toISOString() }
  }
  
  return null
}

export function updateStreak(
  streak: Streak,
  activityOccurred: boolean,
  activityDate: string
): Streak {
  const lastDate = new Date(streak.lastActivityDate)
  const currentDate = new Date(activityDate)
  const daysDifference = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (activityOccurred) {
    if (daysDifference === 1) {
      return {
        ...streak,
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
        lastActivityDate: activityDate
      }
    } else if (daysDifference === 0) {
      return streak
    } else {
      return {
        ...streak,
        currentStreak: 1,
        lastActivityDate: activityDate
      }
    }
  }
  
  return streak
}

export function parseExifGPS(photo: File): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    try {
      resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export function groupPhotosByLocation(
  photos: Array<{ url: string; gps?: { lat: number; lng: number } }>,
  radiusMeters: number = 10
): Array<{ location: string; photos: string[]; count: number }> {
  const groups: Array<{ location: string; photos: string[]; gps?: { lat: number; lng: number } }> = []
  
  photos.forEach(photo => {
    if (!photo.gps) {
      const ungroupedIndex = groups.findIndex(g => g.location === 'Ungrouped')
      if (ungroupedIndex >= 0) {
        groups[ungroupedIndex].photos.push(photo.url)
      } else {
        groups.push({ location: 'Ungrouped', photos: [photo.url] })
      }
      return
    }
    
    let assigned = false
    for (const group of groups) {
      if (group.gps) {
        const distance = calculateDistance(photo.gps, group.gps)
        if (distance <= radiusMeters) {
          group.photos.push(photo.url)
          assigned = true
          break
        }
      }
    }
    
    if (!assigned) {
      groups.push({
        location: `Location ${groups.length + 1}`,
        photos: [photo.url],
        gps: photo.gps
      })
    }
  })
  
  return groups.map(g => ({ location: g.location, photos: g.photos, count: g.photos.length }))
}

function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371000
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function estimateOfflineRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): { distanceMeters: number; durationMinutes: number } {
  const straightLineDistance = calculateDistance(start, end)
  const roadFactor = 1.4
  const estimatedDistance = straightLineDistance * roadFactor
  
  const averageSpeedKmh = 45
  const durationMinutes = (estimatedDistance / 1000 / averageSpeedKmh) * 60
  
  return {
    distanceMeters: Math.round(estimatedDistance),
    durationMinutes: Math.round(durationMinutes)
  }
}

export function getAllRoutePermutations<T>(stops: T[]): T[][] {
  if (stops.length <= 1) return [stops]
  
  const result: T[][] = []
  
  for (let i = 0; i < stops.length; i++) {
    const rest = [...stops.slice(0, i), ...stops.slice(i + 1)]
    const perms = getAllRoutePermutations(rest)
    
    for (const perm of perms) {
      result.push([stops[i], ...perm])
    }
  }
  
  return result
}

export function calculateGasCost(
  distanceMeters: number,
  mpg: number,
  gasPrice: number = 3.5
): number {
  const miles = distanceMeters / 1609.34
  const gallons = miles / mpg
  return gallons * gasPrice
}

export function calculateCarbonFootprint(distanceMeters: number): {
  miles: number
  co2PoundsAvoided: number
} {
  const miles = distanceMeters / 1609.34
  const co2PerMile = 0.89
  
  return {
    miles: Math.round(miles * 10) / 10,
    co2PoundsAvoided: Math.round(miles * co2PerMile * 10) / 10
  }
}
