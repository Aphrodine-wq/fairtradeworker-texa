// User types
export type UserRole = 'homeowner' | 'contractor' | 'operator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  territoryId?: number;
  isPro: boolean;
  proSince?: string;
  performanceScore: number;
  bidAccuracy: number;
  isOperator: boolean;
  createdAt: string;
  referralCode?: string;
  referredBy?: string;
  referralEarnings: number;
  contractorInviteCount: number;
  companyLogo?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  taxId?: string;
  averageResponseTimeMinutes?: number;
  winRate?: number;
  feesAvoided?: number;
}

// Job types
export type JobSize = 'small' | 'medium' | 'large';
export type JobTier = 'QUICK_FIX' | 'STANDARD' | 'MAJOR_PROJECT';

export interface Job {
  id: string;
  homeownerId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'audio' | 'photo';
  photos?: string[];
  aiScope: {
    scope: string;
    priceLow: number;
    priceHigh: number;
    materials: string[];
    confidenceScore?: number;
    detectedObjects?: string[];
  };
  size: JobSize;
  tier?: JobTier;
  estimatedDays?: number;
  tradesRequired?: string[];
  permitRequired?: boolean;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  territoryId?: number;
  createdAt: string;
  postedInSeconds?: number;
  bids: Bid[];
  scopeChanges?: ScopeChange[];
  beforePhotos?: string[];
  afterPhotos?: string[];
  milestones?: Milestone[];
  preferredStartDate?: string;
  depositPercentage?: number;
  tradeContractors?: TradeContractor[];
  projectUpdates?: ProjectUpdate[];
  projectSchedule?: ProjectSchedule;
  multiTrade?: boolean;
}

export interface Bid {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  responseTimeMinutes?: number;
  isLightningBid?: boolean;
}

export interface ScopeChange {
  id: string;
  jobId: string;
  discoveredAt: string;
  description: string;
  photos: string[];
  voiceNote?: string;
  additionalCost: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
}

export interface MilestoneExpense {
  id: string;
  milestoneId: string;
  category: 'materials' | 'labor' | 'equipment' | 'permits' | 'travel' | 'other';
  description: string;
  amount: number;
  quantity?: number;
  unitCost?: number;
  vendor?: string;
  receiptPhoto?: string;
  date: string;
  paidBy?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  jobId: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  sequence: number;
  status: 'pending' | 'in-progress' | 'completed' | 'paid' | 'disputed';
  verificationRequired: 'photos' | 'inspection' | 'walkthrough';
  photos?: string[];
  notes?: string;
  requestedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  disputeReason?: string;
  tradeId?: string;
  dependencies?: string[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  expenses?: MilestoneExpense[];
}

export interface TradeContractor {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  trade: string;
  role: 'lead' | 'sub';
  status: 'invited' | 'accepted' | 'active' | 'completed';
  assignedMilestones: string[];
  totalAmount: number;
  amountPaid: number;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  invitedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface ProjectUpdate {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  tradeId?: string;
  type: 'progress' | 'issue' | 'milestone' | 'general';
  title: string;
  description: string;
  photos?: string[];
  createdAt: string;
  visibility: 'all' | 'homeowner' | 'contractors';
}

export interface TradeSequence {
  id: string;
  name: string;
  order: number;
  estimatedDays: number;
  dependencies: string[];
  criticalPath: boolean;
}

export interface ProjectSchedule {
  jobId: string;
  projectStartDate: string;
  projectEndDate: string;
  tradeSequences: TradeSequence[];
  currentPhase: string;
  daysElapsed: number;
  daysRemaining: number;
  onTrack: boolean;
}

// Invoice types
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  contractorId: string;
  homeownerId?: string;
  jobId: string;
  jobTitle: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'partially-paid';
  dueDate: string;
  sentDate?: string;
  paidDate?: string;
  reminderSentAt?: string;
  lateFeeApplied: boolean;
  isProForma: boolean;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  nextRecurringDate?: string;
  partialPayments?: PartialPayment[];
  amountPaid?: number;
  amountRemaining?: number;
  createdAt: string;
  useCompanyLogo?: boolean;
  customNotes?: string;
}

export interface PartialPayment {
  id: string;
  amount: number;
  paidAt: string;
  method?: string;
  stripePaymentIntentId?: string;
}

// Territory types
export interface Territory {
  id: number;
  countyName: string;
  operatorId?: string;
  operatorName?: string;
  status: 'available' | 'claimed';
}

// CRM types
export type CRMCustomerStatus = 'lead' | 'active' | 'completed' | 'advocate';
export type CRMCustomerSource = 'bid' | 'manual_invite' | 'referral';

export interface CRMCustomer {
  id: string;
  contractorId: string;
  name: string;
  email?: string;
  phone?: string;
  invitedVia: 'email' | 'sms';
  invitedAt: string;
  status: CRMCustomerStatus;
  source: CRMCustomerSource;
  lifetimeValue: number;
  lastContact: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// Referral types
export interface ReferralCode {
  id: string;
  code: string;
  ownerId: string;
  ownerName: string;
  discount: number;
  earnings: number;
  usedBy: string[];
  createdAt: string;
}

export interface ContractorReferral {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId?: string;
  refereeName: string;
  phone: string;
  status: 'sent' | 'signed-up' | 'completed-first-job';
  reward: number;
  createdAt: string;
}

// Utility functions
export function calculateJobSize(priceHigh: number): JobSize {
  if (priceHigh <= 300) return 'small';
  if (priceHigh <= 1500) return 'medium';
  return 'large';
}

export function getJobSizeEmoji(size: JobSize): string {
  switch (size) {
    case 'small': return '🟢';
    case 'medium': return '🟡';
    case 'large': return '🔴';
  }
}

export function getJobSizeLabel(size: JobSize): string {
  switch (size) {
    case 'small': return 'Small';
    case 'medium': return 'Medium';
    case 'large': return 'Large';
  }
}

export function classifyJobTier(estimatedCost: number, estimatedDays: number, tradeCount: number = 1): JobTier {
  if (estimatedCost <= 500 && estimatedDays <= 1) {
    return 'QUICK_FIX';
  } else if (estimatedCost <= 5000 && tradeCount === 1) {
    return 'STANDARD';
  } else if (estimatedCost <= 50000) {
    return 'MAJOR_PROJECT';
  }
  return 'MAJOR_PROJECT';
}

export function getTierBadge(tier: JobTier): { emoji: string; label: string; range: string; color: string } {
  switch (tier) {
    case 'QUICK_FIX':
      return { emoji: '🟢', label: 'Quick Fix', range: 'Under $500', color: '#16a34a' };
    case 'STANDARD':
      return { emoji: '🟡', label: 'Standard', range: '$500-$5K', color: '#ca8a04' };
    case 'MAJOR_PROJECT':
      return { emoji: '🔵', label: 'Major Project', range: '$5K-$50K', color: '#2563eb' };
  }
}
