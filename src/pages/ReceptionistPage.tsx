/**
 * AI Receptionist Page
 * Main page wrapper for ReceptionistCRM component
 */

import { ReceptionistCRM } from "@/components/contractor/ReceptionistCRM"
import type { User } from "@/lib/types"

interface ReceptionistPageProps {
  user: User
}

export function ReceptionistPage({ user }: ReceptionistPageProps) {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <span className="text-black dark:text-white">AI Receptionist</span>
            </h1>
            <p className="text-black dark:text-white text-lg max-w-2xl mx-auto">
              24/7 AI-powered phone answering that never misses a call. Automatically creates private jobs and onboards callers to your platform.
            </p>
          </div>

          {/* Main Component */}
          <ReceptionistCRM user={user} />
        </div>
      </div>
    </div>
  )
}
