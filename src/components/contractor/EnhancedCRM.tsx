import type { User } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface EnhancedCRMProps {
  user: User
  onNavigate?: (page: string) => void
}

export function EnhancedCRM({ user, onNavigate }: EnhancedCRMProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Void CRM</h1>
        <p className="text-muted-foreground">
          This feature is currently under development.
        </p>
      </Card>
    </div>
  )
}
