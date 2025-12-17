/**
 * AI Receptionist Page
 * Main page wrapper for ReceptionistCRM component
 */

import { ReceptionistCRM } from "@/components/contractor/ReceptionistCRM"
import type { User } from "@/lib/types"
import { GlassNav } from "@/components/ui/MarketingSections"

interface ReceptionistPageProps {
  user: User
}

export function ReceptionistPage({ user }: ReceptionistPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Receptionist", href: "#", active: true },
          { label: "Operator Dashboard", href: "#" },
        ]}
        primaryLabel="Post Job" />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 pt-20 pb-6">
        <div className="flex-shrink-0 text-center mb-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <span className="text-black dark:text-white">AI Receptionist</span>
          </h1>
          <p className="text-black dark:text-white text-sm max-w-2xl mx-auto">
            24/7 AI-powered phone answering that never misses a call. Automatically creates private jobs and onboards callers to your platform.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <ReceptionistCRM user={user} />
        </div>
      </div>
    </div>
  )
}
