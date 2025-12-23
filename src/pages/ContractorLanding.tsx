import { motion } from "framer-motion"
import { Hammer, CurrencyDollar, ChartLine, UsersThree, Shield, CheckCircle, Lightning } from "@phosphor-icons/react"
import { HeroSection, FeatureSection, GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"

interface ContractorLandingProps {
  onNavigate: (page: string) => void
}

export default function ContractorLanding({ onNavigate }: ContractorLandingProps) {
  const features = [
    {
      title: "Keep 100% of Earnings",
      description: "We charge zero platform fees on your jobs. You quote $500, you get $500. No hidden cuts.",
      icon: CurrencyDollar,
    },
    {
      title: "Free CRM Suite",
      description: "Manage clients, invoices, and scheduling with our built-in tools—completely free.",
      icon: UsersThree,
    },
    {
      title: "AI Scoping Assistant",
      description: "Save hours on estimates. Our AI analyzes photos and generates line-item scopes for you.",
      icon: Lightning,
    },
    {
      title: "Instant Payouts",
      description: "Get paid immediately upon job completion via Stripe. No waiting weeks for checks.",
      icon: ChartLine,
    },
  ]

  const steps = [
    { title: "Create Profile", desc: "Showcase your skills, licenses, and portfolio." },
    { title: "Browse Jobs", desc: "Filter by trade, location, and budget." },
    { title: "Send Quotes", desc: "Use our AI tools to bid faster and win more." },
    { title: "Get Paid", desc: "Receive direct payments with 0% fees taken." },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <HeroSection
          title="The First Zero-Fee Marketplace for Pros"
          subtitle="Stop losing 20% to lead gen sites. Build your business with free tools and fair pay."
          bullets={["No Lead Fees", "No Commission", "Free CRM", "Fast Pay"]}
          primaryAction={{ label: "Join as Contractor", onClick: () => onNavigate('signup') }}
        />

        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Pros Choose Us</h2>
              <ul className="space-y-4">
                {[
                  "We verify homeowners so you don't waste time.",
                  "Our AI handles the paperwork and scoping.",
                  "You own your client relationships forever.",
                  "Automated invoicing and payment reminders."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" weight="fill" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-4" onClick={() => onNavigate('signup')}>
                Start Earning More
              </Button>
            </div>
            <div className="relative h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
               <Hammer size={96} className="text-gray-400 opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                 <p className="text-white text-xl font-bold">"I saved $4,000 in fees last month alone." <br/><span className="text-sm font-normal opacity-80">- Mark D., Electrician</span></p>
               </div>
            </div>
          </div>
        </div>

        <FeatureSection features={features} />

        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-8">How to Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, idx) => (
              <GlassCard key={idx} className="p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-100 dark:text-gray-800 opacity-50 z-0">
                  {idx + 1}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="text-center py-12 bg-black text-white rounded-3xl mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">Ready to keep your hard-earned money?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of contractors switching to FairTradeWorker.</p>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" onClick={() => onNavigate('signup')}>
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  )
}
