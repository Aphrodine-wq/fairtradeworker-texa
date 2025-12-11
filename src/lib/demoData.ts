import type { User, Job, Bid, Invoice, Territory } from './types'
import { calculateJobSize } from './types'

export const DEMO_USERS: Record<'homeowner' | 'contractor' | 'operator', User> = {
  homeowner: {
    id: 'demo-homeowner-001',
    email: 'demo.homeowner@fairtradeworker.com',
    fullName: 'Sarah Johnson',
    role: 'homeowner',
    isPro: false,
    performanceScore: 0,
    bidAccuracy: 0,
    isOperator: false,
    referralEarnings: 0,
    contractorInviteCount: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  contractor: {
    id: 'demo-contractor-001',
    email: 'demo.contractor@fairtradeworker.com',
    fullName: 'Mike Rodriguez',
    role: 'contractor',
    territoryId: 1,
    isPro: false,
    performanceScore: 0.85,
    bidAccuracy: 0.92,
    isOperator: false,
    referralEarnings: 50,
    contractorInviteCount: 3,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  operator: {
    id: 'demo-operator-001',
    email: 'demo.operator@fairtradeworker.com',
    fullName: 'James Chen',
    role: 'operator',
    territoryId: 1,
    isPro: true,
    proSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    performanceScore: 0.95,
    bidAccuracy: 0.88,
    isOperator: true,
    referralEarnings: 0,
    contractorInviteCount: 0,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

export const DEMO_JOBS: Job[] = [
  {
    id: 'demo-job-001',
    homeownerId: 'demo-homeowner-001',
    title: 'Kitchen Faucet Replacement',
    description: 'My kitchen faucet is leaking from the base and needs to be replaced. It\'s a standard single-handle faucet.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    ],
    aiScope: {
      scope: 'Replace leaking kitchen faucet cartridge and install new single-handle faucet. Includes shutoff valve inspection and water line check.',
      priceLow: 120,
      priceHigh: 180,
      materials: ['Moen cartridge', 'Basin wrench', 'Plumber\'s grease', 'Teflon tape'],
    },
    size: calculateJobSize(180),
    status: 'open',
    territoryId: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      {
        id: 'demo-bid-001',
        jobId: 'demo-job-001',
        contractorId: 'demo-contractor-002',
        contractorName: 'Tom\'s Plumbing',
        amount: 150,
        message: 'I can get this done same-day with a 1-year warranty on parts and labor.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-job-002',
    homeownerId: 'demo-homeowner-002',
    title: 'Drywall Repair in Living Room',
    description: 'Hole in drywall from moving furniture. About 4 inches diameter.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
    ],
    aiScope: {
      scope: 'Patch 4-inch drywall hole with mesh tape, joint compound, sand smooth, prime and paint to match existing wall.',
      priceLow: 80,
      priceHigh: 130,
      materials: ['Drywall patch kit', 'Joint compound', 'Mesh tape', 'Sandpaper', 'Paint primer', 'Wall paint'],
    },
    size: calculateJobSize(130),
    status: 'open',
    territoryId: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [],
  },
  {
    id: 'demo-job-003',
    homeownerId: 'demo-homeowner-001',
    title: 'Ceiling Fan Installation',
    description: 'Need to install a new ceiling fan in master bedroom. Existing light fixture to be removed.',
    mediaType: 'video',
    photos: [
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&q=80',
    ],
    aiScope: {
      scope: 'Remove existing light fixture, install ceiling fan support bracket, wire and mount 52-inch ceiling fan with light kit, test all functions.',
      priceLow: 150,
      priceHigh: 220,
      materials: ['Ceiling fan support brace', 'Wire nuts', 'Mounting hardware', 'Electrical tape'],
    },
    size: calculateJobSize(220),
    status: 'open',
    territoryId: 1,
    createdAt: new Date().toISOString(),
    bids: [],
  },
  {
    id: 'demo-job-004',
    homeownerId: 'demo-homeowner-003',
    title: 'Outdoor Deck Staining',
    description: 'Need my 12x16 deck cleaned, sanded, and re-stained. Wood is weathered but structurally sound.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    ],
    aiScope: {
      scope: 'Power wash 192 sq ft deck, sand surface, apply wood conditioner, and two coats of semi-transparent deck stain.',
      priceLow: 450,
      priceHigh: 650,
      materials: ['Deck cleaner', 'Wood conditioner', 'Deck stain (2 gallons)', 'Sandpaper/pads', 'Brushes and rollers'],
    },
    size: calculateJobSize(650),
    status: 'in-progress',
    territoryId: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      {
        id: 'demo-bid-004',
        jobId: 'demo-job-004',
        contractorId: 'demo-contractor-001',
        contractorName: 'Mike Rodriguez',
        amount: 525,
        message: 'I have 15 years of deck refinishing experience. Can start next week and complete in 2 days weather permitting.',
        status: 'accepted',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-job-005',
    homeownerId: 'demo-homeowner-002',
    title: 'Leaky Toilet Fix',
    description: 'Toilet running constantly. Need quick repair.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
    ],
    aiScope: {
      scope: 'Replace faulty flapper valve and adjust fill valve. Test for proper shutoff.',
      priceLow: 75,
      priceHigh: 120,
      materials: ['Flapper valve', 'Fill valve kit', 'Wax ring (if needed)'],
    },
    size: calculateJobSize(120),
    status: 'open',
    territoryId: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [],
  },
  {
    id: 'demo-job-006',
    homeownerId: 'demo-homeowner-001',
    title: 'Garage Door Spring Replacement',
    description: 'Garage door won\'t open. Cable looks broken.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1617083278530-6a524d3c90e5?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    aiScope: {
      scope: 'Replace broken torsion spring, inspect and adjust cables, lubricate all moving parts, test safety features.',
      priceLow: 250,
      priceHigh: 380,
      materials: ['Torsion spring set', 'Cable kit', 'Lubricant', 'Safety tools'],
    },
    size: calculateJobSize(380),
    status: 'open',
    territoryId: 1,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      {
        id: 'demo-bid-006',
        jobId: 'demo-job-006',
        contractorId: 'demo-contractor-003',
        contractorName: 'Austin Garage Pros',
        amount: 325,
        message: 'We specialize in garage door repairs. Can come today with all parts in our truck.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-job-007',
    homeownerId: 'demo-homeowner-003',
    title: 'Full Kitchen Remodel',
    description: 'Complete kitchen renovation - new cabinets, countertops, appliances, flooring, and lighting.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80',
      'https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=800&q=80',
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
    ],
    aiScope: {
      scope: 'Full kitchen remodel including cabinet removal and installation, granite countertops, tile backsplash, new appliances, hardwood flooring, recessed lighting, and painting.',
      priceLow: 18000,
      priceHigh: 28000,
      materials: ['Custom cabinets', 'Granite countertops', 'Tile', 'Hardwood flooring', 'Appliances', 'LED recessed lights', 'Plumbing fixtures', 'Paint'],
    },
    size: calculateJobSize(28000),
    status: 'open',
    territoryId: 2,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [],
  },
  {
    id: 'demo-job-008',
    homeownerId: 'demo-homeowner-001',
    title: 'Gutter Cleaning',
    description: 'Gutters overflowing. Need cleaned and checked for damage.',
    mediaType: 'photo',
    photos: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    ],
    aiScope: {
      scope: 'Clean all gutters and downspouts, inspect for damage, flush drainage, minor repairs as needed.',
      priceLow: 150,
      priceHigh: 225,
      materials: ['Gutter sealant', 'Downspout straps', 'Gutter guards (optional)'],
    },
    size: calculateJobSize(225),
    status: 'open',
    territoryId: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      {
        id: 'demo-bid-008',
        jobId: 'demo-job-008',
        contractorId: 'demo-contractor-001',
        contractorName: 'Mike Rodriguez',
        amount: 180,
        message: 'I can do this tomorrow morning. Includes full inspection and photos of any issues found.',
        status: 'pending',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'demo-invoice-001',
    contractorId: 'demo-contractor-001',
    jobId: 'demo-job-004',
    jobTitle: 'Outdoor Deck Staining',
    amount: 525,
    status: 'sent',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    lateFeeApplied: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-invoice-002',
    contractorId: 'demo-contractor-001',
    jobId: 'demo-job-005',
    jobTitle: 'Bathroom Tile Repair',
    amount: 275,
    status: 'paid',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lateFeeApplied: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_TERRITORIES: Territory[] = [
  {
    id: 1,
    countyName: 'Travis County',
    operatorId: 'demo-operator-001',
    operatorName: 'James Chen',
    status: 'claimed',
  },
  {
    id: 2,
    countyName: 'Harris County',
    status: 'available',
  },
  {
    id: 3,
    countyName: 'Dallas County',
    operatorId: 'operator-other-001',
    operatorName: 'Jennifer Smith',
    status: 'claimed',
  },
  {
    id: 4,
    countyName: 'Bexar County',
    status: 'available',
  },
  {
    id: 5,
    countyName: 'Tarrant County',
    status: 'available',
  },
  {
    id: 6,
    countyName: 'Collin County',
    status: 'available',
  },
  {
    id: 7,
    countyName: 'Denton County',
    status: 'available',
  },
  {
    id: 8,
    countyName: 'Fort Bend County',
    status: 'available',
  },
]

export function initializeDemoData() {
  const demoJobsKey = 'demo-jobs-initialized'
  const demoInvoicesKey = 'demo-invoices-initialized'
  const demoTerritoriesKey = 'demo-territories-initialized'

  if (!localStorage.getItem(demoJobsKey)) {
    localStorage.setItem(demoJobsKey, 'true')
    return {
      jobs: DEMO_JOBS,
      invoices: DEMO_INVOICES,
      territories: DEMO_TERRITORIES,
    }
  }

  return null
}
