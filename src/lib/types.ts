export type UserRole = 'homeowner' | 'contractor' | 'operator'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  territoryId?: number
  isPro: boolean
  proSince?: string
  performanceScore: number
  bidAccuracy: number
  isOperator: boolean
  createdAt: string
  referralCode?: string
  referredBy?: string
  referralEarnings: number
  contractorInviteCount: number
  companyLogo?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  taxId?: string
  averageResponseTimeMinutes?: number
  winRate?: number
  feesAvoided?: number
  availableNow?: boolean
  availableNowSince?: string
}

export type JobSize = 'small' | 'medium' | 'large'
export type JobTier = 'QUICK_FIX' | 'STANDARD' | 'MAJOR_PROJECT'

export interface Job {
  id: string
  homeownerId: string
  contractorId?: string // For private jobs from AI Receptionist
  title: string
  description: string
  mediaUrl?: string
  mediaType?: 'audio' | 'photo'
  photos?: string[]
  aiScope: {
    scope: string
    priceLow: number
    priceHigh: number
    materials: string[]
    confidenceScore?: number
    detectedObjects?: string[]
    suggestedTitle?: string
  }
  size: JobSize
  tier?: JobTier
  estimatedDays?: number
  tradesRequired?: string[]
  permitRequired?: boolean
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  territoryId?: number
  createdAt: string
  postedInSeconds?: number
  bids: Bid[]
  scopeChanges?: ScopeChange[]
  beforePhotos?: string[]
  afterPhotos?: string[]
  milestones?: Milestone[]
  preferredStartDate?: string
  depositPercentage?: number
  tradeContractors?: TradeContractor[]
  projectUpdates?: ProjectUpdate[]
  projectSchedule?: ProjectSchedule
  multiTrade?: boolean
  isUrgent?: boolean
  urgentDeadline?: string
  bundledTasks?: BundledTask[]
  questions?: Question[]
  viewingContractors?: string[] // Array of contractor IDs currently viewing this job
  // AI Receptionist fields
  isPrivate?: boolean // Private job (bypasses marketplace)
  source?: 'ai_receptionist' | 'marketplace' | 'direct'
  metadata?: {
    callId?: string
    callerPhone?: string
    callerName?: string
    transcript?: string
    recordingUrl?: string
    urgency?: 'low' | 'medium' | 'high' | 'emergency'
    estimatedScope?: string
  }
}

export interface Bid {
  id: string
  jobId: string
  contractorId: string
  contractorName: string
  amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  responseTimeMinutes?: number
  isLightningBid?: boolean
  selectedTimeSlot?: string
}

export interface BundledTask {
  id: string
  title: string
  description: string
  estimatedCost: number
}

export interface Question {
  id: string
  jobId: string
  contractorId: string
  contractorName: string
  question: string
  answer?: string
  answeredAt?: string
  createdAt: string
}

export interface TimeSlot {
  id: string
  contractorId: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  jobId?: string
  createdAt: string
}

export interface ScopeChange {
  id: string
  jobId: string
  discoveredAt: string
  description: string
  photos: string[]
  voiceNote?: string
  additionalCost: number
  status: 'pending' | 'approved' | 'rejected'
  approvedAt?: string
}

export interface MilestoneExpense {
  id: string
  milestoneId: string
  category: 'materials' | 'labor' | 'equipment' | 'permits' | 'travel' | 'other'
  description: string
  amount: number
  quantity?: number
  unitCost?: number
  vendor?: string
  receiptPhoto?: string
  date: string
  paidBy?: string
  notes?: string
}

export interface Milestone {
  id: string
  jobId: string
  name: string
  description: string
  amount: number
  percentage: number
  sequence: number
  status: 'pending' | 'in-progress' | 'completed' | 'paid' | 'disputed'
  verificationRequired: 'photos' | 'inspection' | 'walkthrough'
  photos?: string[]
  notes?: string
  requestedAt?: string
  approvedAt?: string
  paidAt?: string
  disputeReason?: string
  tradeId?: string
  dependencies?: string[]
  estimatedStartDate?: string
  estimatedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  expenses?: MilestoneExpense[]
}

export interface TradeContractor {
  id: string
  jobId: string
  contractorId: string
  contractorName: string
  trade: string
  role: 'lead' | 'sub'
  status: 'invited' | 'accepted' | 'active' | 'completed'
  assignedMilestones: string[]
  totalAmount: number
  amountPaid: number
  contactPhone?: string
  contactEmail?: string
  notes?: string
  invitedAt: string
  acceptedAt?: string
  completedAt?: string
}

