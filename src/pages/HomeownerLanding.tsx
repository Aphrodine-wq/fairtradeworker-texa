import { motion } from "framer-motion"
import { Shield, CheckCircle, Robot, Clock, Star, House, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react"
import { FeatureSection, GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface HomeownerLandingProps {
  onNavigate: (page: string) => void
}

export default function HomeownerLanding({ onNavigate }: HomeownerLandingProps) {
  const [zipCode, setZipCode] = useState("")

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipCode.length >= 5) {
      onNavigate('post-job')
    }
  }

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
      <div className="w-full pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Split Hero Section */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center mb-20 pt-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
              <CheckCircle weight="fill" />
              100% Satisfaction Guarantee
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Home Repairs <br/>
              <span className="text-primary">Without the Headache</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
              Get fair bids from verified pros in minutes. No phone tag, no hidden fees, and AI-powered scoping.
            </p>

            <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-3.5 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Enter Zip Code" 
                  className="pl-10 h-12 text-lg bg-white dark:bg-black"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={5}
                />
              </div>
              <Button size="lg" className="h-12 px-8 text-lg font-bold">
                Find a Pro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star weight="fill" className="text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield weight="fill" className="text-blue-500" />
                <span>Licensed & Insured</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 lg:pl-10">
            <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="h-2 bg-primary w-full" />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Robot size={24} className="text-blue-600" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Scope Builder</h3>
                    <p className="text-sm text-muted-foreground">Analyzing your project...</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                      <House size={32} className="text-gray-400" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle weight="fill" />
                      Scope Generated: "Master Bath Remodel"
                    </p>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => onNavigate('photo-scoper')}>
                    Try AI Scoper Demo
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-black p-4 rounded-xl shadow-xl border border-border flex items-center gap-3 animate-bounce-slow">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <CurrencyDollar size={20} className="text-yellow-600" weight="bold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Savings</p>
                <p className="font-bold text-lg">$2,400</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-20">
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
            </div>
          </div>
        </div>

        <FeatureSection features={features} />

        <div className="bg-black text-white p-12 rounded-3xl max-w-5xl mx-auto my-16 text-center relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-4">Not sure what your project costs?</h2>
             <p className="text-gray-300 mb-8 max-w-xl mx-auto">Use our free AI Photo Scoper to get an instant estimate range before you post. It takes less than 60 seconds.</p>
             <Button variant="secondary" size="lg" onClick={() => onNavigate('photo-scoper')} className="h-14 px-8 text-lg">
               <Camera className="mr-2 h-5 w-5" />
               Try AI Scoper Free
             </Button>
           </div>
           
           {/* Background decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
