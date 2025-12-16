/**
 * Navigation system types and default configurations
 */

import type { UserRole } from './types'
import { 
  ChartLine, 
  Briefcase, 
  Hammer, 
  Users, 
  Sparkle, 
  Camera, 
  MapPin,
  Lightning,
  Calculator,
  ShieldCheck,
  Note,
  Heart
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { UserRole } from './types'

export interface NavItem {
  id: string                    // Unique identifier (e.g., 'dashboard', 'browse-jobs')
  label: string                 // Display name (e.g., 'Dashboard', 'Browse Jobs')
  page: string                  // Route/page identifier
  visible: boolean              // Whether item is shown
  order: number                 // Display order (lower = first)
  category?: 'primary' | 'secondary' | 'action'  // Item category
  required?: boolean            // Cannot be hidden (e.g., Home - though we don't have one currently)
  iconName?: string             // Icon name for lookup
}

export interface NavigationPreferences {
  items: NavItem[]
  version: string               // Schema version for migrations
  lastUpdated: string           // ISO timestamp
}

// Icon mapping for navigation items
const iconMap: Record<string, typeof ChartLine> = {
  'ChartLine': ChartLine,
  'Briefcase': Briefcase,
  'Hammer': Hammer,
  'Users': Users,
  'Sparkle': Sparkle,
  'Camera': Camera,
  'MapPin': MapPin,
  'Lightning': Lightning,
  'Calculator': Calculator,
  'ShieldCheck': ShieldCheck,
  'Note': Note,
  'Heart': Heart,
}

export function getNavIcon(iconName?: string) {
  if (!iconName) return undefined
  return iconMap[iconName]
}

/**
 * Get available business tools that can be added to navigation
 * These are tools from the Free Tools Hub that can be pinned to nav
 */
export function getAvailableBusinessTools(role: UserRole): Array<Omit<NavItem, 'visible' | 'order'>> {
  const contractorTools: Array<Omit<NavItem, 'visible' | 'order'>> = [
    {
      id: 'cost-calculator',
      label: 'Cost Calculator',
      page: 'business-tools',
      category: 'secondary',
      iconName: 'Calculator'
    },
    {
      id: 'warranty-tracker',
      label: 'Warranty Tracker',
      page: 'business-tools',
      category: 'secondary',
      iconName: 'ShieldCheck'
    },
    {
      id: 'quick-notes',
      label: 'Quick Notes',
      page: 'business-tools',
      category: 'secondary',
      iconName: 'Note'
    }
  ]

  const homeownerTools: Array<Omit<NavItem, 'visible' | 'order'>> = [
    {
      id: 'saved-contractors',
      label: 'Saved Contractors',
      page: 'business-tools',
      category: 'secondary',
      iconName: 'Heart'
    },
    {
      id: 'quick-notes',
      label: 'Quick Notes',
      page: 'business-tools',
      category: 'secondary',
      iconName: 'Note'
    }
  ]

  if (role === 'contractor') {
    return contractorTools
  } else if (role === 'homeowner') {
    return homeownerTools
  }
  
  return [] // Operators don't have business tools
}

// Default navigation configurations per role
export const DEFAULT_NAVIGATION: Record<UserRole, NavItem[]> = {
  homeowner: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      page: 'dashboard', 
      visible: true, 
      order: 1, 
      required: false,
      iconName: 'ChartLine'
    },
    { 
      id: 'my-jobs', 
      label: 'My Jobs', 
      page: 'my-jobs', 
      visible: true, 
      order: 2, 
      required: false,
      iconName: 'Briefcase'
    },
    { 
      id: 'business-tools', 
      label: 'Business Tools', 
      page: 'business-tools', 
      visible: true, 
      order: 3, 
      required: false,
      iconName: 'Sparkle'
    },
    { 
      id: 'photo-scoper', 
      label: 'Scoper', 
      page: 'photo-scoper', 
      visible: true, 
      order: 4, 
      required: false,
      iconName: 'Camera'
    },
    { 
      id: 'post-job', 
      label: 'Post Job', 
      page: 'post-job', 
      visible: true, 
      order: 5, 
      required: false, 
      category: 'action',
      iconName: 'Lightning'
    },
  ],
  contractor: [
    { 
      id: 'browse-jobs', 
      label: 'Browse', 
      page: 'browse-jobs', 
      visible: true, 
      order: 1, 
      required: false,
      iconName: 'Hammer'
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      page: 'dashboard', 
      visible: true, 
      order: 2, 
      required: false,
      iconName: 'ChartLine'
    },
    { 
      id: 'crm', 
      label: 'CRM', 
      page: 'crm', 
      visible: true, 
      order: 3, 
      required: false,
      iconName: 'Users'
    },
    { 
      id: 'business-tools', 
      label: 'Business Tools', 
      page: 'business-tools', 
      visible: true, 
      order: 4, 
      required: false,
      iconName: 'Sparkle'
    },
    { 
      id: 'photo-scoper', 
      label: 'Scoper', 
      page: 'photo-scoper', 
      visible: true, 
      order: 5, 
      required: false,
      iconName: 'Camera'
    },
  ],
  operator: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      page: 'dashboard', 
      visible: true, 
      order: 1, 
      required: false,
      iconName: 'ChartLine'
    },
    { 
      id: 'browse-jobs', 
      label: 'Browse Jobs', 
      page: 'browse-jobs', 
      visible: true, 
      order: 2, 
      required: false,
      iconName: 'Briefcase'
    },
    { 
      id: 'territory-map', 
      label: 'Territories', 
      page: 'territory-map', 
      visible: true, 
      order: 3, 
      required: false,
      iconName: 'MapPin'
    },
  ]
}

/**
 * Merge user preferences with defaults
 * Handles new tools being added - they appear at the end
 */
export function mergeWithDefaults(
  defaults: NavItem[],
  userItems: NavItem[]
): NavItem[] {
  // Create a map of user preferences by ID
  const userMap = new Map(userItems.map(item => [item.id, item]))
  
  // Start with defaults
  const merged: NavItem[] = defaults.map(defaultItem => {
    const userItem = userMap.get(defaultItem.id)
    
    if (userItem) {
      // Merge: keep user's visible/order preferences, but use default metadata
      return {
        ...defaultItem,
        visible: userItem.visible,
        order: userItem.order
      }
    }
    
    // No user preference, use default
    return defaultItem
  })
  
  // Add any user items that aren't in defaults (legacy/removed items)
  // Sort by order
  merged.sort((a, b) => a.order - b.order)
  
  return merged
}

/**
 * Validate navigation preferences
 * Ensures at least one visible item and required items are visible
 */
export function validateNavigation(items: NavItem[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const visibleItems = items.filter(item => item.visible)
  
  if (visibleItems.length === 0) {
    errors.push('At least one navigation item must be visible')
  }
  
  // Check if any required items are hidden
  const hiddenRequired = items.filter(item => item.required && !item.visible)
  if (hiddenRequired.length > 0) {
    errors.push('Required navigation items cannot be hidden')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
