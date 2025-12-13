/**
 * Security Utilities for FairTradeWorker
 * Handles input validation, sanitization, XSS protection, and security headers
 */

import { z } from 'zod'

// ============================================================================
// Input Validation Schemas
// ============================================================================

export const JobPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description must be less than 5000 characters'),
  photos: z.array(z.string().url('Invalid photo URL')).max(20, 'Maximum 20 photos allowed').optional(),
  mediaUrl: z.string().url('Invalid media URL').optional(),
  territoryId: z.number().int().min(1).max(254).optional(),
  preferredStartDate: z.string().datetime().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
})

export const BidSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number().positive('Amount must be positive').max(10000000, 'Amount too large'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
  selectedTimeSlot: z.string().optional(),
})

export const InvoiceSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  customerId: z.string().uuid('Invalid customer ID'),
  amount: z.number().positive('Amount must be positive').max(10000000, 'Amount too large'),
  description: z.string().min(10).max(2000).optional(),
  dueDate: z.string().datetime(),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).optional(),
})

export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  role: z.enum(['homeowner', 'contractor', 'operator']),
  companyName: z.string().max(200).optional(),
  companyPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  companyEmail: z.string().email().optional(),
})

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove dangerous characters
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script>/gi, '')
    .replace(/<iframe/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed/gi, '')
    .replace(/data:/gi, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>]
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>]
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      ) as T[Extract<keyof T, string>]
    }
  }
  
  return sanitized
}

// ============================================================================
// Security Headers
// ============================================================================

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Vite dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://api.openai.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
}

// ============================================================================
// File Upload Security
// ============================================================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
const MAX_FILE_SIZE = 150 * 1024 * 1024 // 150MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB per image

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File, type: 'image' | 'video' | 'document'): FileValidationResult {
  // Check file size
  const maxSize = type === 'video' ? MAX_FILE_SIZE : type === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  let allowedTypes: string[]
  switch (type) {
    case 'image':
      allowedTypes = ALLOWED_IMAGE_TYPES
      break
    case 'video':
      allowedTypes = ALLOWED_VIDEO_TYPES
      break
    case 'document':
      allowedTypes = ALLOWED_DOCUMENT_TYPES
      break
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase()
  const extensionMap: Record<string, string[]> = {
    'jpg': ['image/jpeg', 'image/jpg'],
    'jpeg': ['image/jpeg', 'image/jpg'],
    'png': ['image/png'],
    'webp': ['image/webp'],
    'mp4': ['video/mp4'],
    'webm': ['video/webm'],
    'mov': ['video/quicktime'],
    'pdf': ['application/pdf'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'txt': ['text/plain'],
  }

  if (extension && extensionMap[extension]) {
    if (!extensionMap[extension].includes(file.type)) {
      return {
        valid: false,
        error: 'File extension does not match file type'
      }
    }
  }

  return { valid: true }
}

// ============================================================================
// URL Validation
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function sanitizeUrl(url: string): string {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL')
  }
  
  const parsed = new URL(url)
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed')
  }
  
  return parsed.toString()
}

// ============================================================================
// CSRF Protection
// ============================================================================

let csrfToken: string | null = null

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  return csrfToken
}

export function validateCSRFToken(token: string): boolean {
  return csrfToken !== null && token === csrfToken
}

// ============================================================================
// Password Security (for future use)
// ============================================================================

export function validatePasswordStrength(password: string): {
  valid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Password must be at least 8 characters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Password must contain lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Password must contain uppercase letters')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Password must contain numbers')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Password should contain special characters')

  if (password.length >= 12) score += 1

  return {
    valid: score >= 4,
    score,
    feedback: feedback.length > 0 ? feedback : ['Password is strong']
  }
}

// ============================================================================
// Rate Limiting Helpers (Client-side)
// ============================================================================

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const rateLimitStore: RateLimitStore = {}

export function checkClientRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore[key]

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + windowMs
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt
  }
}

// ============================================================================
// Error Handling
// ============================================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export function handleSecurityError(error: unknown): {
  message: string
  code: string
  statusCode: number
} {
  if (error instanceof SecurityError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  if (error instanceof z.ZodError) {
    return {
      message: error.errors.map(e => e.message).join(', '),
      code: 'VALIDATION_ERROR',
      statusCode: 400
    }
  }

  return {
    message: 'An unexpected security error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

