import type { Milestone } from './types'

export interface MilestoneTemplate {
  name: string
  description: string
  percentage: number
  verificationRequired: 'photos' | 'inspection' | 'walkthrough'
}

export const MILESTONE_TEMPLATES: Record<string, MilestoneTemplate[]> = {
  'kitchen-remodel': [
    { name: 'Contract Signing', description: 'Agreement executed', percentage: 20, verificationRequired: 'photos' },
    { name: 'Demolition Complete', description: 'Old removed, ready for new', percentage: 10, verificationRequired: 'photos' },
    { name: 'Rough-In Complete', description: 'Electrical/plumbing in walls', percentage: 20, verificationRequired: 'inspection' },
    { name: 'Cabinets Installed', description: 'Cabinets in place', percentage: 20, verificationRequired: 'photos' },
    { name: 'Counters + Backsplash', description: 'Surfaces complete', percentage: 15, verificationRequired: 'photos' },
    { name: 'Final Completion', description: 'Punch list done, final clean', percentage: 15, verificationRequired: 'walkthrough' }
  ],
  'bathroom-remodel': [
    { name: 'Contract Signing', description: 'Agreement executed', percentage: 20, verificationRequired: 'photos' },
    { name: 'Demolition Complete', description: 'Old removed, ready for new', percentage: 10, verificationRequired: 'photos' },
    { name: 'Rough-In Complete', description: 'Electrical/plumbing in walls', percentage: 20, verificationRequired: 'inspection' },
    { name: 'Tile Complete', description: 'All tile work finished', percentage: 20, verificationRequired: 'photos' },
    { name: 'Fixtures Installed', description: 'Plumbing and lighting installed', percentage: 15, verificationRequired: 'photos' },
    { name: 'Final Completion', description: 'Punch list done, final clean', percentage: 15, verificationRequired: 'walkthrough' }
  ],
  'roof-replacement': [
    { name: 'Contract + Materials', description: 'Materials ordered/delivered', percentage: 40, verificationRequired: 'photos' },
    { name: 'Tear-Off Complete', description: 'Old roof removed', percentage: 20, verificationRequired: 'photos' },
    { name: 'Install Complete', description: 'New roof on', percentage: 30, verificationRequired: 'photos' },
    { name: 'Final Inspection', description: 'Cleanup, inspection passed', percentage: 10, verificationRequired: 'inspection' }
  ],
  'deck-build': [
    { name: 'Contract + Materials', description: 'Materials ordered/delivered', percentage: 30, verificationRequired: 'photos' },
    { name: 'Framing Complete', description: 'Structure built', percentage: 25, verificationRequired: 'photos' },
    { name: 'Decking Installed', description: 'Surface complete', percentage: 25, verificationRequired: 'photos' },
    { name: 'Railings + Stairs', description: 'Safety features complete', percentage: 15, verificationRequired: 'photos' },
    { name: 'Final Completion', description: 'Staining/sealing done', percentage: 5, verificationRequired: 'walkthrough' }
  ],
  'fence-installation': [
    { name: 'Contract + Materials', description: 'Materials ordered', percentage: 30, verificationRequired: 'photos' },
    { name: 'Posts Set', description: 'All posts in ground', percentage: 30, verificationRequired: 'photos' },
    { name: 'Fence Complete', description: 'Panels/pickets installed', percentage: 30, verificationRequired: 'photos' },
    { name: 'Gates + Final', description: 'Gates hung, cleanup done', percentage: 10, verificationRequired: 'walkthrough' }
  ],
  'room-addition': [
    { name: 'Contract Signing', description: 'Agreement executed', percentage: 15, verificationRequired: 'photos' },
    { name: 'Foundation Complete', description: 'Foundation poured and cured', percentage: 15, verificationRequired: 'inspection' },
    { name: 'Framing + Roof Complete', description: 'Structure enclosed', percentage: 20, verificationRequired: 'photos' },
    { name: 'MEP Rough-In Complete', description: 'Mechanical/electrical/plumbing rough-in', percentage: 15, verificationRequired: 'inspection' },
    { name: 'Drywall + Insulation', description: 'Walls closed up', percentage: 15, verificationRequired: 'photos' },
    { name: 'Flooring + Paint', description: 'Finishes complete', percentage: 10, verificationRequired: 'photos' },
    { name: 'Final Completion', description: 'Punch list done', percentage: 10, verificationRequired: 'walkthrough' }
  ],
  'default': [
    { name: 'Contract Signing', description: 'Agreement executed', percentage: 20, verificationRequired: 'photos' },
    { name: 'Work Started', description: 'Project begun', percentage: 20, verificationRequired: 'photos' },
    { name: 'Halfway Complete', description: 'Major progress milestone', percentage: 30, verificationRequired: 'photos' },
    { name: 'Substantially Complete', description: 'Work nearly finished', percentage: 20, verificationRequired: 'photos' },
    { name: 'Final Completion', description: 'Punch list done, approved', percentage: 10, verificationRequired: 'walkthrough' }
  ]
}

export function generateMilestonesFromTemplate(
  jobId: string,
  projectType: string,
  totalAmount: number,
  includeRetainage: boolean = false
): Milestone[] {
  const templateKey = projectType.toLowerCase().replace(/\s+/g, '-')
  const template = MILESTONE_TEMPLATES[templateKey] || MILESTONE_TEMPLATES['default']
  
  let milestones = template.map((t, index) => ({
    id: `milestone-${jobId}-${index + 1}`,
    jobId,
    name: t.name,
    description: t.description,
    amount: Math.round(totalAmount * (t.percentage / 100)),
    percentage: t.percentage,
    sequence: index + 1,
    status: 'pending' as const,
    verificationRequired: t.verificationRequired
  }))

  if (includeRetainage && totalAmount >= 15000) {
    const lastMilestone = milestones[milestones.length - 1]
    const retainageAmount = Math.round(lastMilestone.amount * 0.1)
    
    lastMilestone.amount = lastMilestone.amount - retainageAmount
    
    milestones.push({
      id: `milestone-${jobId}-retainage`,
      jobId,
      name: 'Retainage Release',
      description: '10% retainage after punch list (14 days)',
      amount: retainageAmount,
      percentage: 10,
      sequence: milestones.length + 1,
      status: 'pending' as const,
      verificationRequired: 'walkthrough'
    })
  }

  return milestones
}

export function getMilestoneProgress(milestones: Milestone[]): {
  completed: number
  total: number
  percentage: number
  amountPaid: number
  amountRemaining: number
} {
  const completed = milestones.filter(m => m.status === 'paid').length
  const total = milestones.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const amountPaid = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0)
  const amountRemaining = milestones.filter(m => m.status !== 'paid').reduce((sum, m) => sum + m.amount, 0)
  
  return { completed, total, percentage, amountPaid, amountRemaining }
}
