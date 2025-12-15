# Customizable Navigation Feature - Implementation Plan

## Overview
Allow users to customize their navigation by:
1. Choosing which tools appear in navigation
2. Reordering tools via drag-and-drop
3. Persisting preferences using existing `useLocalKV` system

## Data Structure

### Navigation Preference Type

```typescript
// src/lib/types/navigation.ts

export interface NavItem {
  id: string                    // Unique identifier (e.g., 'dashboard', 'browse-jobs')
  label: string                 // Display name (e.g., 'Dashboard', 'Browse Jobs')
  icon?: React.ComponentType    // Icon component
  page: string                  // Route/page identifier
  visible: boolean              // Whether item is shown
  order: number                 // Display order (lower = first)
  category?: 'primary' | 'secondary' | 'action'  // Item category
  required?: boolean            // Cannot be hidden (e.g., Home)
}

export interface NavigationPreferences {
  items: NavItem[]
  version: string               // Schema version for migrations
  lastUpdated: string           // ISO timestamp
}

// Default navigation configurations per role
export const DEFAULT_NAVIGATION: Record<UserRole, NavItem[]> = {
  homeowner: [
    { id: 'dashboard', label: 'Dashboard', page: 'dashboard', visible: true, order: 1, required: false },
    { id: 'my-jobs', label: 'My Jobs', page: 'my-jobs', visible: true, order: 2, required: false },
    { id: 'business-tools', label: 'Business Tools', page: 'business-tools', visible: true, order: 3, required: false },
    { id: 'photo-scoper', label: 'Scoper', page: 'photo-scoper', visible: true, order: 4, required: false },
    { id: 'post-job', label: 'Post Job', page: 'post-job', visible: true, order: 5, required: false, category: 'action' },
  ],
  contractor: [
    { id: 'browse-jobs', label: 'Browse', page: 'browse-jobs', visible: true, order: 1, required: false },
    { id: 'dashboard', label: 'Dashboard', page: 'dashboard', visible: true, order: 2, required: false },
    { id: 'crm', label: 'CRM', page: 'crm', visible: true, order: 3, required: false },
    { id: 'invoices', label: 'Invoices', page: 'invoices', visible: true, order: 4, required: false },
    { id: 'calendar', label: 'Calendar', page: 'calendar', visible: true, order: 5, required: false },
    { id: 'post-job', label: 'Post Job', page: 'post-job', visible: true, order: 6, required: false, category: 'action' },
  ],
  operator: [
    { id: 'dashboard', label: 'Dashboard', page: 'dashboard', visible: true, order: 1, required: false },
    { id: 'territory-map', label: 'Territory Map', page: 'territory-map', visible: true, order: 2, required: false },
    { id: 'crm', label: 'CRM', page: 'crm', visible: true, order: 3, required: false },
  ]
}
```

## Components to Create

### 1. NavigationCustomizer Component
Main UI for customizing navigation

```typescript
// src/components/navigation/NavigationCustomizer.tsx

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { GripVertical, Eye, EyeSlash, ArrowCounterClockwise } from '@phosphor-icons/react'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import type { User } from '@/lib/types'

interface NavigationCustomizerProps {
  user: User
  currentNav: NavItem[]
  onSave: (preferences: NavigationPreferences) => void
  onReset: () => void
}
```

### 2. DraggableNavItem Component
Individual draggable navigation item

```typescript
// src/components/navigation/DraggableNavItem.tsx

import { useState } from 'react'
import { GripVertical } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'
import type { NavItem } from '@/lib/types/navigation'
```

### 3. Navigation Preferences Hook
Custom hook for managing navigation preferences

```typescript
// src/hooks/useNavigationPreferences.ts

import { useLocalKV } from './useLocalKV'
import { useMemo } from 'react'
import type { User, UserRole } from '@/lib/types'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { DEFAULT_NAVIGATION } from '@/lib/types/navigation'
```

## Implementation Steps

### Step 1: Create Type Definitions
1. Create `src/lib/types/navigation.ts` with all type definitions
2. Define default navigation configurations
3. Export types for use across the app

### Step 2: Create Navigation Preferences Hook
1. Create `src/hooks/useNavigationPreferences.ts`
2. Implement logic to:
   - Load user preferences or use defaults
   - Merge defaults with saved preferences (handle new tools)
   - Save preferences back to localStorage
   - Handle migrations if schema changes

