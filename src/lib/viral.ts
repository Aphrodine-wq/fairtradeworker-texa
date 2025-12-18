export function generateReferralCode(userName: string, userId: string): string {
  const namePrefix = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  const userHash = userId.slice(-4).toUpperCase()
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase()
  
  return `${namePrefix}${userHash}${randomSuffix}`
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function calculateJobToFirstBidTime(jobCreatedAt: string, firstBidCreatedAt?: string): number {
  if (!firstBidCreatedAt) return 0
  const jobTime = new Date(jobCreatedAt).getTime()
  const bidTime = new Date(firstBidCreatedAt).getTime()
  return Math.round((bidTime - jobTime) / 1000 / 60)
}

/**
 * Validate referral code format
 * Format: XX-ABC123 (2-4 letter prefix, dash, 3-6 alphanumeric)
 */
export function validateReferralCode(code: string): boolean {
  if (!code || code.length < 6) return false
  // Check for format: letters-dash-alphanumeric
  const pattern = /^[A-Z]{2,4}-[A-Z0-9]{3,6}$/i
  return pattern.test(code)
}
