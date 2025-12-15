/* ========================================
   BUDGET CONTROLLER - COST MANAGEMENT
   Tracks and limits AI spending
   ======================================== */

const MONTHLY_BUDGET = 120; // $120/month budget with 4.5x safety margin
const HAIKU_COST = 0.00025; // $0.00025 per call
const SONNET_COST = 0.003; // $0.003 per call (12x more expensive)

// Budget tracking (in-memory, should be persisted in production)
let haikuSpent = 0;
let sonnetSpent = 0;
let budgetResetDate = new Date();
let haikuCallCount = 0;
let sonnetCallCount = 0;

// Reset budget monthly
const resetBudgetIfNeeded = () => {
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - budgetResetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceReset >= 30) {
    haikuSpent = 0;
    sonnetSpent = 0;
    haikuCallCount = 0;
    sonnetCallCount = 0;
    budgetResetDate = now;
  }
};

export interface BudgetStatus {
  haikuSpent: number;
  sonnetSpent: number;
  totalSpent: number;
  budgetRemaining: number;
  haikuCalls: number;
  sonnetCalls: number;
  totalCalls: number;
  budgetPercentage: number;
}

/**
 * Get current budget status
 */
export const getBudgetStatus = (): BudgetStatus => {
  resetBudgetIfNeeded();
  
  const totalSpent = haikuSpent + sonnetSpent;
  const budgetRemaining = MONTHLY_BUDGET - totalSpent;
  const budgetPercentage = (totalSpent / MONTHLY_BUDGET) * 100;
  
  return {
    haikuSpent,
    sonnetSpent,
    totalSpent,
    budgetRemaining,
    haikuCalls: haikuCallCount,
    sonnetCalls: sonnetCallCount,
    totalCalls: haikuCallCount + sonnetCallCount,
    budgetPercentage,
  };
};

/**
 * Check if we can make a Haiku call within budget
 */
export const canCallHaiku = (): boolean => {
  resetBudgetIfNeeded();
  return haikuSpent + HAIKU_COST <= MONTHLY_BUDGET * 0.67; // 67% of budget for Haiku
};

/**
 * Check if we can make a Sonnet call within budget
 */
export const canCallSonnet = (): boolean => {
  resetBudgetIfNeeded();
  return sonnetSpent + SONNET_COST <= MONTHLY_BUDGET * 0.33; // 33% of budget for Sonnet
};

/**
 * Record a Haiku call and its cost
 */
export const recordHaikuCall = (): void => {
  resetBudgetIfNeeded();
  haikuSpent += HAIKU_COST;
  haikuCallCount++;
};

/**
 * Record a Sonnet call and its cost
 */
export const recordSonnetCall = (): void => {
  resetBudgetIfNeeded();
  sonnetSpent += SONNET_COST;
  sonnetCallCount++;
};

/**
 * Smart call with budget checking
 * Throws error if budget exceeded
 */
export const smartCallWithBudget = async <T>(
  isSimple: boolean,
  callFn: () => Promise<T>
): Promise<T> => {
  resetBudgetIfNeeded();
  
  if (isSimple) {
    if (!canCallHaiku()) {
      throw new Error('Haiku budget exceeded. Monthly limit reached.');
    }
    const result = await callFn();
    recordHaikuCall();
    return result;
  } else {
    if (!canCallSonnet()) {
      throw new Error('Sonnet budget exceeded. Monthly limit reached.');
    }
    const result = await callFn();
    recordSonnetCall();
    return result;
  }
};

/**
 * Reset budget manually (for testing/admin)
 */
export const resetBudget = (): void => {
  haikuSpent = 0;
  sonnetSpent = 0;
  haikuCallCount = 0;
  sonnetCallCount = 0;
  budgetResetDate = new Date();
};

/**
 * Get cost estimates for planning
 */
export const getCostEstimates = () => {
  return {
    haikuCost: HAIKU_COST,
    sonnetCost: SONNET_COST,
    monthlyBudget: MONTHLY_BUDGET,
    estimatedSimpleJobs: Math.floor((MONTHLY_BUDGET * 0.67) / HAIKU_COST),
    estimatedComplexJobs: Math.floor((MONTHLY_BUDGET * 0.33) / SONNET_COST),
  };
};
