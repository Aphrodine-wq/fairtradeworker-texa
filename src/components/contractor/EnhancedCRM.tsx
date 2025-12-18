import type { User } from "@/lib/types"
import { VOID } from "@/components/void/VOID"

interface EnhancedCRMProps {
  user: User
  onNavigate?: (page: string) => void
}

export function EnhancedCRM({ user, onNavigate }: EnhancedCRMProps) {
  return <VOID user={user} onNavigate={onNavigate} />
}