### Step 3: Create Navigation Customization UI
1. Create `src/components/navigation/NavigationCustomizer.tsx`
2. Implement drag-and-drop using native HTML5 drag API (no external deps)
3. Add visibility toggles
4. Add reset to defaults button
5. Follow brutalist design system

### Step 4: Integrate with Header Component
1. Modify `src/components/layout/Header.tsx`
2. Use `useNavigationPreferences` hook
3. Render navigation items from preferences
4. Add "Customize Navigation" option to user menu
5. Handle required items (cannot be hidden)

### Step 5: Handle Edge Cases
1. New tools added in updates (merge into user preferences)
2. User hides all items (ensure at least required items remain)
3. Migration of old preferences to new schema
4. Different navigation per role

## Detailed Component Implementation

### useNavigationPreferences Hook

```typescript
// src/hooks/useNavigationPreferences.ts

import { useLocalKV } from './useLocalKV'
import { useMemo } from 'react'
import type { User } from '@/lib/types'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { DEFAULT_NAVIGATION, mergeWithDefaults } from '@/lib/types/navigation'

const NAV_PREF_KEY = (userId: string) => `nav-preferences-${userId}`

export function useNavigationPreferences(user: User | null) {
  const key = user ? NAV_PREF_KEY(user.id) : ''
  const [preferences, setPreferences] = useLocalKV<NavigationPreferences | null>(
    key,
    null
  )

  const navigation = useMemo(() => {
    if (!user) return []
    
    // Get defaults for user role
    const defaults = DEFAULT_NAVIGATION[user.role]
    
    // If no preferences saved, use defaults
    if (!preferences) {
      return defaults
    }
    
    // Merge defaults with saved preferences
    // This handles new tools being added
    return mergeWithDefaults(defaults, preferences.items)
  }, [user, preferences])

  const savePreferences = (items: NavItem[]) => {
    if (!user) return
    
    const prefs: NavigationPreferences = {
      items: items.map((item, index) => ({
        ...item,
        order: item.order ?? index
      })),
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
    
    setPreferences(prefs)
  }

  const resetToDefaults = () => {
    if (!user) return
    setPreferences(null) // Will use defaults
  }

  return {
    navigation,
    savePreferences,
    resetToDefaults,
    isLoading: !user
  }
}
```

## Edge Case Handling

### 1. New Tools Added
- When loading preferences, merge with current defaults
- New tools appear at end of list with `visible: true`
- User can then customize as desired

### 2. User Hides All Items
- Prevent hiding required items
- Show warning if user tries to hide all non-required items
- Always ensure at least one visible item

### 3. Schema Migration
- Store version in preferences
- On load, check version and migrate if needed
- Migrate function handles old format → new format

### 4. Role Changes
- If user role changes, reset to new role's defaults
- Store preferences per role if needed
- Or reset on role change

## Design Considerations

### Brutalist Design Elements
- 2-4px solid borders (black/white)
- Hard shadows (no blur)
- No rounded corners (except where existing)
- High contrast
- Clean, blocky appearance
- Specific color palette only

### Drag and Drop
- Use native HTML5 drag API (no external library)
- Visual feedback with borders during drag
- Drop zones clearly marked
- Snap-to-position behavior

### Accessibility
- Keyboard navigation support
- Screen reader announcements
- Focus management
- ARIA labels for drag handles

## Files to Create/Modify

### New Files
1. `src/lib/types/navigation.ts` - Type definitions
2. `src/hooks/useNavigationPreferences.ts` - Preferences hook
3. `src/components/navigation/NavigationCustomizer.tsx` - Main UI
4. `src/components/navigation/DraggableNavItem.tsx` - Draggable item
5. `src/lib/utils/navigation-utils.ts` - Utility functions

### Modified Files
1. `src/components/layout/Header.tsx` - Use custom navigation
2. `src/lib/types.ts` - Export navigation types (if needed)

## Testing Checklist

- [ ] User can reorder navigation items
- [ ] User can toggle item visibility
- [ ] Preferences persist after page reload
- [ ] Default navigation shows for new users
- [ ] New tools appear for existing users
- [ ] Required items cannot be hidden
- [ ] Cannot hide all items
- [ ] Reset to defaults works
- [ ] Different roles have different defaults
- [ ] Drag and drop works on mobile (touch)
- [ ] Keyboard navigation works
- [ ] Design follows brutalist system
