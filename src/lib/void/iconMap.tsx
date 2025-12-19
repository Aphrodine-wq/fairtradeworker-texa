import type { ComponentType } from 'react'
import {
  Folder,
  Users,
  UserPlus,
  FlowArrow,
  AddressBook,
  FileText,
  Brain,
  Lightning,
  Plug,
  ChartBar,
  Envelope,
  CurrencyDollar,
  Calendar,
  Storefront,
  Gear,
  Microphone,
} from '@phosphor-icons/react'

export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  customers: Users,
  leads: UserPlus,
  pipeline: FlowArrow,
  contacts: AddressBook,
  documents: FileText,
  'ai-hub': Brain,
  automation: Lightning,
  integrations: Plug,
  analytics: ChartBar,
  email: Envelope,
  billing: CurrencyDollar,
  calendar: Calendar,
  marketplace: Storefront,
  settings: Gear,
  'voice-capture': Microphone,
}

export function getIconForId(id: string): ComponentType<{ className?: string }> {
  return ICON_MAP[id] || Folder
}
