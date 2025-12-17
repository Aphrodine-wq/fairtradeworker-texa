/**
 * Client Payment Portal Page
 * Wrapper page for the Client Payment Portal component
 */

import { ClientPaymentPortal } from '@/components/invoices/ClientPaymentPortal'
import { GlassNav } from '@/components/ui/MarketingSections'
import type { User } from '@/lib/types'

interface ClientPaymentPortalPageProps {
  user: User
  onNavigate?: (page: string) => void
}

export function ClientPaymentPortalPage({ user, onNavigate }: ClientPaymentPortalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "My Invoices", href: "#", active: true },
          { label: "Dashboard", href: "#" },
        ]}
        primaryLabel="Post Job"
      />
      <div className="w-full px-4 md:px-8 pt-20 pb-12">
        <ClientPaymentPortal user={user} homeownerId={user.id} />
      </div>
    </div>
  )
}

export default ClientPaymentPortalPage
