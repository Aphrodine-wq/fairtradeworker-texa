export const mockHomeowner = {
  id: 'test-homeowner-1',
  email: 'homeowner@test.com',
  fullName: 'Test Homeowner',
  role: 'homeowner' as const,
  isPro: false,
  performanceScore: 0,
  bidAccuracy: 0,
  isOperator: false,
  territories: [],
  createdAt: new Date().toISOString()
}

export const mockContractor = {
  id: 'test-contractor-1',
  email: 'contractor@test.com',
  fullName: 'Test Contractor',
  role: 'contractor' as const,
  isPro: false,
  performanceScore: 7.5,
  bidAccuracy: 85,
  isOperator: false,
  territories: [],
  createdAt: new Date().toISOString()
}

export const mockMajorProjectJob = {
  id: 'test-job-major-1',
  homeownerId: 'test-homeowner-1',
  title: 'Kitchen Remodel',
  description: 'Full kitchen renovation',
  status: 'open' as const,
  address: '123 Test St, Austin, TX 78701',
  estimatedCost: 25000,
  scope: 'Complete kitchen remodel with cabinets, countertops, and appliances',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockMilestones = [
  {
    id: 'milestone-1',
    jobId: 'test-job-major-1',
    name: 'Contract Signing',
    description: 'Agreement executed',
    amount: 5000,
    percentage: 20,
    status: 'pending' as const,
    sequence: 1,
    verificationRequired: false
  },
  {
    id: 'milestone-2',
    jobId: 'test-job-major-1',
    name: 'Demolition Complete',
    description: 'Old kitchen removed',
    amount: 2500,
    percentage: 10,
    status: 'pending' as const,
    sequence: 2,
    verificationRequired: true
  }
]
