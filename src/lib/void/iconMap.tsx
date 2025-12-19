import type { ComponentType } from 'react'
import {
  Users,
  UserPlus,
  Brain,
  Gear,
  Plug,
  CurrencyDollar,
  FlowArrow,
  ShareNetwork,
  ChartBar,
  AddressBook,
  Workflow,
  Megaphone,
  Envelope,
  Receipt,
  FileText,
  Calendar,
  Storefront,
  Question,
  Wrench,
  Microphone,
  MusicNote,
} from '@phosphor-icons/react'

export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  customers: Users,
  leads: UserPlus,
  ai: Brain,
  automation: Gear,
  integrations: Plug,
  sales: CurrencyDollar,
  pipeline: FlowArrow,
  'social-media': ShareNetwork,
  analytics: ChartBar,
  contacts: AddressBook,
  workflows: Workflow,
  marketing: Megaphone,
  email: Envelope,
  billing: Receipt,
  documents: FileText,
  events: Calendar,
  settings: Wrench,
  support: Question,
  calendar: Calendar,
  marketplace: Storefront,
  voice: Microphone,
  spotify: MusicNote,
}

export function getIconForMenu(menuId: string): ComponentType<{ className?: string }> {
  return ICON_MAP[menuId] || Question
}
