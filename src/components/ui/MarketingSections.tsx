import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, Star, Robot, FileText, ChartLine, UsersThree, Megaphone, Shield, Sparkle, Brain, BarChart, Lock, CurrencyDollar } from "@phosphor-icons/react"
import { UnifiedPaymentScreen } from "@/components/payments/UnifiedPaymentScreen"
import { containerVariants, itemVariants, universalCardHover } from "@/lib/animations"
import type { User } from "@/lib/types"

type NavLink = { label: string; href?: string; active?: boolean }

export function GlassCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("border-0 shadow-none bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm", className)} {...props} />
}

export function GlassNav({ children }: { brand?: any; links?: NavLink[]; primaryLabel?: string; onPrimaryClick?: () => void; children?: React.ReactNode }) {
  // GlassNav is disabled; return children only to avoid duplicate navigation bars
  return <>{children}</>
}

export function HeroSection({
  title,
  subtitle,
  bullets,
  primaryAction,
  secondaryAction,
}: {
  title: string
  subtitle: string
  bullets?: string[]
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}) {
  return (
    <div className="mb-12">
      <GlassCard className="p-8 md:p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl tracking-tight">
            {title}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 leading-relaxed">{subtitle}</p>
          
          {bullets && bullets.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-6 mb-8">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                  {bullet}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap mt-8">
            {primaryAction && (
              <Button 
                size="lg"
                className="px-8 py-6 text-lg font-semibold shadow-none transition-all"
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg font-semibold"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export function TrustBarSection() {
  const trustSignals = [
    { label: "Powered by Stripe", icon: Shield },
    { label: "Secure & Encrypted", icon: Lock },
    { label: "100% Contractor Earnings", icon: CurrencyDollar },
    { label: "Verified Reviews", icon: Star },
  ]

  return (
    <div className="mb-12 border-y border-gray-200 dark:border-gray-800 py-8 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
          {trustSignals.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-2 group">
              <item.icon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" weight="duotone" />
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah J.",
      role: "Homeowner",
      content: "Finally a platform where I can find contractors without the middleman markup. The AI scoping tool saved me hours.",
      rating: 5,
    },
    {
      name: "Mike T.",
      role: "General Contractor",
      content: "I keep 100% of my earnings. That's unheard of. The CRM tools are just a massive bonus.",
      rating: 5,
    },
    {
      name: "Elena R.",
      role: "Interior Designer",
      content: "The invoicing system is a game changer for my small business. Professional and fast.",
      rating: 5,
    },
    {
      name: "David K.",
      role: "Homeowner",
      content: "Transparent pricing and verified pros. FairTradeWorker is now my go-to for all home repairs.",
      rating: 4,
    },
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trusted by Homeowners & Pros</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">Join thousands of satisfied users</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={idx}
            whileHover={{ y: -5 }}
            className="h-full"
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} weight={i < t.rating ? "fill" : "regular"} size={16} />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow italic">"{t.content}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Is it really zero fees for contractors?",
      answer: "Yes. We believe contractors should keep 100% of their hard-earned money. We charge a small, transparent service fee to homeowners instead, or earn revenue through optional premium tools for business management."
    },
    {
      question: "How does the AI Scoping work?",
      answer: "You simply upload photos or a video of your project. Our AI (Claude) analyzes the visuals to create a detailed scope of work and estimated materials list in minutes, which you can then edit and post."
    },
    {
      question: "Are the contractors verified?",
      answer: "Absolutely. We verify licenses, insurance, and identity for all 'Pro' contractors on our platform. You can see verification badges on their profiles."
    },
    {
      question: "How are leads assigned?",
      answer: "We don't sell leads to 50 people. Jobs are matched to the most relevant local contractors based on their skills, rating, and availability. It's a merit-based system, not pay-to-play."
    }
  ]

  return (
    <div className="mb-16 max-w-3xl mx-auto">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">Common questions about FairTradeWorker</p>
      </div>
      <GlassCard className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </GlassCard>
    </div>
  )
}

export function HowItWorksSection() {
  const steps = [
    {
      title: "1. Post Your Job",
      description: "Upload photos, video, or voice notes. Our AI builds the scope for you.",
      icon: Megaphone
    },
    {
      title: "2. Get AI Scope",
      description: "Review the generated budget and materials list instantly.",
      icon: Brain
    },
    {
      title: "3. Receive Bids",
      description: "Verified local pros send competitive bids based on your scope.",
      icon: UsersThree
    },
    {
      title: "4. Hire & Pay",
      description: "Choose your pro and pay securely via Stripe. Funds are held in escrow.",
      icon: Shield
    }
  ]

  return (
    <div className="mb-16">
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">From to-do list to done in 4 simple steps</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connector Line (Desktop only) */}
        <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent z-0" />
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-lg border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <step.icon size={40} className="text-primary" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-[200px]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsSection({
  stats,
}: {
  stats: Array<{ label: string; value: string; icon?: React.ElementType; tone?: string }>
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon || Users
        const tone = stat.tone || "primary"
        const bg = tone === "green" ? "bg-green-100 dark:bg-green-900" : "bg-primary-100 dark:bg-primary-900"
        const fg = tone === "green" ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400"
        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            custom={idx}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={cn("h-12 w-12 rounded-md flex items-center justify-center", bg)}>
                    <Icon className={cn("text-xl", fg)} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.label}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

type Feature = { title: string; description: string; icon?: React.ElementType }

const featureIconMap: Record<string, React.ElementType> = {
  'ai scoping': Brain,
  'smart invoicing': FileText,
  'analytics dashboard': ChartLine,
  'crm suite': UsersThree,
  'boosted listings': Megaphone,
  'secure payments': Shield,
  // Fallbacks
  robot: Robot,
  invoice: FileText,
  analytics: ChartLine,
  crm: UsersThree,
  boost: Megaphone,
  secure: Shield,
}

export function FeatureSection({ features, onNavigate }: { features: Feature[]; onNavigate?: (page: string) => void }) {
  const getFeatureRoute = (title: string): string | null => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('ai scoping') || titleLower.includes('scoping')) {
      return 'photo-scoper'
    }
    if (titleLower.includes('invoicing') || titleLower.includes('invoice')) {
      return 'invoices-page'
    }
    if (titleLower.includes('analytics') || titleLower.includes('dashboard')) {
      return 'revenue-dashboard'
    }
    if (titleLower.includes('crm')) {
      return 'customer-crm'
    }
    if (titleLower.includes('boosted') || titleLower.includes('listing')) {
      return 'pro-upgrade'
    }
    if (titleLower.includes('payment') || titleLower.includes('secure')) {
      return 'track-payments'
    }
    return null
  }

  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="text-center mb-10 space-y-2"
        style={{ willChange: 'transform, opacity' }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Features</h2>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Everything you need to manage your home services business
        </p>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 max-w-5xl mx-auto"
      >
        {features.map((feature, idx) => {
          // Use explicit icon if provided, otherwise try to match from map
          const Icon = feature.icon || featureIconMap[feature.title.toLowerCase()] || Sparkle
          const route = getFeatureRoute(feature.title)
          const handleClick = () => {
            if (route && onNavigate) {
              onNavigate(route)
            }
          }
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              custom={idx}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
            >
              <GlassCard 
                className={cn(
                  "p-6 text-center",
                  route && onNavigate && "cursor-pointer"
                )}
                onClick={handleClick}
              >
                <div
                  className="h-14 w-14 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-4 mx-auto"
                >
                  <Icon className="text-black dark:text-white text-2xl" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1 sm:mt-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{feature.description}</p>
              </GlassCard>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export function PricingSection({
  tierLabel = "Starter",
  price = "$25",
  description = "Suitable to grow steadily.",
  ctaLabel = "Get started",
  onPurchase,
  user,
  onNavigate,
}: {
  tierLabel?: string
  price?: string
  description?: string
  ctaLabel?: string
  onPurchase?: () => void
  onNavigate?: (page: string) => void
  user?: User | null
}) {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: number } | null>(null)
  const handlePaymentComplete = (paymentId: string) => {
    setPaymentOpen(false)
    setSelectedTier(null)
    if (onNavigate) {
      onNavigate('dashboard')
    }
  }

  const handleTierClick = (tier: typeof pricingTiers[0]) => {
    if (tier.name === "Contractor Pro" && tier.price !== "$0") {
      // Extract price number from string like "$50"
      const priceNum = parseInt(tier.price.replace('$', ''))
      if (user) {
        setSelectedTier({ name: tier.name, price: priceNum })
        setPaymentOpen(true)
      } else {
        // If not logged in, navigate to signup
        if (onNavigate) {
          onNavigate('signup')
        }
      }
    } else if (tier.name === "Homeowner" && onNavigate) {
      onNavigate('signup')
    } else if (tier.name === "Contractor Free" && onNavigate) {
      onNavigate('signup')
    } else if (onPurchase) {
      onPurchase()
    }
  }

  const pricingTiers = [
    {
      name: "Homeowner Free",
      price: "$0",
      description: "Post jobs at no cost",
      features: ["Post unlimited jobs", "Receive bids", "Basic messaging", "No fees"],
      ctaLabel: "Get Started"
    },
    {
      name: "Homeowner Pro",
      price: "$25",
      description: "Enhanced homeowner features",
      features: ["Priority job placement", "Advanced project tracking", "Direct contractor messaging", "Project analytics"],
      ctaLabel: "Upgrade to Pro"
    },
    {
      name: "Contractor Free",
      price: "$0",
      description: "Start winning jobs for free",
      features: ["Browse jobs", "Submit bids", "Basic profile", "100% of earnings"],
      ctaLabel: "Sign Up Free",
      highlighted: true
    },
    {
      name: "Contractor Pro",
      price: "$59",
      description: "Advanced tools to grow",
      features: ["Priority placement", "CRM & Analytics", "Smart invoicing", "AI scope assistance"],
      ctaLabel: "Upgrade to Pro"
    }
  ]

  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="text-center mb-10 space-y-2"
        style={{ willChange: 'transform, opacity' }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">Choose the plan that works for you</p>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
      >
        {pricingTiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            variants={itemVariants}
            custom={idx}
            whileHover={universalCardHover.hover}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            <GlassCard className={`${tier.highlighted ? 'ring-2 ring-black dark:ring-white' : ''}`}>
            <div className="px-6 py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tier.name}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{tier.description}</p>
                <p className="mt-4">
                  <span className="text-5xl font-bold text-black dark:text-white">{tier.price}</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">{tier.price === "$0" || tier.price === "Free" ? "" : "/mo"}</span>
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-black dark:text-white text-lg" aria-hidden="true">✓</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-8">
              <Button
                className="w-full px-6 py-2.5 text-center duration-200 bg-black text-white rounded-lg hover:bg-gray-800 focus-visible:outline-black text-sm dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={() => handleTierClick(tier)}
              >
                {tier.ctaLabel}
              </Button>
            </div>
          </GlassCard>
          </motion.div>
        ))}
      </motion.div>
      {user && selectedTier && (
        <UnifiedPaymentScreen
          open={paymentOpen}
          onClose={() => {
            setPaymentOpen(false)
            setSelectedTier(null)
          }}
          paymentType="subscription"
          amount={selectedTier.price}
          title={`${selectedTier.name} Subscription`}
          description="Monthly subscription to Pro features"
          user={user}
          onPaymentComplete={handlePaymentComplete}
          enableRecurring={true}
          recurringInterval="monthly"
        />
      )}
    </div>
  )
}

export function RatingSection() {
  const [value, setValue] = useState<number | null>(null)
  const options = useMemo(() => [5, 4, 3, 2, 1], [])
  return (
    <GlassCard className="p-8">
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Rate Your Experience</h2>
        <p className="text-xl text-gray-500 dark:text-gray-300">Help us improve our platform</p>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-row-reverse gap-2">
          {options.map((opt) => (
            <label key={opt} className="cursor-pointer" aria-label={`Rate ${opt} out of 5`}>
              <input
                type="radio"
                name="rating"
                value={opt}
                className="hidden"
                checked={value === opt}
                onChange={() => setValue(opt)}
              />
              <Star
                weight={value && value >= opt ? "fill" : "regular"}
                className={cn(
                  "w-10 h-10 transition-colors",
                  value && value >= opt ? "text-yellow-500" : "text-gray-400 dark:text-gray-500"
                )}
              />
            </label>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

export function ThemePersistenceToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldDark = saved === "dark" || (!saved && prefersDark)
    setIsDark(shouldDark)
    document.documentElement.setAttribute("data-appearance", shouldDark ? "dark" : "light")
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute("data-appearance", next ? "dark" : "light")
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center h-8 w-16 rounded-full border border-neutral-400/60 bg-neutral-300 relative"
      aria-label="Toggle dark mode"
    >
      <span
        className={cn(
          "absolute h-6 w-6 rounded-full border-0 shadow-sm bg-[#242824] transition-transform duration-300",
          isDark ? "translate-x-[calc(100%-4px)]" : "translate-x-1"
        )}
      />
    </button>
  )
}