export interface ProjectUpdate {
  id: string
  jobId: string
  contractorId: string
  contractorName: string
  tradeId?: string
  type: 'progress' | 'issue' | 'milestone' | 'general'
  title: string
  description: string
  photos?: string[]
  createdAt: string
  visibility: 'all' | 'homeowner' | 'contractors'
}

export interface TradeSequence {
  id: string
  name: string
  order: number
  estimatedDays: number
  dependencies: string[]
  criticalPath: boolean
}

export interface ProjectSchedule {
  jobId: string
  projectStartDate: string
  projectEndDate: string
  tradeSequences: TradeSequence[]
  currentPhase: string
  daysElapsed: number
  daysRemaining: number
  onTrack: boolean
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  rate: number
  total: number
}

export interface Invoice {
  id: string
  contractorId: string
  homeownerId?: string
  jobId: string
  jobTitle: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'partially-paid'
  dueDate: string
  sentDate?: string
  paidDate?: string
  reminderSentAt?: string
  lateFeeApplied: boolean
  isProForma: boolean
  isRecurring?: boolean
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly'
  nextRecurringDate?: string
  partialPayments?: PartialPayment[]
  amountPaid?: number
  amountRemaining?: number
  createdAt: string
  useCompanyLogo?: boolean
  customNotes?: string
}

export interface PartialPayment {
  id: string
  amount: number
  paidAt: string
  method?: string
  stripePaymentIntentId?: string
}

export interface CompanyInvoice {
  id: string
  contractorId: string
  period: string
  lineItems: {
    description: string
    amount: number
  }[]
  total: number
  status: 'pending' | 'paid' | 'failed'
  autoCharge: boolean
  chargeDate: string
  createdAt: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'ach'
  isDefault: boolean
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  bankAccount?: {
    bankName: string
    last4: string
    accountType: 'checking' | 'savings'
  }
  createdAt: string
}

export interface StripePayment {
  id: string
  stripePaymentIntentId: string
  amount: number
  platformFee: number
  stripeFee: number
  netAmount: number
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  paymentMethodId: string
  jobId: string
  milestoneId?: string
  homeownerId: string
  contractorId: string
  createdAt: string
  processedAt?: string
  failureReason?: string
}

export interface ContractorPayout {
  id: string
  contractorId: string
  amount: number
  fee: number
  netAmount: number
  type: 'instant' | 'standard'
  status: 'pending' | 'processing' | 'paid' | 'failed'
  bankAccountId: string
  initiatedAt: string
  processedAt?: string
  expectedArrival?: string
  failureReason?: string
}

export interface BankAccount {
  id: string
  userId: string
  accountType: 'checking' | 'savings'
  last4: string
  routingNumberLast4: string
  bankName?: string
  verified: boolean
  isDefault: boolean
  createdAt: string
  verifiedAt?: string
}

export interface Territory {
  id: number
  countyName: string
  operatorId?: string
  operatorName?: string
  status: 'available' | 'claimed'
}

export function calculateJobSize(priceHigh: number): JobSize {
  if (priceHigh <= 300) return 'small'
  if (priceHigh <= 1500) return 'medium'
  return 'large'
}

export function getJobSizeEmoji(size: JobSize): string {
  switch (size) {
    case 'small': return '🟢'
    case 'medium': return '🟡'
    case 'large': return '🔴'
  }
}

export function getJobSizeLabel(size: JobSize): string {
  switch (size) {
    case 'small': return 'Small'
    case 'medium': return 'Medium'
    case 'large': return 'Large'
  }
}

export type CRMCustomerStatus = 'lead' | 'active' | 'completed' | 'advocate'
export type CRMCustomerSource = 'bid' | 'manual_invite' | 'referral'

export interface CRMCustomer {
  id: string
  contractorId: string
  name: string
  email?: string
  phone?: string
  invitedVia: 'email' | 'sms'
  invitedAt: string
  status: CRMCustomerStatus
  source: CRMCustomerSource
  lifetimeValue: number
  lastContact: string
  tags: string[]
  notes?: string
  createdAt: string
}

export interface CRMInteraction {
  id: string
  customerId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'bid' | 'payment'
  title: string
  description?: string
  date: string
  outcome?: 'positive' | 'neutral' | 'negative'
  nextAction?: string
  nextActionDate?: string
}

