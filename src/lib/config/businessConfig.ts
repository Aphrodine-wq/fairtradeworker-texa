/**
 * Configuration Constants
 * Centralized configuration for business logic constants
 */

export const AI_INSIGHTS_CONFIG = {
  // Minimum number of jobs required for reliable analysis
  MIN_JOBS_FOR_ANALYSIS: 3,
  
  // Minimum margin difference to report (percentage points)
  MIN_MARGIN_DIFFERENCE: 10,
  
  // Minimum crew performance difference to report (percentage)
  MIN_CREW_PERFORMANCE_DIFFERENCE: 10,
  
  // Vendor concentration threshold (percentage)
  VENDOR_CONCENTRATION_THRESHOLD: 60,
  
  // Seasonal trend minimum increase (percentage)
  SEASONAL_TREND_MIN_INCREASE: 20
} as const

export const INVENTORY_CONFIG = {
  // Maximum jobs per crew before overload
  MAX_JOBS_PER_CREW: 3,
  
  // Default forecast period (days)
  DEFAULT_FORECAST_DAYS: 30,
  
  // Reorder point safety multiplier
  REORDER_SAFETY_MULTIPLIER: 1.5
} as const

export const SCHEDULER_CONFIG = {
  // Maximum concurrent jobs per crew
  MAX_CREW_JOBS: 3,
  
  // Default appointment duration (hours)
  DEFAULT_APPOINTMENT_DURATION: 2,
  
  // Crew confirmation timeout (minutes)
  CREW_CONFIRMATION_TIMEOUT: 30
} as const

export const FOLLOW_UP_CONFIG = {
  // Default delay for first follow-up (hours)
  DEFAULT_FIRST_FOLLOW_UP_DELAY: 1,
  
  // Maximum steps in a sequence
  MAX_SEQUENCE_STEPS: 10
} as const
