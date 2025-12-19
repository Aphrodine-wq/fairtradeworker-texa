/**
 * Buddy Learning System - Stores user patterns locally in IndexedDB
 * Privacy-first: All data stored locally, only encrypted preferences synced
 */

interface LearningData {
  activityPatterns: {
    timeOfDay: Record<string, number> // Hour (0-23) -> activity count
    dayOfWeek: Record<string, number> // Day (0-6) -> activity count
  }
  leadSources: Record<string, { count: number; winRate: number }>
  followUpTiming: Record<string, number> // Hours -> success rate
  preferences: {
    preferredCallTimes: number[]
    autoDraftEmails: boolean
  }
  lastUpdated: number
}

const DB_NAME = 'void-buddy-learning'
const DB_VERSION = 1
const STORE_NAME = 'learning-data'

let dbInstance: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Load learning data from IndexedDB
 */
export async function loadLearningData(userId: string): Promise<LearningData | null> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(userId)

      request.onsuccess = () => {
        resolve(request.result?.data || null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to load learning data:', error)
    return null
  }
}

/**
 * Save learning data to IndexedDB
 */
export async function saveLearningData(userId: string, data: LearningData): Promise<void> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({
        id: userId,
        data: {
          ...data,
          lastUpdated: Date.now(),
        },
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to save learning data:', error)
  }
}

/**
 * Record activity pattern
 */
export async function recordActivity(userId: string, hour: number, dayOfWeek: number): Promise<void> {
  const data = await loadLearningData(userId) || getDefaultLearningData()
  
  data.activityPatterns.timeOfDay[hour.toString()] = (data.activityPatterns.timeOfDay[hour.toString()] || 0) + 1
  data.activityPatterns.dayOfWeek[dayOfWeek.toString()] = (data.activityPatterns.dayOfWeek[dayOfWeek.toString()] || 0) + 1
  
  await saveLearningData(userId, data)
}

/**
 * Record lead source and outcome
 */
export async function recordLeadSource(
  userId: string,
  source: string,
  won: boolean
): Promise<void> {
  const data = await loadLearningData(userId) || getDefaultLearningData()
  
  if (!data.leadSources[source]) {
    data.leadSources[source] = { count: 0, winRate: 0 }
  }
  
  const sourceData = data.leadSources[source]
  sourceData.count++
  
  // Update win rate (simple moving average)
  const currentWinRate = sourceData.winRate
  const newWinRate = won ? 1 : 0
  sourceData.winRate = (currentWinRate * (sourceData.count - 1) + newWinRate) / sourceData.count
  
  await saveLearningData(userId, data)
}

/**
 * Record follow-up timing and success
 */
export async function recordFollowUp(
  userId: string,
  hours: number,
  success: boolean
): Promise<void> {
  const data = await loadLearningData(userId) || getDefaultLearningData()
  
  const key = hours.toString()
  const currentRate = data.followUpTiming[key] || 0.5
  const newRate = success ? 1 : 0
  
  // Simple moving average
  data.followUpTiming[key] = (currentRate + newRate) / 2
  
  await saveLearningData(userId, data)
}

/**
 * Get optimal call times based on patterns
 */
export async function getOptimalCallTimes(userId: string): Promise<number[]> {
  const data = await loadLearningData(userId)
  if (!data) return [9, 10, 11, 14, 15, 16] // Default

  const timePatterns = data.activityPatterns.timeOfDay
  const sorted = Object.entries(timePatterns)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([hour]) => parseInt(hour))

  return sorted.length > 0 ? sorted : [9, 10, 11, 14, 15, 16]
}

/**
 * Get default learning data structure
 */
function getDefaultLearningData(): LearningData {
  return {
    activityPatterns: {
      timeOfDay: {},
      dayOfWeek: {},
    },
    leadSources: {},
    followUpTiming: {},
    preferences: {
      preferredCallTimes: [9, 10, 11, 14, 15, 16],
      autoDraftEmails: false,
    },
    lastUpdated: Date.now(),
  }
}
