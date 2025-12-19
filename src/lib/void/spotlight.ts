/**
 * VOID OS Spotlight Search
 * Universal search across all VOID content
 */

export type SpotlightCategory = 
  | 'customers'
  | 'leads'
  | 'projects'
  | 'invoices'
  | 'documents'
  | 'actions'
  | 'settings'

export interface SpotlightResult {
  id: string
  title: string
  description?: string
  category: SpotlightCategory
  icon?: string
  action: () => void
  keywords?: string[]
}

export interface SpotlightRecentItem {
  id: string
  title: string
  category: SpotlightCategory
  timestamp: number
  action: () => void
}

/**
 * Fuzzy search algorithm
 */
export function fuzzySearch(query: string, text: string): number {
  if (!query || !text) return 0
  
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match
  if (textLower === queryLower) return 1.0
  
  // Starts with
  if (textLower.startsWith(queryLower)) return 0.9
  
  // Contains
  if (textLower.includes(queryLower)) return 0.7
  
  // Fuzzy match (character order matters)
  let queryIndex = 0
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
    }
  }
  
  if (queryIndex === queryLower.length) {
    return 0.5
  }
  
  return 0
}

/**
 * Search across all categories
 */
export function searchSpotlight(
  query: string,
  data: {
    customers?: Array<{ id: string; name: string; email?: string }>
    leads?: Array<{ id: string; name: string; projectType?: string }>
    projects?: Array<{ id: string; name: string; customerName?: string }>
    invoices?: Array<{ id: string; number: string; customerName?: string }>
    documents?: Array<{ id: string; name: string; type?: string }>
  }
): SpotlightResult[] {
  if (!query || query.trim().length === 0) {
    return []
  }

  const results: SpotlightResult[] = []
  const queryLower = query.toLowerCase().trim()

  // Search customers
  if (data.customers) {
    data.customers.forEach(customer => {
      const nameScore = fuzzySearch(queryLower, customer.name)
      const emailScore = customer.email ? fuzzySearch(queryLower, customer.email) : 0
      const score = Math.max(nameScore, emailScore)
      
      if (score > 0) {
        results.push({
          id: `customer-${customer.id}`,
          title: customer.name,
          description: customer.email,
          category: 'customers',
          icon: '👤',
          action: () => {
            // Open customer window
            console.log('Open customer:', customer.id)
          },
          keywords: [customer.name, customer.email].filter(Boolean) as string[],
        })
      }
    })
  }

  // Search leads
  if (data.leads) {
    data.leads.forEach(lead => {
      const nameScore = fuzzySearch(queryLower, lead.name)
      const projectScore = lead.projectType ? fuzzySearch(queryLower, lead.projectType) : 0
      const score = Math.max(nameScore, projectScore)
      
      if (score > 0) {
        results.push({
          id: `lead-${lead.id}`,
          title: lead.name,
          description: lead.projectType,
          category: 'leads',
          icon: '🔔',
          action: () => {
            console.log('Open lead:', lead.id)
          },
          keywords: [lead.name, lead.projectType].filter(Boolean) as string[],
        })
      }
    })
  }

  // Search projects
  if (data.projects) {
    data.projects.forEach(project => {
      const nameScore = fuzzySearch(queryLower, project.name)
      const customerScore = project.customerName ? fuzzySearch(queryLower, project.customerName) : 0
      const score = Math.max(nameScore, customerScore)
      
      if (score > 0) {
        results.push({
          id: `project-${project.id}`,
          title: project.name,
          description: project.customerName,
          category: 'projects',
          icon: '📋',
          action: () => {
            console.log('Open project:', project.id)
          },
          keywords: [project.name, project.customerName].filter(Boolean) as string[],
        })
      }
    })
  }

  // Search invoices
  if (data.invoices) {
    data.invoices.forEach(invoice => {
      const numberScore = fuzzySearch(queryLower, invoice.number)
      const customerScore = invoice.customerName ? fuzzySearch(queryLower, invoice.customerName) : 0
      const score = Math.max(numberScore, customerScore)
      
      if (score > 0) {
        results.push({
          id: `invoice-${invoice.id}`,
          title: `Invoice ${invoice.number}`,
          description: invoice.customerName,
          category: 'invoices',
          icon: '💰',
          action: () => {
            console.log('Open invoice:', invoice.id)
          },
          keywords: [invoice.number, invoice.customerName].filter(Boolean) as string[],
        })
      }
    })
  }

  // Quick actions
  const quickActions: SpotlightResult[] = [
    {
      id: 'action-new-lead',
      title: 'New Lead',
      category: 'actions',
      icon: '➕',
      action: () => console.log('New Lead'),
      keywords: ['new', 'lead', 'create'],
    },
    {
      id: 'action-new-customer',
      title: 'New Customer',
      category: 'actions',
      icon: '➕',
      action: () => console.log('New Customer'),
      keywords: ['new', 'customer', 'create'],
    },
    {
      id: 'action-new-project',
      title: 'New Project',
      category: 'actions',
      icon: '➕',
      action: () => console.log('New Project'),
      keywords: ['new', 'project', 'create'],
    },
    {
      id: 'action-new-invoice',
      title: 'New Invoice',
      category: 'actions',
      icon: '➕',
      action: () => console.log('New Invoice'),
      keywords: ['new', 'invoice', 'create'],
    },
    {
      id: 'action-view-analytics',
      title: 'View Analytics',
      category: 'actions',
      icon: '📊',
      action: () => console.log('View Analytics'),
      keywords: ['analytics', 'stats', 'report'],
    },
  ]

  quickActions.forEach(action => {
    const keywordMatch = action.keywords?.some(keyword => 
      fuzzySearch(queryLower, keyword) > 0
    )
    if (keywordMatch || fuzzySearch(queryLower, action.title) > 0) {
      results.push(action)
    }
  })

  // Sort by relevance (score)
  results.sort((a, b) => {
    const aScore = Math.max(
      ...(a.keywords?.map(k => fuzzySearch(queryLower, k)) || [0])
    )
    const bScore = Math.max(
      ...(b.keywords?.map(k => fuzzySearch(queryLower, k)) || [0])
    )
    return bScore - aScore
  })

  return results.slice(0, 10) // Limit to 10 results
}

/**
 * Get recent items from localStorage
 */
export function getRecentItems(maxItems = 5): SpotlightRecentItem[] {
  try {
    const stored = localStorage.getItem('void-spotlight-recent')
    if (!stored) return []
    
    const items: SpotlightRecentItem[] = JSON.parse(stored)
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems)
  } catch {
    return []
  }
}

/**
 * Add item to recent
 */
export function addToRecent(item: Omit<SpotlightRecentItem, 'timestamp'>): void {
  try {
    const stored = localStorage.getItem('void-spotlight-recent')
    const items: SpotlightRecentItem[] = stored ? JSON.parse(stored) : []
    
    // Remove if already exists
    const filtered = items.filter(i => i.id !== item.id)
    
    // Add to beginning
    const newItems: SpotlightRecentItem[] = [
      { ...item, timestamp: Date.now() },
      ...filtered,
    ].slice(0, 10) // Keep last 10
    
    localStorage.setItem('void-spotlight-recent', JSON.stringify(newItems))
  } catch (error) {
    console.warn('[Spotlight] Failed to save recent item:', error)
  }
}
