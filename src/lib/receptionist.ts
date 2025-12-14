/**
 * AI Receptionist Helper Functions
 * Client-side utilities for managing receptionist calls and jobs
 */

import { useMemo } from 'react'
import type { Job, User } from './types'
import { useLocalKV } from '@/hooks/useLocalKV'

export interface ReceptionistCall {
  id: string
  contractorId: string
  callerPhone: string
  callerName: string | null
  transcript: string
  recordingUrl?: string
  extraction: CallExtraction
  jobId?: string
  status: 'new' | 'processed' | 'voicemail' | 'missed'
  createdAt: string
}

export interface CallExtraction {
  callerName: string | null
  callerPhone: string
  issueType: 'repair' | 'install' | 'inspect' | 'emergency' | 'quote' | 'other'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  propertyAddress: string | null
  description: string
  estimatedScope: string | null
  confidence: number
}

/**
 * Create a private job from a receptionist call
 */
export function createPrivateJobFromCall(
  call: ReceptionistCall,
  contractorId: string
): Job {
  return {
    id: `private-job-${Date.now()}`,
    homeownerId: 'temp', // Will be updated when homeowner onboards
    contractorId,
    title: call.extraction.description.substring(0, 100) || 'New Lead',
    description: call.extraction.description,
    address: call.extraction.propertyAddress || '',
    zipCode: extractZipCode(call.extraction.propertyAddress),
    size: 'medium' as const,
    status: 'open' as const,
    tradesRequired: [],
    permitRequired: false,
    createdAt: call.createdAt,
    isPrivate: true, // Flag for private jobs (bypass marketplace)
    source: 'ai_receptionist',
    metadata: {
      callId: call.id,
      callerPhone: call.callerPhone,
      callerName: call.callerName,
      transcript: call.transcript,
      recordingUrl: call.recordingUrl,
      urgency: call.extraction.urgency,
      estimatedScope: call.extraction.estimatedScope
    },
    // AI scoping placeholder
    aiScope: {
      scope: call.extraction.description,
      priceLow: estimatePriceLow(call.extraction),
      priceHigh: estimatePriceHigh(call.extraction),
      materials: [],
      confidenceScore: call.extraction.confidence * 100
    },
    bids: [],
    milestones: [],
    photos: []
  }
}

/**
 * Extract ZIP code from address string
 */
function extractZipCode(address: string | null): string {
  if (!address) return ''
  const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/)
  return zipMatch ? zipMatch[0] : ''
}

/**
 * Map issue type to job category
 */
function mapIssueTypeToCategory(
  issueType: CallExtraction['issueType']
): string {
  const mapping: Record<string, string> = {
    repair: 'repair',
    install: 'installation',
    inspect: 'inspection',
    emergency: 'emergency',
    quote: 'consultation',
    other: 'general'
  }
  return mapping[issueType] || 'general'
}

/**
 * Estimate low price based on extraction
 */
function estimatePriceLow(extraction: CallExtraction): number {
  // Simple heuristic - will be improved with materials DB
  if (extraction.estimatedScope?.includes('small')) return 100
  if (extraction.estimatedScope?.includes('major')) return 5000
  return 500 // default
}

/**
 * Estimate high price based on extraction
 */
function estimatePriceHigh(extraction: CallExtraction): number {
  if (extraction.estimatedScope?.includes('small')) return 1000
  if (extraction.estimatedScope?.includes('major')) return 50000
  return 5000 // default
}

/**
 * Hook to manage receptionist calls in CRM
 */
export function useReceptionistCalls(contractorId: string) {
  const [calls, setCalls] = useLocalKV<ReceptionistCall[]>(
    `receptionist-calls-${contractorId}`,
    []
  )

  const addCall = (call: ReceptionistCall) => {
    setCalls((current) => [call, ...(current || [])])
  }

  const updateCall = (callId: string, updates: Partial<ReceptionistCall>) => {
    setCalls((current) =>
      (current || []).map((c) => (c.id === callId ? { ...c, ...updates } : c))
    )
  }

  const newCalls = calls?.filter((c) => c.status === 'new') || []
  const voicemailCalls = calls?.filter((c) => c.status === 'voicemail') || []

  return {
    calls: calls || [],
    newCalls,
    voicemailCalls,
    addCall,
    updateCall
  }
}

/**
 * Hook to manage private jobs created from receptionist
 */
export function useReceptionistJobs(contractorId: string) {
  const [jobs] = useLocalKV<Job[]>(`jobs`, [])
  
  const privateJobs = useMemo(() => {
    return (jobs || []).filter(
      (j) => j.contractorId === contractorId && j.isPrivate && j.source === 'ai_receptionist'
    )
  }, [jobs, contractorId])

  return {
    privateJobs,
    totalCount: privateJobs.length,
    newCount: privateJobs.filter((j) => j.status === 'open').length
  }
}

/**
 * Hook to get caller history for context-aware conversations
 */
export function useCallerHistory(callerPhone: string, contractorId: string) {
  const [jobs] = useLocalKV<Job[]>(`jobs`, [])
  
  return useMemo(() => {
    return getCallerHistorySync(callerPhone, contractorId, jobs || [])
  }, [callerPhone, contractorId, jobs])
}

/**
 * Get caller history for context-aware conversations
 * This is a pure function that works with job data
 * NOTE: For use in components, prefer useCallerHistory hook
 */
export function getCallerHistorySync(
  callerPhone: string,
  contractorId: string,
  allJobs: Job[]
): {
  isReturning: boolean
  recentJobs: Job[]
  lastInteraction?: string
} {
  // Match by phone number in metadata
  const callerJobs = allJobs.filter((job) => {
    if (job.contractorId !== contractorId) return false
    if (!job.metadata?.callerPhone) return false
    return normalizePhone(job.metadata.callerPhone) === normalizePhone(callerPhone)
  })

  // Sort by date, get last 5
  const recentJobs = callerJobs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const isReturning = recentJobs.length > 0
  const lastInteraction = isReturning ? recentJobs[0].createdAt : undefined

  return {
    isReturning,
    recentJobs,
    lastInteraction
  }
}

/**
 * Normalize phone number for matching
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
