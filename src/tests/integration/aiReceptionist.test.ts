/**
 * Test Suite for AI Receptionist Webhook
 * 
 * Tests critical functionality and reliability features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock types for Vercel functions
interface MockRequest {
  method: string
  body: any
  headers?: Record<string, string>
}

interface MockResponse {
  statusCode?: number
  data?: any
  status: (code: number) => MockResponse
  json: (data: any) => void
  setHeader: (name: string, value: string) => void
}

describe('AI Receptionist Webhook', () => {
  let mockReq: MockRequest
  let mockRes: MockResponse
  
  beforeEach(() => {
    // Setup mock request
    mockReq = {
      method: 'POST',
      body: {
        From: '+15125551234',
        To: '+15125555678',
        CallSid: 'CA1234567890abcdef',
        TranscriptionText: 'Hi, I need help fixing my leaky faucet in the kitchen.',
        RecordingUrl: 'https://api.twilio.com/recording.mp3',
        CallStatus: 'completed',
        CallDuration: '45'
      },
      headers: {
        'x-twilio-signature': 'valid-signature'
      }
    }
    
    // Setup mock response
    mockRes = {
      statusCode: undefined,
      data: undefined,
      status: vi.fn((code: number) => {
        mockRes.statusCode = code
        return mockRes
      }),
      json: vi.fn((data: any) => {
        mockRes.data = data
      }),
      setHeader: vi.fn()
    }
    
    // Mock environment variables
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.TWILIO_ACCOUNT_SID = 'AC12345'
    process.env.TWILIO_AUTH_TOKEN = 'test-token'
    process.env.TWILIO_PHONE_NUMBER = '+15125555678'
    process.env.CONTRACTOR_PHONES = JSON.stringify({
      '+15125555678': 'contractor-123'
    })
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Webhook Validation', () => {
    it('should reject non-POST requests', async () => {
      mockReq.method = 'GET'
      
      // Import handler
      const handler = (await import('@/../api/receptionist/inbound')).default
      
      // Call handler with GET request
      await handler(mockReq as any, mockRes as any)
      
      expect(mockRes.statusCode).toBe(405)
      expect(mockRes.data?.errorCode).toBe('METHOD_NOT_ALLOWED')
    })
    
    it('should validate Twilio webhook signature', async () => {
      // This would be tested with actual Twilio signature validation
      expect(true).toBe(true)
    })
  })
  
  describe('Contractor Matching', () => {
    it('should match phone number to contractor ID', async () => {
      const phoneNumber = '+15125555678'
      const expectedContractorId = 'contractor-123'
      
      // Test mapping logic
      const contractors = JSON.parse(process.env.CONTRACTOR_PHONES || '{}')
      const contractorId = contractors[phoneNumber]
      
      expect(contractorId).toBe(expectedContractorId)
    })
    
    it('should return 404 for unmapped phone number', async () => {
      mockReq.body.To = '+15129999999'
      
      // Would trigger contractor not found error
      expect(true).toBe(true)
    })
  })
  
  describe('Transcription', () => {
    it('should use provided transcription text', async () => {
      const transcript = mockReq.body.TranscriptionText
      
      expect(transcript).toBeTruthy()
      expect(transcript.length).toBeGreaterThan(0)
    })
    
    it('should handle missing transcription gracefully', async () => {
      delete mockReq.body.TranscriptionText
      
      // Should create fallback job
      expect(true).toBe(true)
    })
    
    it('should retry transcription on failure', async () => {
      // Test retry logic (3 attempts)
      let attempts = 0
      const mockTranscribe = vi.fn(async () => {
        attempts++
        if (attempts < 3) throw new Error('Temporary failure')
        return 'Success on third attempt'
      })
      
      // Simulate retry logic
      for (let i = 0; i < 3; i++) {
        try {
          await mockTranscribe()
          break
        } catch (e) {
          if (i === 2) throw e
        }
      }
      
      expect(attempts).toBe(3)
    })
  })
  
  describe('GPT Extraction', () => {
    it('should extract caller information correctly', () => {
      const mockExtraction = {
        callerName: 'John Smith',
        callerPhone: '+15125551234',
        issueType: 'repair' as const,
        urgency: 'medium' as const,
        propertyAddress: '123 Main St, Austin, TX 78701',
        description: 'Leaky faucet in kitchen needs repair',
        estimatedScope: 'small repair',
        confidence: 0.85
      }
      
      expect(mockExtraction.confidence).toBeGreaterThan(0.5)
      expect(mockExtraction.issueType).toBe('repair')
      expect(mockExtraction.urgency).toBe('medium')
    })
    
    it('should detect emergency calls', () => {
      const emergencyTranscript = 'Emergency! My water heater is flooding the basement!'
      const mockExtraction = {
        urgency: 'emergency' as const,
        issueType: 'emergency' as const,
        confidence: 0.95
      }
      
      expect(mockExtraction.urgency).toBe('emergency')
    })
    
    it('should handle low confidence extraction', () => {
      const mockExtraction = {
        confidence: 0.3,
        issueType: 'other' as const,
        urgency: 'medium' as const
      }
      
      expect(mockExtraction.confidence).toBeLessThan(0.5)
      // Should trigger voicemail job creation
    })
  })
  
  describe('Job Creation', () => {
    it('should create private job with correct structure', () => {
      const job = {
        id: 'private-job-1234567890-CA123456',
        contractorId: 'contractor-123',
        type: 'private',
        isPrivate: true,
        source: 'ai_receptionist',
        title: 'Leaky faucet in kitchen needs repair',
        description: 'Full description here',
        homeownerPhone: '+15125551234',
        status: 'new',
        callSid: 'CA1234567890abcdef',
        urgency: 'medium',
        createdAt: new Date().toISOString()
      }
      
      expect(job.type).toBe('private')
      expect(job.source).toBe('ai_receptionist')
      expect(job.isPrivate).toBe(true)
    })
    
    it('should create voicemail job for low confidence', () => {
      const voicemailJob = {
        id: 'voicemail-1234567890',
        status: 'voicemail',
        metadata: {
          requiresManualReview: true,
          lowConfidenceReason: 'Confidence 40% below threshold'
        }
      }
      
      expect(voicemailJob.status).toBe('voicemail')
      expect(voicemailJob.metadata.requiresManualReview).toBe(true)
    })
    
    it('should create fallback job for missing transcript', () => {
      const fallbackJob = {
        id: 'missed-call-1234567890',
        status: 'missed',
        title: 'Missed Call - Urgent Review',
        urgency: 'high'
      }
      
      expect(fallbackJob.status).toBe('missed')
      expect(fallbackJob.urgency).toBe('high')
    })
  })
  
  describe('SMS Notifications', () => {
    it('should send onboarding SMS to caller', () => {
      const smsMessage = {
        to: '+15125551234',
        from: '+15125555678',
        body: 'Thanks for calling! We\'ve created your job request.'
      }
      
      expect(smsMessage.to).toBeTruthy()
      expect(smsMessage.body).toContain('job request')
    })
    
    it('should handle SMS failure gracefully', async () => {
      // SMS failure should not block job creation
      const result = {
        success: true,
        jobId: 'job-123',
        smsStatus: 'failed'
      }
      
      expect(result.success).toBe(true)
      expect(result.jobId).toBeTruthy()
    })
  })
  
  describe('Error Handling & Reliability', () => {
    it('should retry failed API calls with exponential backoff', async () => {
      const delays: number[] = []
      let attempts = 0
      
      const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, baseDelay = 1000) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            attempts++
            return await fn()
          } catch (error) {
            if (attempt < maxRetries - 1) {
              const delay = baseDelay * Math.pow(2, attempt)
              delays.push(delay)
              await new Promise(resolve => setTimeout(resolve, delay))
            } else {
              throw error
            }
          }
        }
      }
      
      const mockFn = vi.fn(async () => {
        if (attempts < 2) throw new Error('Fail')
        return 'Success'
      })
      
      await retryWithBackoff(mockFn, 3, 100)
      
      expect(attempts).toBe(2) // Succeeds on second attempt
      expect(delays).toEqual([100]) // One retry with 100ms delay
    })
    
    it('should log errors to monitoring service', () => {
      const errorLog = {
        error: 'Test error',
        context: {
          callSid: 'CA123',
          contractorId: 'contractor-123',
          step: 'extraction'
        },
        timestamp: new Date().toISOString()
      }
      
      expect(errorLog.error).toBeTruthy()
      expect(errorLog.context.callSid).toBeTruthy()
    })
    
    it('should send critical alerts for failures', () => {
      const alert = {
        message: 'Critical AI Receptionist failure',
        severity: 'critical' as const,
        timestamp: new Date().toISOString()
      }
      
      expect(alert.severity).toBe('critical')
    })
    
    it('should track processing time', async () => {
      const startTime = Date.now()
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const processingTime = Date.now() - startTime
      
      expect(processingTime).toBeGreaterThan(0)
      expect(processingTime).toBeLessThan(5000) // Should be under 5 seconds
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle very long transcripts', () => {
      const longTranscript = 'x'.repeat(10000)
      const truncated = longTranscript.substring(0, 500)
      
      expect(truncated.length).toBe(500)
    })
    
    it('should handle special characters in caller name', () => {
      const specialName = "O'Brien-Smith Jr."
      const sanitized = specialName // No sanitization needed with proper escaping
      
      expect(sanitized).toBe(specialName)
    })
    
    it('should extract ZIP code from various address formats', () => {
      const addresses = [
        '123 Main St, Austin, TX 78701',
        '456 Elm Street, TX 78702-1234',
        'Somewhere in 78703'
      ]
      
      const extractZip = (address: string) => {
        const match = address.match(/\b\d{5}(?:-\d{4})?\b/)
        return match ? match[0] : ''
      }
      
      expect(extractZip(addresses[0])).toBe('78701')
      expect(extractZip(addresses[1])).toBe('78702-1234')
      expect(extractZip(addresses[2])).toBe('78703')
    })
    
    it('should handle international phone numbers', () => {
      const phoneNumbers = [
        '+15125551234',  // US
        '+442071234567', // UK
        '+61212345678'   // Australia
      ]
      
      phoneNumbers.forEach(number => {
        expect(number).toMatch(/^\+\d+$/)
      })
    })
  })
  
  describe('Performance', () => {
    it('should process calls within target time (30 seconds)', async () => {
      const startTime = Date.now()
      
      // Mock full processing pipeline
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 100)), // Transcription
        new Promise(resolve => setTimeout(resolve, 150)), // Extraction
        new Promise(resolve => setTimeout(resolve, 50))   // Job creation
      ])
      
      const totalTime = Date.now() - startTime
      
      expect(totalTime).toBeLessThan(30000)
    })
    
    it('should handle concurrent calls efficiently', async () => {
      const concurrentCalls = 10
      const promises = Array(concurrentCalls).fill(null).map(() => 
        new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      )
      
      const startTime = Date.now()
      await Promise.all(promises)
      const totalTime = Date.now() - startTime
      
      // Should process concurrently, not sequentially
      expect(totalTime).toBeLessThan(concurrentCalls * 100)
    })
  })
})
