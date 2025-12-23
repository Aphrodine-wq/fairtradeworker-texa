import { motion } from "framer-motion"
import { Shield, CheckCircle, Robot, Clock, Star, House } from "@phosphor-icons/react"
import { HeroSection, FeatureSection, GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"

interface HomeownerLandingProps {
  onNavigate: (page: string) => void
}

export function HomeownerLanding({ onNavigate }: HomeownerLandingProps) {
  const features = [
    {
      title: "Fair & Transparent Pricing",
      description: "Since we don't charge contractors fees, they pass the savings to you. No hidden markups.",
      icon: Shield,
    },
    {
      title: "AI-Powered Scoping",
      description: "Don't know construction? Our AI builds a professional scope of work from your photos.",
      icon: Robot,
    },
    {
      title: "Verified Professionals",
      description: "Every Pro on our platform is background-checked and license-verified for your safety.",
      icon: CheckCircle,
    },
    {
      title: "Secure Escrow Payments",
      description: "Funds are held safely until the milestones are met. You stay in control.",
      icon: House,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <HeroSection
          title="Home Repairs Without the Headache"
          subtitle="Get fair bids from verified pros in minutes. No phone tag, no hidden fees."
          bullets={["Verified Contractors", "AI Scope Builder", "Secure Payments", "Fair Prices"]}
          primaryAction={{ label: "Post a Job", onClick: () => onNavigate('post-job') }}
        />

        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-[400px] bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden flex items-center justify-center order-2 md:order-1">
               <House size={96} className="text-blue-400 opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                 <p className="text-white text-xl font-bold">"The AI scoping tool saved me hours of explaining the problem." <br/><span className="text-sm font-normal opacity-80">- Sarah J., Homeowner</span></p>
               </div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Homeowners Love Us</h2>
              <ul className="space-y-4">
                {[
                  "Get 3-5 competitive bids in under 24 hours.",
                  "Compare apples-to-apples with standardized scopes.",
                  "Chat directly with pros—no middlemen.",
                  "Satisfaction guarantee on all Pro jobs."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Star className="text-yellow-500 w-6 h-6 flex-shrink-0" weight="fill" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-4" onClick={() => onNavigate('post-job')}>
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>

        <FeatureSection features={features} />

        <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl max-w-4xl mx-auto my-16 text-center">
           <h2 className="text-2xl font-bold mb-4">Not sure what your project costs?</h2>
           <p className="text-gray-600 dark:text-gray-400 mb-6">Use our free AI Photo Scoper to get an instant estimate range before you post.</p>
           <Button variant="outline" size="lg" onClick={() => onNavigate('photo-scoper')}>
             Try AI Scoper
           </Button>
        </div>
      </div>
    </div>
  )
}
