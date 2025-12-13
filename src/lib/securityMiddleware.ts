/**
 * Security Middleware for API calls and form submissions
 * Integrates security, rate limiting, and validation
 */

import { sanitizeInput, sanitizeObject, validateFile, type FileValidationResult } from './security'
import { checkRateLimit, type RateLimitResult } from './rateLimit'
import type { User } from './types'

// ============================================================================
// API Request Security Wrapper
// ============================================================================

export interface SecureRequestOptions {
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  user?: User | null
  files?: File[]
  validateRateLimit?: boolean
  sanitizeInput?: boolean
}

export interface SecureRequestResult<T> {
  success: boolean
  data?: T
  error?: string
  rateLimit?: RateLimitResult
}

/**
 * Make a secure API request with rate limiting and input sanitization
 */
export async function secureRequest<T>(
  options: SecureRequestOptions
): Promise<SecureRequestResult<T>> {
  const {
    endpoint,
    method = 'GET',
    body,
    user,
    files,
    validateRateLimit = true,
    sanitizeInput: shouldSanitize = true
  } = options

  // 1. Check rate limiting
  if (validateRateLimit) {
    const rateLimitResult = checkRateLimit(endpoint, user)
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`,
        rateLimit: rateLimitResult
      }
    }
  }

  // 2. Validate files if provided
  if (files && files.length > 0) {
    for (const file of files) {
      let fileType: 'image' | 'video' | 'document' = 'document'
      if (file.type.startsWith('image/')) fileType = 'image'
      else if (file.type.startsWith('video/')) fileType = 'video'

      const validation = validateFile(file, fileType)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid file'
        }
      }
    }
  }

  // 3. Sanitize input
  let sanitizedBody = body
  if (shouldSanitize && body) {
    if (typeof body === 'string') {
      sanitizedBody = sanitizeInput(body)
    } else if (typeof body === 'object') {
      sanitizedBody = sanitizeObject(body)
    }
  }

  // 4. Make the request
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(user && { 'X-User-ID': user.id }),
      },
      body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        error: error || `Request failed with status ${response.status}`
      }
    }

    const data = await response.json()
    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// ============================================================================
// Form Submission Security Wrapper
// ============================================================================

export interface SecureFormOptions {
  formData: FormData | Record<string, any>
  endpoint: string
  user?: User | null
  validateRateLimit?: boolean
}

/**
 * Submit a form securely with validation and rate limiting
 */
export async function secureFormSubmit<T>(
  options: SecureFormOptions
): Promise<SecureRequestResult<T>> {
  const { formData, endpoint, user, validateRateLimit = true } = options

  // Convert FormData to object if needed
  let data: Record<string, any>
  if (formData instanceof FormData) {
    data = Object.fromEntries(formData.entries())
  } else {
    data = formData
  }

  // Extract files
  const files: File[] = []
  if (formData instanceof FormData) {
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }
  }

  return secureRequest<T>({
    endpoint,
    method: 'POST',
    body: data,
    user,
    files: files.length > 0 ? files : undefined,
    validateRateLimit,
    sanitizeInput: true
  })
}

// ============================================================================
// React Hook for Secure Requests
// ============================================================================

import { useState, useCallback } from 'react'

export function useSecureRequest<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (options: SecureRequestOptions) => {
    setLoading(true)
    setError(null)

    const result = await secureRequest<T>(options)

    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Request failed')
    }

    setLoading(false)
    return result
  }, [])

  return { execute, loading, error, data }
}

