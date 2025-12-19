import type { BuddyMessage } from './types'

const MOCKED_MESSAGES: Record<string, string> = {
  '6-9 AM': "Morning! 3 site visits. Storm alert—reschedule?",
  '12-3 PM': "Peak hours: 5 leads need calls. Prioritized list ready.",
  '5-8 PM': "$22k closed today. Generate report & prep tomorrow?",
  'new-lead': "New lead: [Name] (score: 92%). Pre-fill form?",
  'inactive-2h': "3 follow-ups pending. Draft emails now?",
}

export function getTimeBasedTrigger(): string | null {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 9) return '6-9 AM'
  if (hour >= 12 && hour < 15) return '12-3 PM'
  if (hour >= 17 && hour < 20) return '5-8 PM'
  
  return null
}

export function getMockedMessage(trigger: string, context?: Record<string, unknown>): string {
  const template = MOCKED_MESSAGES[trigger] || "How can I help you today?"
  
  // Simple template replacement
  if (context?.name) {
    return template.replace('[Name]', String(context.name))
  }
  
  return template
}

export function shouldShowMessage(lastMessageTime: number): boolean {
  const now = Date.now()
  const fifteenMinutes = 15 * 60 * 1000
  return now - lastMessageTime >= fifteenMinutes
}

export function gatherContext(): {
  timeOfDay: string
  dayOfWeek: number
  hour: number
} {
  const now = new Date()
  return {
    timeOfDay: getTimeBasedTrigger() || 'other',
    dayOfWeek: now.getDay(),
    hour: now.getHours(),
  }
}
