import type { User } from "@/lib/types"
import { CRMDashboard } from "@/components/contractor/CRMDashboard"

interface EnhancedCRMProps {
  user: User
  onNavigate?: (page: string) => void
}

export function EnhancedCRM({ user, onNavigate }: EnhancedCRMProps) {
  return <CRMDashboard user={user} />
}
