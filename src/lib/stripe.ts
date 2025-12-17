import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key')
  }
  return stripePromise
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
}

export interface StripeCustomer {
  id: string
  email: string
  name: string
  paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'ach'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  bankAccount?: {
    bankName: string
    last4: string
  }
}

export interface StripePaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

export const STRIPE_FEE_PERCENTAGE = 0.029
export const STRIPE_FEE_FIXED = 0.30

// Subscription pricing constants - single source of truth
export const CONTRACTOR_PRO_PRICE = 59
export const CONTRACTOR_PRO_LABEL = "$59/mo"
export const HOMEOWNER_PRO_PRICE = 25
export const HOMEOWNER_PRO_LABEL = "$25/mo"

export function calculateStripeFee(amount: number): number {
  return (amount * STRIPE_FEE_PERCENTAGE) + STRIPE_FEE_FIXED
}

export function calculateNetAmount(amount: number): number {
  return amount - calculateStripeFee(amount)
}

export const PLATFORM_FEE_TIERS = {
  QUICK_FIX: { 
    type: 'flat' as const, 
    amount: 15,
    minPercentage: 0.04 
  },
  STANDARD: { 
    type: 'percentage' as const, 
    percentage: 0.03 
  },
  MAJOR_PROJECT: { 
    type: 'percentage' as const, 
    percentage: 0.025 
  }
}

export function calculatePlatformFee(amount: number, tier: keyof typeof PLATFORM_FEE_TIERS): number {
  const feeConfig = PLATFORM_FEE_TIERS[tier]
  
  if (feeConfig.type === 'flat') {
    const percentageFee = amount * feeConfig.minPercentage
    return Math.max(feeConfig.amount, percentageFee)
  }
  
  return amount * feeConfig.percentage
}

export interface PaymentBreakdown {
  jobAmount: number
  platformFee: number
  stripeFee: number
  contractorPayout: number
  homeownerTotal: number
}

export function calculatePaymentBreakdown(
  jobAmount: number,
  tier: keyof typeof PLATFORM_FEE_TIERS
): PaymentBreakdown {
  const platformFee = calculatePlatformFee(jobAmount, tier)
  const homeownerTotal = jobAmount + platformFee
  const stripeFee = calculateStripeFee(homeownerTotal)
  const contractorPayout = jobAmount
  
  return {
    jobAmount,
    platformFee,
    stripeFee,
    contractorPayout,
    homeownerTotal: Math.round(homeownerTotal * 100) / 100
  }
}
