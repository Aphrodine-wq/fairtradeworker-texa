/**
 * VOID OS Feature Modules
 */

import type React from 'react'

export interface VoidModule {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
  windowId: string
  enabled: boolean
  category: 'productivity' | 'communication' | 'analytics' | 'management'
}

export const MODULE_DEFINITIONS: Omit<VoidModule, 'enabled'>[] = [
  {
    id: 'livewire',
    name: 'LIVEWIRE',
    description: 'Activity Feed - Real-time job site activity',
    icon: () => null, // Will be replaced with actual icons
    component: () => null, // Will be implemented
    windowId: 'livewire',
    category: 'productivity',
  },
  {
    id: 'facelink',
    name: 'FACELINK',
    description: 'Video Calls - Embedded video calls with transcription',
    icon: () => null,
    component: () => null,
    windowId: 'facelink',
    category: 'communication',
  },
  {
    id: 'blueprint',
    name: 'BLUEPRINT',
    description: 'Floor Planner - Draw floor plans with AI suggestions',
    icon: () => null,
    component: () => null,
    windowId: 'blueprint',
    category: 'productivity',
  },
  {
    id: 'scope',
    name: 'SCOPE',
    description: 'AI Estimator - Chat-based estimate builder',
    icon: () => null,
    component: () => null,
    windowId: 'scope',
    category: 'productivity',
  },
  {
    id: 'dispatch',
    name: 'DISPATCH',
    description: 'Crew Scheduling - Drag-drop crew scheduling',
    icon: () => null,
    component: () => null,
    windowId: 'dispatch',
    category: 'management',
  },
  {
    id: 'reputation',
    name: 'REPUTATION',
    description: 'Review Management - Multi-platform review management',
    icon: () => null,
    component: () => null,
    windowId: 'reputation',
    category: 'analytics',
  },
  {
    id: 'cashflow',
    name: 'CASHFLOW',
    description: 'Invoice Builder - Visual invoice builder',
    icon: () => null,
    component: () => null,
    windowId: 'cashflow',
    category: 'productivity',
  },
  {
    id: 'vault',
    name: 'VAULT',
    description: 'Team Wiki - SOPs, training, guides',
    icon: () => null,
    component: () => null,
    windowId: 'vault',
    category: 'productivity',
  },
  {
    id: 'funnel',
    name: 'FUNNEL',
    description: 'Lead Inbox - Unified lead source with AI scoring',
    icon: () => null,
    component: () => null,
    windowId: 'funnel',
    category: 'analytics',
  },
  {
    id: 'milestones',
    name: 'MILESTONES',
    description: 'Project Timeline - Visual job timeline with profit tracking',
    icon: () => null,
    component: () => null,
    windowId: 'milestones',
    category: 'management',
  },
]
