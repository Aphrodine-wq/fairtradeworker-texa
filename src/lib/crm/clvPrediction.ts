export interface CLVPrediction {
  predicted5YearValue: number;
  confidence: number; // 0-1
  serviceOpportunities: string[];
  recommendedInvestment: number;
}

export interface CustomerSnapshot {
  completedJobs: number;
  totalSpend: number;
  jobsPerYear: number;
  referrals: number;
  propertyType?: string;
  homeAge?: number;
  medianIncome?: number;
}

export function predictCLV(customer: CustomerSnapshot): CLVPrediction {
  const base = customer.totalSpend || customer.completedJobs * 400;
  const frequencyBoost = customer.jobsPerYear * 150;
  const referralBoost = customer.referrals * 200;
  const propertyBoost = customer.propertyType === 'single_family' ? 200 : 0;
  const incomeBoost = customer.medianIncome ? Math.min(customer.medianIncome / 1000, 500) : 0;

  const predicted5YearValue = Math.round(base * 0.6 + frequencyBoost + referralBoost + propertyBoost + incomeBoost);
  const confidence = clamp((customer.completedJobs > 3 ? 0.7 : 0.5) + (customer.referrals > 0 ? 0.1 : 0), 0, 1);

  return {
    predicted5YearValue,
    confidence,
    serviceOpportunities: deriveOpportunities(customer),
    recommendedInvestment: Math.round(predicted5YearValue * 0.1),
  };
}

function deriveOpportunities(customer: CustomerSnapshot): string[] {
  const opportunities: string[] = [];
  if (customer.homeAge && customer.homeAge > 15) opportunities.push('HVAC tune-up / replacement check');
  if (customer.jobsPerYear >= 2) opportunities.push('Annual maintenance plan offer');
  if (customer.referrals > 0) opportunities.push('Referral rewards follow-up');
  return opportunities;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}
