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
    // Reduce initialization delay to render faster
    const timer = setTimeout(() => setIsInitializing(false), 200)
    return () => clearTimeout(timer)
  }, [])

  // Render immediately - don't wait for customers to load
  // CRM Void will handle its own loading states
  return <CRMVoid user={user} onNavigate={onNavigate} />
}
