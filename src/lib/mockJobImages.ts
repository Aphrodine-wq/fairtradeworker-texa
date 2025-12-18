/**
 * Utility functions for adding mock images to jobs
 * Uses Unsplash Source API to generate relevant images based on job titles
 * 
 * Usage Examples:
 * 
 * 1. Add mock images to a single job:
 *    const jobWithImages = addMockImagesToJob(job, 2)
 * 
 * 2. Add mock images to multiple jobs:
 *    const jobsWithImages = addMockImagesToJobs(jobs, 2)
 * 
 * 3. Generate a single image URL:
 *    const imageUrl = generateMockImageUrl('Kitchen Faucet Replacement', 0)
 * 
 * 4. Use curated images:
 *    const curatedUrl = generateCuratedImageUrl(0)
 */

import type { Job } from './types'

/**
 * Maps job keywords to Unsplash search terms for relevant images
 */
const JOB_IMAGE_KEYWORDS: Record<string, string[]> = {
  // Plumbing
  'faucet': ['kitchen faucet', 'plumbing fixture', 'bathroom sink'],
  'plumbing': ['plumbing tools', 'pipe repair', 'water system'],
  'toilet': ['bathroom toilet', 'plumbing fixture'],
  'sink': ['kitchen sink', 'bathroom sink'],
  'shower': ['shower head', 'bathroom shower'],
  'water': ['water pipe', 'plumbing'],
  
  // Electrical
  'electrical': ['electrical panel', 'wiring', 'electrician tools'],
  'panel': ['electrical panel', 'circuit breaker'],
  'outlet': ['electrical outlet', 'wall socket'],
  'light': ['light fixture', 'ceiling light', 'lamp'],
  'fan': ['ceiling fan', 'ventilation'],
  'wiring': ['electrical wiring', 'cables'],
  
  // Construction/Repair
  'drywall': ['drywall repair', 'wall patch', 'construction'],
  'paint': ['house painting', 'paint brush', 'interior paint'],
  'deck': ['wooden deck', 'outdoor deck', 'patio'],
  'fence': ['wooden fence', 'garden fence', 'privacy fence'],
  'roof': ['roofing', 'shingles', 'roof repair'],
  'flooring': ['wood floor', 'tile floor', 'carpet'],
  'window': ['window installation', 'house window'],
  'door': ['door installation', 'front door'],
  
  // HVAC
  'hvac': ['hvac system', 'air conditioning', 'heating'],
  'ac': ['air conditioner', 'cooling system'],
  'heating': ['furnace', 'heating system'],
  'vent': ['ventilation', 'air duct'],
  
  // Kitchen/Bathroom
  'kitchen': ['kitchen renovation', 'modern kitchen'],
  'bathroom': ['bathroom renovation', 'modern bathroom'],
  'cabinet': ['kitchen cabinets', 'cabinet installation'],
  'countertop': ['kitchen countertop', 'granite counter'],
  
  // General
  'repair': ['home repair', 'maintenance', 'tools'],
  'installation': ['home improvement', 'construction'],
  'remodel': ['home renovation', 'interior design'],
  'upgrade': ['home improvement', 'renovation'],
}

/**
 * Generates a relevant Unsplash image URL based on job title
 */
export function generateMockImageUrl(jobTitle: string, index: number = 0): string {
  const titleLower = jobTitle.toLowerCase()
  
  // Find matching keyword
  let searchTerm = 'home improvement'
  for (const [keyword, terms] of Object.entries(JOB_IMAGE_KEYWORDS)) {
    if (titleLower.includes(keyword)) {
      searchTerm = terms[0]
      break
    }
  }
  
  // Use Unsplash Source API for consistent, relevant images
  // Format: https://source.unsplash.com/800x600/?{search_term}
  // Adding random seed based on title hash for variety
  const seed = jobTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}&sig=${seed}`
}

/**
 * Alternative: Use Unsplash API with specific photo IDs for more control
 * These are curated construction/home improvement images
 */
const CURATED_IMAGE_IDS = [
  '1585704032915-c3400ca199e7', // Kitchen/plumbing
  '1584622650111-993a426fbf0a', // Bathroom
  '1581858726788-75bc0f6a952d', // Ceiling/electrical
  '1505691723518-36a5ac3be353', // Lighting
  '1600585154340-be6161a56a0c', // Deck/outdoor
  '1600607687939-ce8a6c25118c', // Deck detail
  '1600566753190-17f0baa2a6c3', // Outdoor construction
  '1621905251189-08b45d6a269e', // Electrical panel
  '1504307651254-35680f356dfd', // General construction
  '1600047509807-4e36a2f5e7d6', // Home repair
  '1600585152915-0f8c0b4b0b0b', // Kitchen
  '1600047509358-9e755de92c0b', // Bathroom
  '1600047509807-4e36a2f5e7d6', // Living room
  '1600047509807-4e36a2f5e7d6', // Bedroom
]

/**
 * Generates a curated Unsplash image URL
 */
export function generateCuratedImageUrl(index: number = 0): string {
  const imageId = CURATED_IMAGE_IDS[index % CURATED_IMAGE_IDS.length]
  return `https://images.unsplash.com/photo-${imageId}?w=800&auto=format&fit=crop&q=80`
}

/**
 * Adds mock images to a job if it doesn't have photos
 */
export function addMockImagesToJob(job: Job, count: number = 2): Job {
  // If job already has photos, return as-is
  if (job.photos && job.photos.length > 0) {
    return job
  }
  
  // Generate mock images based on job title
  const photos: string[] = []
  for (let i = 0; i < count; i++) {
    photos.push(generateMockImageUrl(job.title, i))
  }
  
  return {
    ...job,
    photos,
  }
}

/**
 * Adds mock images to multiple jobs
 */
export function addMockImagesToJobs(jobs: Job[], imagesPerJob: number = 2): Job[] {
  return jobs.map(job => addMockImagesToJob(job, imagesPerJob))
}

/**
 * Utility to initialize jobs with mock images in BrowseJobs
 * Call this function when jobs array is empty or needs initialization
 */
export function initializeJobsWithMockImages(existingJobs: Job[]): Job[] {
  if (existingJobs.length === 0) {
    return []
  }
  
  return addMockImagesToJobs(existingJobs, 2)
}
