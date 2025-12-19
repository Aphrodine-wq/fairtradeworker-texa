import type { ComponentType } from 'react'
// Using bootstrap-icons package - icons are imported as SVG components
// For now, keep using Phosphor icons but make them smaller
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
  RadioButton,
  VideoCamera,
  Ruler,
  Target,
  Trophy,
  Wallet,
  Lock,
  Funnel,
  Flag,
  Video,
} from '@phosphor-icons/react'

// Icon mapping - using Phosphor icons (smaller size)
export const ICON_MAP: Record<string, ComponentType<{ className?: string; style?: React.CSSProperties; weight?: string }>> = {
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
  // Module icons
  livewire: RadioButton,
  facelink: Video,
  blueprint: Ruler,
  scope: Target,
  dispatch: Calendar,
  reputation: Trophy,
  cashflow: Wallet,
  vault: Lock,
  funnel: Funnel,
  milestones: Flag,
  folder: Folder,
}

export function getIconForId(id: string): ComponentType<{ className?: string; style?: React.CSSProperties; weight?: string }> {
  return ICON_MAP[id] || Folder
}
