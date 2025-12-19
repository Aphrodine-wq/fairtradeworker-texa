/**
 * VOID Store Validation Utilities
 * Runtime type checking and validation for store state
 */

import { z } from 'zod'

// Grid position validation
export const GridPositionSchema = z.object({
  row: z.number().int().min(0).max(400),
  col: z.number().int().min(0).max(400),
})

// Icon data validation
export const IconDataSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(100),
  icon: z.function(),
  pinned: z.boolean(),
  type: z.enum(['folder', 'tool', 'system']),
  menuId: z.string().min(1).max(100).optional(),
  position: GridPositionSchema,
  gridSize: z.object({
    row: z.number().int().min(1).max(10),
    col: z.number().int().min(1).max(10),
  }).optional(),
})

// Window data validation
export const WindowDataSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  menuId: z.string().min(1).max(100),
  position: z.object({
    x: z.number().min(0).max(10000),
    y: z.number().min(0).max(10000),
  }),
  size: z.object({
    width: z.number().min(200).max(10000),
    height: z.number().min(200).max(10000),
  }),
  minimized: z.boolean(),
  maximized: z.boolean(),
  zIndex: z.number().int().min(0),
  content: z.any().nullable(),
})

// Theme validation
export const ThemeSchema = z.enum(['dark', 'light'])

// Voice state validation
export const VoiceStateSchema = z.enum(['idle', 'recording', 'processing', 'error'])
export const VoicePermissionSchema = z.enum(['granted', 'denied', 'prompt'])

// Buddy state validation
export const BuddyStateSchema = z.object({
  collapsed: z.boolean(),
  position: z.union([
    z.string(),
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ]),
  docked: z.boolean(),
  lastMessageTime: z.number().int().min(0),
  emotion: z.enum(['neutral', 'happy', 'thinking', 'excited', 'error']),
})

// Buddy message validation
export const BuddyMessageSchema = z.object({
  id: z.string(),
  message: z.string().max(1000),
  timestamp: z.number().int().min(0),
  type: z.enum(['info', 'warning', 'error', 'success']).optional(),
})

// Store state validation schema
export const VoidStoreSchema = z.object({
  icons: z.array(IconDataSchema),
  iconPositions: z.record(z.string(), GridPositionSchema),
  pinnedIcons: z.instanceof(Set).or(z.array(z.string())),
  iconUsage: z.record(z.string(), z.number().int().min(0)),
  windows: z.array(WindowDataSchema),
  activeWindowId: z.string().nullable(),
  nextZIndex: z.number().int().min(0),
  sortOption: z.enum(['name', 'date', 'usage']).nullable(),
  theme: ThemeSchema,
  desktopBackground: z.string().url().nullable().or(z.literal('')),
  wiremapEnabled: z.boolean(),
  wiremapNodeCount: z.number().int().min(1).max(200),
  currentTrack: z.any().nullable(),
  isPlaying: z.boolean(),
  volume: z.number().min(0).max(1),
  isMuted: z.boolean(),
  voiceState: VoiceStateSchema,
  voicePermission: VoicePermissionSchema,
  voiceRecording: z.any().nullable(),
  voiceTranscript: z.string().max(10000),
  extractedEntities: z.any().nullable(),
  buddyState: BuddyStateSchema,
  buddyMessages: z.array(BuddyMessageSchema),
})

/**
 * Validate and sanitize a value with a schema, returning a safe default on failure
 */
export function validateWithFallback<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  fallback: T,
  logError = true
): T {
  try {
    const result = schema.safeParse(value)
    if (result.success) {
      return result.data
    }
    if (logError) {
      console.warn('[VOID Validation] Validation failed, using fallback:', result.error.errors)
    }
    return fallback
  } catch (error) {
    if (logError) {
      console.error('[VOID Validation] Validation error:', error)
    }
    return fallback
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength)
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return 'unnamed'
  }
  
  // Remove path separators and dangerous characters
  let sanitized = fileName
    .replace(/[\/\\\?\*\|"<>:]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '')
    .slice(0, 255)
    .trim()
  
  // Ensure it's not empty
  if (!sanitized) {
    sanitized = 'unnamed'
  }
  
  return sanitized
}

/**
 * Validate grid position
 */
export function validateGridPosition(position: unknown): { row: number; col: number } | null {
  const result = GridPositionSchema.safeParse(position)
  if (result.success) {
    return result.data
  }
  return null
}

/**
 * Validate window dimensions
 */
export function validateWindowSize(size: unknown): { width: number; height: number } | null {
  if (typeof size !== 'object' || size === null) {
    return null
  }
  
  const s = size as any
  const width = typeof s.width === 'number' ? Math.max(200, Math.min(10000, s.width)) : 800
  const height = typeof s.height === 'number' ? Math.max(200, Math.min(10000, s.height)) : 600
  
  return { width, height }
}

/**
 * Validate volume level
 */
export function validateVolume(volume: unknown): number {
  if (typeof volume !== 'number') {
    return 0.7
  }
  return Math.max(0, Math.min(1, volume))
}

/**
 * Type guard for Set
 */
export function isSet(value: unknown): value is Set<string> {
  return value instanceof Set
}

/**
 * Convert array to Set safely
 */
export function arrayToSet(value: unknown): Set<string> {
  if (isSet(value)) {
    return value
  }
  if (Array.isArray(value)) {
    return new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))
  }
  return new Set<string>()
}
