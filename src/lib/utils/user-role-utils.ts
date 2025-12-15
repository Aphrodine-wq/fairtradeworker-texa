import type { User } from "@/lib/types"

/**
 * Promotes a contractor to operator role while preserving all contractor information.
 * This ensures that when someone is promoted to an operator, they keep their
 * personal information from their Contractor Account.
 * 
 * @param contractor - The contractor user to promote
 * @returns A new user object with operator role but all contractor fields preserved
 */
export function promoteContractorToOperator(contractor: User): User {
  if (contractor.role !== 'contractor') {
    throw new Error('User must be a contractor to be promoted to operator')
  }

  return {
    ...contractor,
    role: 'operator',
    isOperator: true,
    // Preserve all contractor-specific fields
    companyName: contractor.companyName,
    companyAddress: contractor.companyAddress,
    companyPhone: contractor.companyPhone,
    companyEmail: contractor.companyEmail,
    taxId: contractor.taxId,
    companyLogo: contractor.companyLogo,
    // Preserve performance metrics
    performanceScore: contractor.performanceScore,
    bidAccuracy: contractor.bidAccuracy,
    // Preserve referral data
    referralEarnings: contractor.referralEarnings,
    contractorInviteCount: contractor.contractorInviteCount,
    // Preserve territory if assigned
    territoryId: contractor.territoryId,
  }
}

/**
 * Checks if a user can be promoted to operator
 */
export function canPromoteToOperator(user: User): boolean {
  return user.role === 'contractor' && !user.isOperator
}
