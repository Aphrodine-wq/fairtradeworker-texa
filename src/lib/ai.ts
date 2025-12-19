/* ========================================
   AI SERVICE - SMART CLAUDE TIERING
   Simple jobs = Haiku (cheap) - $0.00025/call
   Complex jobs = Sonnet (smart) - $0.003/call
   Automatic job-based model selection
   ======================================== */

import { getJobScope, type JobData } from './ai/smartClaude';
import { smartCallWithBudget } from './ai/budgetController';

interface AIConfig {
  model: string
  maxTokens: number
  temperature: number
}

const AI_CONFIG: Record<string, AIConfig> = {
  // Use Haiku for quick classifications and simple scopes
  quick: {
    model: 'claude-3-haiku-20240307',
    maxTokens: 500,
    temperature: 0.3,
  },
  // Use Haiku for standard job scoping
  standard: {
    model: 'claude-3-haiku-20240307',
    maxTokens: 1000,
    temperature: 0.5,
  },
  // Use Sonnet only for complex multi-trade projects
  complex: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2000,
    temperature: 0.7,
  },
}

// Job type classification cache with LRU eviction
const JOB_TYPE_CACHE: Map<string, CachedScope> = new Map()
const MAX_CACHE_SIZE = 200 // Maximum number of cached entries

interface CachedScope {
  scope: string
  priceLow: number
  priceHigh: number
  materials: string[]
  timestamp: number
}

// Common job patterns - skip AI for these
const COMMON_JOB_PATTERNS: Record<string, CachedScope> = {
  'toilet flapper': {
    scope: 'Replace toilet flapper valve. Simple DIY repair.',
    priceLow: 15,
    priceHigh: 50,
    materials: ['Toilet flapper', 'Chain clip'],
    timestamp: Date.now(),
  },
  'leaky faucet': {
    scope: 'Repair leaking faucet. Replace washers/cartridge.',
    priceLow: 50,
    priceHigh: 150,
    materials: ['Faucet cartridge', 'O-rings', 'Plumber tape'],
    timestamp: Date.now(),
  },
  'clogged drain': {
    scope: 'Clear clogged drain. Snake or chemical treatment.',
    priceLow: 75,
    priceHigh: 200,
    materials: ['Drain snake', 'Drain cleaner'],
    timestamp: Date.now(),
  },
  'outlet replacement': {
    scope: 'Replace electrical outlet. Standard swap.',
    priceLow: 50,
    priceHigh: 100,
    materials: ['Outlet', 'Wall plate', 'Wire nuts'],
    timestamp: Date.now(),
  },
  'light fixture': {
    scope: 'Install/replace light fixture.',
    priceLow: 75,
    priceHigh: 200,
    materials: ['Light fixture', 'Wire nuts', 'Mounting hardware'],
    timestamp: Date.now(),
  },
  'garbage disposal': {
    scope: 'Replace garbage disposal unit.',
    priceLow: 150,
    priceHigh: 350,
    materials: ['Garbage disposal', 'Plumber putty', 'Discharge tube'],
    timestamp: Date.now(),
  },
  'thermostat': {
    scope: 'Install smart/programmable thermostat.',
    priceLow: 75,
    priceHigh: 200,
    materials: ['Thermostat', 'Wire labels', 'Wall anchors'],
    timestamp: Date.now(),
  },
  'door lock': {
    scope: 'Replace door lock/deadbolt.',
    priceLow: 50,
    priceHigh: 150,
    materials: ['Lock set', 'Strike plate', 'Screws'],
    timestamp: Date.now(),
  },
}

export interface AIUsageStats {
  totalCalls: number
  cachedCalls: number
  haikuCalls: number
  sonnetCalls: number
  estimatedCost: number
}

const usageStats: AIUsageStats = {
  totalCalls: 0,
  cachedCalls: 0,
  haikuCalls: 0,
  sonnetCalls: 0,
  estimatedCost: 0,
}

export function getAIUsageStats(): AIUsageStats {
  return { ...usageStats }
}

// Cost per 1M tokens (approximate)
const COST_PER_1M = {
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
}

function determineComplexity(input: {
  description: string
  photos?: string[]
  audioTranscript?: string
}): 'quick' | 'standard' | 'complex' {
  const desc = input.description.toLowerCase()
  const hasPhotos = input.photos && input.photos.length > 0
  const wordCount = desc.split(' ').length

  // Complex indicators
  const complexKeywords = [
    'renovation', 'remodel', 'addition', 'structural',
    'foundation', 'roof replacement', 'electrical panel',
    'hvac system', 'plumbing rough-in', 'multiple trades'
  ]
  
  if (complexKeywords.some(k => desc.includes(k))) {
    return 'complex'
  }

  // Quick indicators
  if (wordCount < 20 && !hasPhotos) {
    return 'quick'
  }

  return 'standard'
}

function generateCacheKey(description: string): string {
  // Normalize and hash the description
  const normalized = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .sort()
    .join('-')
  return normalized.substring(0, 100)
}

