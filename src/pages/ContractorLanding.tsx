import { motion } from "framer-motion"
import { Hammer, CurrencyDollar, ChartLine, UsersThree, Shield, CheckCircle, Lightning, TrendUp } from "@phosphor-icons/react"
import { FeatureSection, GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"
import { ContractorSignupForm } from "@/components/auth/ContractorSignupForm"
import { useLocalKV } from "@/hooks/useLocalKV"
import { useEffect, useState } from "react"

interface ContractorLandingProps {
  onNavigate: (page: string) => void
}

export default function ContractorLanding({ onNavigate }: ContractorLandingProps) {
  const [signups] = useLocalKV<any[]>("contractor-signups", [])
  const [displayCount, setDisplayCount] = useState(1240)
  
  // Animate the counter on mount
  useEffect(() => {
    const target = 1243 + signups.length
    const interval = setInterval(() => {
      setDisplayCount(prev => {
        if (prev < target) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 50)
    return () => clearInterval(interval)
  }, [signups.length])

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
      {/* Top Banner Counter */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 text-center">
        <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
          <TrendUp weight="bold" />
          <span className="font-bold">{displayCount.toLocaleString()}</span> contractors joined this month. Limited spots available for the beta.
        </p>
      </div>

      <div className="w-full pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Split Hero Section */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
              <Shield weight="fill" />
              Verified Pro Network
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              The First <span className="text-primary">Zero-Fee</span> Marketplace for Pros
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
              Stop losing 20% to lead gen sites. Build your business with free CRM tools, instant payouts, and fair pay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" weight="fill" />
                <span className="font-medium">No Lead Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" weight="fill" />
                <span className="font-medium">No Commission</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" weight="fill" />
                <span className="font-medium">Free CRM</span>
              </div>
            </div>

            <div className="hidden lg:block pt-8">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-foreground">Trusted by 1,200+ Pros</p>
                  <p className="text-muted-foreground">4.9/5 Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
            
            <ContractorSignupForm onSuccess={() => {
              // Optional: Add conversion tracking pixel logic here
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }} />
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="max-w-5xl mx-auto mb-20">
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
            </div>
            <div className="relative h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
               <Hammer size={96} className="text-gray-400 opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                 <p className="text-white text-xl font-bold">"I saved $4,000 in fees last month alone. The AI scoping tool is a game changer for my bidding process." <br/><span className="text-sm font-normal opacity-80 mt-2 block">- Mark D., Master Electrician</span></p>
               </div>
            </div>
          </div>
        </div>

        <FeatureSection features={features} />

        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-8">How to Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, idx) => (
              <GlassCard key={idx} className="p-6 relative overflow-hidden text-left">
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

        <div className="text-center py-12 bg-black text-white rounded-3xl mx-auto max-w-4xl mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to keep your hard-earned money?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of contractors switching to FairTradeWorker.</p>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  )
}