export interface FollowUpSequence {
  id: string
  contractorId: string
  name: string
  steps: FollowUpStep[]
  active: boolean
  createdAt: string
}

export interface FollowUpStep {
  id: string
  day: number
  action: 'sms' | 'email'
  message: string
  delay: string
}

export interface ScheduledFollowUp {
  id: string
  customerId: string
  sequenceId: string
  stepId: string
  scheduledFor: string
  status: 'pending' | 'sent' | 'paused' | 'completed'
  createdAt: string
}

export interface ReferralCode {
  id: string
  code: string
  ownerId: string
  ownerName: string
  discount: number
  earnings: number
  usedBy: string[]
  createdAt: string
}

export interface ContractorReferral {
  id: string
  referrerId: string
  referrerName: string
  refereeId?: string
  refereeName: string
  phone: string
  status: 'sent' | 'signed-up' | 'completed-first-job'
  reward: number
  createdAt: string
}

export interface InvoiceTemplate {
  id: string
  contractorId: string
  name: string
  description?: string
  lineItems: InvoiceLineItem[]
  taxRate: number
  customNotes?: string
  useCount: number
  lastUsed?: string
  createdAt: string
}

export type CertificationType = 
  | 'trade-license' 
  | 'insurance' 
  | 'background-check' 
  | 'manufacturer-cert' 
  | 'safety-training'
  | 'other'

export type CertificationStatus = 'active' | 'expiring-soon' | 'expired'

export interface Certification {
  id: string
  contractorId: string
  type: CertificationType
  name: string
  issuingOrganization: string
  licenseNumber?: string
  issueDate: string
  expirationDate?: string
  neverExpires: boolean
  fileUrl?: string
  fileName?: string
  coverageAmount?: number
  status: CertificationStatus
  notes?: string
  jobTypesQualified?: string[]
  verifiedByPlatform: boolean
  createdAt: string
  updatedAt: string
}

export interface CertificationAlert {
  certificationId: string
  daysUntilExpiration: number
  urgency: 'info' | 'warning' | 'urgent' | 'critical'
}

export function classifyJobTier(estimatedCost: number, estimatedDays: number, tradeCount: number = 1): JobTier {
  if (estimatedCost <= 500 && estimatedDays <= 1) {
    return 'QUICK_FIX'
  } else if (estimatedCost <= 5000 && tradeCount === 1) {
    return 'STANDARD'
  } else if (estimatedCost <= 50000) {
    return 'MAJOR_PROJECT'
  }
  return 'MAJOR_PROJECT'
}

export function getTierBadge(tier: JobTier): { emoji: string; label: string; range: string; color: string } {
  switch (tier) {
    case 'QUICK_FIX':
      return { emoji: '🟢', label: 'Quick Fix', range: 'Under $500', color: 'text-green-600' }
    case 'STANDARD':
      return { emoji: '🟡', label: 'Standard', range: '$500-$5K', color: 'text-yellow-600' }
    case 'MAJOR_PROJECT':
      return { emoji: '🔵', label: 'Major Project', range: '$5K-$50K', color: 'text-blue-600' }
  }
}

export function getContractorTierRequirements(tier: JobTier): {
  minJobs: number
  minRating: number
  insuranceRequired: number
  licensesRequired: boolean
  workersCompRequired: boolean
  minPortfolioPhotos: number
  minReferences: number
} {
  switch (tier) {
    case 'QUICK_FIX':
      return {
        minJobs: 0,
        minRating: 0,
        insuranceRequired: 0,
        licensesRequired: false,
        workersCompRequired: false,
        minPortfolioPhotos: 0,
        minReferences: 0
      }
    case 'STANDARD':
      return {
        minJobs: 10,
        minRating: 4.0,
        insuranceRequired: 300000,
        licensesRequired: true,
        workersCompRequired: false,
        minPortfolioPhotos: 0,
        minReferences: 0
      }
    case 'MAJOR_PROJECT':
      return {
        minJobs: 25,
        minRating: 4.5,
        insuranceRequired: 500000,
        licensesRequired: true,
        workersCompRequired: true,
        minPortfolioPhotos: 10,
        minReferences: 3
      }
  }
}

export interface BidTemplate {
  id: string
  contractorId: string
  name: string
  message: string
  useCount: number
  lastUsed?: string
  createdAt: string
}
