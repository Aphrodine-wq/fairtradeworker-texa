import { useMemo, useEffect, useState } from "react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer } from "@/lib/types"
import { CRMVoid } from "./CRMVoid"

interface EnhancedCRMProps {
  user: User
  onNavigate?: (page: string) => void
}

export function EnhancedCRM({ user, onNavigate }: EnhancedCRMProps) {
  const [customers, , customersLoading] = useKV<CRMCustomer[]>("crm-customers", [])
  const [isInitializing, setIsInitializing] = useState(true)
  
  useEffect(() => {
    if (!customersLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [customersLoading])

  if (customersLoading || isInitializing) {
    return (
      <div className="w-full min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white/60 text-lg">Loading CRM Void…</div>
      </div>
    )
  }

  // Render the new CRM Void interface
  return <CRMVoid user={user} onNavigate={onNavigate} />
}
