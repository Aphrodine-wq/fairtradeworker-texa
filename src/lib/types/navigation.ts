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
  Heart,
  Receipt,
  CreditCard,
  Folder,
  Calendar,
  ChatCircleDots,
  Bell,
  ClipboardText,
  Package,
  CheckCircle,
  Gear,
  Phone,
  Target,
  FileText,
  Microphone,
  Swap,
  Ruler,
  WifiSlash,
  Image,
  CalendarDots
} from '@phosphor-icons/react'

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
  'Receipt': Receipt,
  'CreditCard': CreditCard,
  'Folder': Folder,
  'Calendar': Calendar,
  'ChatCircleDots': ChatCircleDots,
  'Bell': Bell,
  'ClipboardText': ClipboardText,
  'Package': Package,
  'CheckCircle': CheckCircle,
  'Gear': Gear,
  'Phone': Phone,
  'Target': Target,
  'FileText': FileText,
  'Microphone': Microphone,
  'Swap': Swap,
  'Ruler': Ruler,
  'WifiSlash': WifiSlash,
  'Image': Image,
  'CalendarDots': CalendarDots,
}

export function getNavIcon(iconName?: string) {
  if (!iconName) return undefined
  return iconMap[iconName]
}

/**
 * Get available business tools that can be added to navigation
 * Includes both free and pro tools that can be pinned to nav
 */