function extractTitle(description: string): string {
  // Extract first line or first 50 chars as title
  const firstLine = description.split('\n')[0]
  return firstLine.substring(0, 50).trim() || 'Untitled Job'
}

export async function fakeAIScope(file: File): Promise<{
  scope: string
  priceLow: number
  priceHigh: number
  materials: string[]
  confidenceScore: number
  aiModel?: string
  cached?: boolean
}> {
  try {
    const fileContent = await file.text()
    const normalizedDesc = fileContent.toLowerCase().trim()
    
    // Check cache first
    for (const [pattern, cached] of Object.entries(COMMON_JOB_PATTERNS)) {
      if (normalizedDesc.includes(pattern)) {
        usageStats.totalCalls++
        usageStats.cachedCalls++
        return {
          ...cached,
          confidenceScore: 0.95,
          aiModel: 'cached',
          cached: true,
        }
      }
    }

    // Check runtime cache
    const cacheKey = generateCacheKey(normalizedDesc)
    const cached = JOB_TYPE_CACHE.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      usageStats.totalCalls++
      usageStats.cachedCalls++
      return {
        ...cached,
        confidenceScore: 0.9,
        aiModel: 'cached',
        cached: true,
      }
    }

    // Use Smart Claude Tiering System
    const jobData: JobData = {
      description: fileContent,
      title: extractTitle(fileContent),
    }
    
    // Determine if simple job for budget tracking
    const isSimple = determineComplexity({ description: fileContent }) !== 'complex'
    
    // Call with smart tiering and budget control (tracks internally)
    const scopeResult = await smartCallWithBudget(
      isSimple,
      () => getJobScope(jobData)
    )
    
    // Track usage stats
    usageStats.totalCalls++
    if (isSimple) {
      usageStats.haikuCalls++
    } else {
      usageStats.sonnetCalls++
    }
    
    const result = {
      scope: scopeResult.scope,
      priceLow: scopeResult.priceLow,
      priceHigh: scopeResult.priceHigh,
      materials: scopeResult.materials.slice(0, 6),
      confidenceScore: 85, // Default confidence for AI-generated scopes
      aiModel: scopeResult.model || 'claude-3-haiku-20240307',
      cached: false,
    }
    
    // Cache the result with LRU eviction
    if (JOB_TYPE_CACHE.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry (first key)
      const firstKey = JOB_TYPE_CACHE.keys().next().value
      if (firstKey) {
        JOB_TYPE_CACHE.delete(firstKey)
      }
    }
    
    JOB_TYPE_CACHE.set(cacheKey, {
      scope: result.scope,
      priceLow: result.priceLow,
      priceHigh: result.priceHigh,
      materials: result.materials,
      timestamp: Date.now(),
    })
    
    return result
  } catch (error) {
    console.error('AI scope generation failed, using fallback:', error)
    // Log AI response errors for debugging
    if (error instanceof Error) {
      console.error('AI error details:', error.message, error.stack)
    }
    
    const fallbackScopes = [
      {
        scope: "Replace leaking kitchen faucet cartridge, repair supply line connections, and test for proper water flow and sealing.",
        priceLow: 120,
        priceHigh: 180,
        materials: ["Moen cartridge", "Basin wrench", "Plumber's grease", "Teflon tape", "Supply lines"],
        confidenceScore: 85,
        aiModel: 'fallback',
        cached: false,
      },
      {
        scope: "Install new ceiling fan with light kit, upgraded wall switch with dimmer, and ensure proper electrical connections.",
        priceLow: 200,
        priceHigh: 300,
        materials: ["Ceiling fan mounting bracket", "Wire nuts", "Wall dimmer switch", "Light kit"],
        confidenceScore: 90,
        aiModel: 'fallback',
        cached: false,
      },
      {
        scope: "Repair drywall hole, apply joint compound, sand smooth, prime, and repaint to match existing wall color.",
        priceLow: 150,
        priceHigh: 250,
        materials: ["Drywall patch", "Joint compound", "Primer", "Paint", "Sandpaper"],
        confidenceScore: 88,
        aiModel: 'fallback',
        cached: false,
      },
      {
        scope: "Replace broken garage door torsion spring, balance door, and perform complete safety inspection of all components.",
        priceLow: 175,
        priceHigh: 275,
        materials: ["Torsion spring", "Winding bars", "Safety cables", "Lubricant"],
        confidenceScore: 92,
        aiModel: 'fallback',
        cached: false,
      },
      {
        scope: "Install new 50-gallon water heater, connect supply and drain lines, test pressure relief valve, and ensure code compliance.",
        priceLow: 800,
        priceHigh: 1200,
        materials: ["50-gal water heater", "Flex connectors", "PRV valve", "Drain pan", "Pipe fittings"],
        confidenceScore: 87,
        aiModel: 'fallback',
        cached: false,
      }
    ]
    
    return fallbackScopes[Math.floor(Math.random() * fallbackScopes.length)]
  }
}
