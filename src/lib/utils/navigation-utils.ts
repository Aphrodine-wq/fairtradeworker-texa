/**
 * Navigation utility functions
 */

import type { NavItem } from './types/navigation'

/**
 * Get navigation item by page identifier
 */
export function getNavItemByPage(items: NavItem[], page: string): NavItem | undefined {
  return items.find(item => item.page === page)
}

/**
 * Get visible navigation items, sorted by order
 */
export function getVisibleNavItems(items: NavItem[]): NavItem[] {
  return items
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order)
}

/**
 * Check if a navigation item exists
 */
export function hasNavItem(items: NavItem[], id: string): boolean {
  return items.some(item => item.id === id)
}

/**
 * Get navigation item by ID
 */
export function getNavItemById(items: NavItem[], id: string): NavItem | undefined {
  return items.find(item => item.id === id)
}
