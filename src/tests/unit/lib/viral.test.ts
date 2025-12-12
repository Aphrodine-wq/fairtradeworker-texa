import { describe, it, expect } from 'vitest'
import { generateReferralCode, validateReferralCode } from '@/lib/viral'

describe('Viral Features', () => {
  describe('generateReferralCode', () => {
    it('generates a unique referral code', () => {
      const code1 = generateReferralCode('user1', 'John Doe')
      const code2 = generateReferralCode('user2', 'Jane Smith')
      
      expect(code1).toBeTruthy()
      expect(code2).toBeTruthy()
      expect(code1).not.toBe(code2)
    })

    it('generates code with correct format', () => {
      const code = generateReferralCode('user123', 'John Doe')
      
      // Code should contain initials and be uppercase
      expect(code).toMatch(/[A-Z]+/)
      expect(code.length).toBeGreaterThan(5)
    })

    it('handles names without spaces', () => {
      const code = generateReferralCode('user123', 'Madonna')
      
      expect(code).toBeTruthy()
      expect(code.length).toBeGreaterThan(0)
    })
  })

  describe('validateReferralCode', () => {
    it('validates correct referral code format', () => {
      const validCode = 'JD-ABC123'
      expect(validateReferralCode(validCode)).toBe(true)
    })

    it('rejects invalid referral codes', () => {
      expect(validateReferralCode('')).toBe(false)
      expect(validateReferralCode('abc')).toBe(false)
      expect(validateReferralCode('123')).toBe(false)
    })

    it('rejects codes that are too short', () => {
      expect(validateReferralCode('AB')).toBe(false)
    })
  })
})
