import { Heart, Shield, Hammer, House, MapTrifold, Zap, Lightning, User } from "@phosphor-icons/react"
import { HeroSection, StatsSection, GlassCard } from "@/components/ui/MarketingSections"

interface AboutPageProps {
  onNavigate?: (page: string) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const stats = [
    { label: "Contractors onboarded", value: "1,200+", icon: Hammer },
    { label: "Jobs Completed", value: "4,800+", icon: House },
    { label: "Avg. Rating", value: "4.8/5", icon: Lightning },
    { label: "Platform Fees", value: "$0", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full pt-10 pb-16 px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto">
        <HeroSection
          title="Restoring Fairness to Home Services"
          subtitle="We're building the first zero-commission marketplace that puts contractors and homeowners first."
          primaryAction={{ label: "Join the Movement", onClick: () => onNavigate?.('signup') }}
        />

        <StatsSection stats={stats} />

        {/* Founder Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why We Built FairTradeWorker</h2>
            <div className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-300">
              <p>
                For too long, the home services industry has been dominated by platforms that take 15-40% cuts from hard-working contractors. That's money that should go to their families, their equipment, and their business growth.
              </p>
              <p>
                We realized that if we could build modern, AI-powered tools that actually help contractors run their business, we wouldn't need to tax every transaction.
              </p>
              <p>
                FairTradeWorker is our answer: A zero-commission marketplace where quality wins, homeowners get fair prices, and contractors keep what they earn.
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User size={32} weight="fill" className="text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Alex & The Team</p>
                <p className="text-sm text-gray-500">Co-Founders</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
             {/* Placeholder for team photo */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 group-hover:scale-105 transition-transform duration-700" />
             <div className="text-center space-y-4 z-10">
                <Shield size={64} className="mx-auto text-primary opacity-50" />
                <p className="text-gray-500 font-medium">Founder Photo / Team Photo Placeholder</p>
             </div>
          </div>
        </div>

        {/* Mission / Values */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <GlassCard className="p-8">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
               <Shield size={24} className="text-green-600 dark:text-green-400" weight="fill" />
            </div>
            <h3 className="text-xl font-bold mb-3">Zero Fees, Forever</h3>
            <p className="text-gray-600 dark:text-gray-300">We don't take a cut of your hard work. Our revenue comes from optional premium tools, not your labor.</p>
          </GlassCard>
          <GlassCard className="p-8">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
               <Zap size={24} className="text-blue-600 dark:text-blue-400" weight="fill" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Powered Efficiency</h3>
            <p className="text-gray-600 dark:text-gray-300">We use advanced AI to scope jobs, match pros, and handle paperwork, saving everyone time and money.</p>
          </GlassCard>
          <GlassCard className="p-8">
             <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
               <Heart size={24} className="text-purple-600 dark:text-purple-400" weight="fill" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community First</h3>
            <p className="text-gray-600 dark:text-gray-300">We're building a community of trusted professionals and happy homeowners, backed by transparency.</p>
          </GlassCard>
        </div>

      </div>
    </div>
  )
}