export function getAvailableBusinessTools(role: UserRole): Array<Omit<NavItem, 'visible' | 'order'>> {
  const contractorTools: Array<Omit<NavItem, 'visible' | 'order'>> = [
    // Free Tools
    {
      id: 'cost-calculator',
      label: 'Cost Calculator',
      page: 'free-tools',
      category: 'secondary',
      iconName: 'Calculator'
    },
    {
      id: 'warranty-tracker',
      label: 'Warranty Tracker',
      page: 'free-tools',
      category: 'secondary',
      iconName: 'ShieldCheck'
    },
    {
      id: 'quick-notes',
      label: 'Quick Notes',
      page: 'free-tools',
      category: 'secondary',
      iconName: 'Note'
    },
    // Business Tools - Finance
    {
      id: 'invoices',
      label: 'Invoices',
      page: 'invoices',
      category: 'secondary',
      iconName: 'Receipt'
    },
    {
      id: 'expenses',
      label: 'Expenses',
      page: 'expenses',
      category: 'secondary',
      iconName: 'ChartLine'
    },
    {
      id: 'tax-helper',
      label: 'Tax Helper',
      page: 'tax-helper',
      category: 'secondary',
      iconName: 'FileText'
    },
    {
      id: 'payments',
      label: 'Payments',
      page: 'payments',
      category: 'secondary',
      iconName: 'CreditCard'
    },
    // Management
    {
      id: 'documents',
      label: 'Documents',
      page: 'documents',
      category: 'secondary',
      iconName: 'Folder'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      page: 'calendar',
      category: 'secondary',
      iconName: 'Calendar'
    },
    {
      id: 'communication',
      label: 'Communication',
      page: 'communication',
      category: 'secondary',
      iconName: 'ChatCircleDots'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      page: 'notifications',
      category: 'secondary',
      iconName: 'Bell'
    },
    // Sales & CRM
    {
      id: 'leads',
      label: 'Lead Management',
      page: 'leads',
      category: 'secondary',
      iconName: 'Users'
    },
    {
      id: 'reports',
      label: 'Reports',
      page: 'reports',
      category: 'secondary',
      iconName: 'ClipboardText'
    },
    // Operations
    {
      id: 'inventory',
      label: 'Inventory',
      page: 'inventory',
      category: 'secondary',
      iconName: 'Package'
    },
    {
      id: 'quality',
      label: 'Quality Assurance',
      page: 'quality',
      category: 'secondary',
      iconName: 'CheckCircle'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      page: 'compliance',
      category: 'secondary',
      iconName: 'ShieldCheck'
    },
    // Automation
    {
      id: 'automation',
      label: 'Automation',
      page: 'automation',
      category: 'secondary',
      iconName: 'Gear'
    },
    // Pro Tools
    {
      id: 'receptionist',
      label: 'AI Receptionist',
      page: 'receptionist',
      category: 'secondary',
      iconName: 'Phone'
    },
    {
      id: 'bid-optimizer',
      label: 'Bid Optimizer',
      page: 'bid-optimizer',
      category: 'secondary',
      iconName: 'Target'
    },
    {
      id: 'change-order',
      label: 'Change Orders',
      page: 'change-order',
      category: 'secondary',
      iconName: 'FileText'
    },
    {
      id: 'crew-dispatcher',
      label: 'Crew Dispatcher',
      page: 'crew-dispatcher',
      category: 'secondary',
      iconName: 'Users'
    },
    // Zero-Cost Features
    {
      id: 'voice-bids',
      label: 'Voice Bids',
      page: 'voice-bids',
      category: 'secondary',
      iconName: 'Microphone'
    },
    {
      id: 'neighborhood-alerts',
      label: 'Neighborhood Alerts',
      page: 'neighborhood-alerts',
      category: 'secondary',
      iconName: 'MapPin'
    },
    {
      id: 'skill-trading',
      label: 'Skill Trading',
      page: 'skill-trading',
      category: 'secondary',
      iconName: 'Swap'
    },
    {
      id: 'material-calc',
      label: 'Material Calculator',
      page: 'material-calc',
      category: 'secondary',
      iconName: 'Ruler'
    },
    {
      id: 'offline-mode',
      label: 'Offline Mode',
      page: 'offline-mode',
      category: 'secondary',
      iconName: 'WifiSlash'
    },
    {
      id: 'project-stories',
      label: 'Project Stories',
      page: 'project-stories',
      category: 'secondary',
      iconName: 'Image'
    },
    {
      id: 'seasonal-clubs',
      label: 'Seasonal Clubs',
      page: 'seasonal-clubs',
      category: 'secondary',
      iconName: 'CalendarDots'
    }
  ]

  const operatorTools: Array<Omit<NavItem, 'visible' | 'order'>> = [
    // Operators can add most business tools too
    {
      id: 'invoices',
      label: 'Invoices',
      page: 'invoices',
      category: 'secondary',
      iconName: 'Receipt'
    },
    {
      id: 'expenses',
      label: 'Expenses',
      page: 'expenses',
      category: 'secondary',
      iconName: 'ChartLine'
    },
    {
      id: 'documents',
      label: 'Documents',
      page: 'documents',
      category: 'secondary',
      iconName: 'Folder'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      page: 'calendar',
      category: 'secondary',
      iconName: 'Calendar'
    },
    {
      id: 'communication',
      label: 'Communication',
      page: 'communication',
      category: 'secondary',
      iconName: 'ChatCircleDots'
    },
    {
      id: 'automation',
      label: 'Automation',
      page: 'automation',
      category: 'secondary',
      iconName: 'Gear'
    }
  ]

  const homeownerTools: Array<Omit<NavItem, 'visible' | 'order'>> = [
    {
      id: 'saved-contractors',
      label: 'Saved Contractors',
      page: 'free-tools',
      category: 'secondary',
      iconName: 'Heart'
    },
    {
      id: 'quick-notes',
      label: 'Quick Notes',
      page: 'free-tools',
      category: 'secondary',
      iconName: 'Note'
    }
  ]

  if (role === 'contractor') {
    return contractorTools
  } else if (role === 'operator') {
    return operatorTools
  } else if (role === 'homeowner') {
    return homeownerTools
  }
  
  return []
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
      id: 'free-tools', 
      label: 'Free Tools', 
      page: 'free-tools', 
      visible: true, 
      order: 3, 
      required: false,
      iconName: 'Calculator'
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
  const defaultIds = new Set(defaults.map(item => item.id))
  
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
  
  // Add any user items that aren't in defaults (newly added tools, legacy items, etc.)
  const userOnlyItems = userItems.filter(item => !defaultIds.has(item.id))
  merged.push(...userOnlyItems)
  
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
