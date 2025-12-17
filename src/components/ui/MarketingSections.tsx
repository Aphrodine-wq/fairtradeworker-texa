import React, { useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, Star, Robot, FileText, ChartLine, UsersThree, Megaphone, Shield, Sparkle, Brain, BarChart, Lock } from "@phosphor-icons/react"
import { UnifiedPaymentScreen } from "@/components/payments/UnifiedPaymentScreen"
import type { User } from "@/lib/types"

type NavLink = { label: string; href?: string; active?: boolean }

export function GlassCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("glass-card border-0", className)} {...props} />
}

export function GlassNav({ children }: { brand?: any; links?: NavLink[]; primaryLabel?: string; onPrimaryClick?: () => void; children?: React.ReactNode }) {
  // GlassNav is disabled; return children only to avoid duplicate navigation bars
  return <>{children}</>
}

export function HeroSection({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
}: {
  title: string
  subtitle: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}) {
  return (
    <GlassCard className="p-8 mb-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">{subtitle}</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {primaryAction && (
            <Button 
              className="px-5 py-3 text-base"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline" 
              className="px-5 py-3 text-base"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

export function StatsSection({
  stats,
}: {
  stats: Array<{ label: string; value: string; icon?: React.ElementType; tone?: string }>
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
      {stats.map((stat) => {
        const Icon = stat.icon || Users
        const tone = stat.tone || "primary"
        const bg = tone === "green" ? "bg-green-100 dark:bg-green-900" : "bg-primary-100 dark:bg-primary-900"
        const fg = tone === "green" ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400"
        return (
          <GlassCard key={stat.label} className="stats-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 stats-icon">
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
        )
      })}
    </div>
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
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Platform Features</h2>
        <p className="mt-2 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
          Everything you need to manage your home services business
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
        {features.map((feature) => {
          // Use explicit icon if provided, otherwise try to match from map
          const Icon = feature.icon || featureIconMap[feature.title.toLowerCase()] || Sparkle
          const route = getFeatureRoute(feature.title)
          const handleClick = () => {
            if (route && onNavigate) {
              onNavigate(route)
            }
          }
          return (
            <GlassCard 
              key={feature.title} 
              className={cn(
                "feature-card p-6 hover-lift text-center",
                route && onNavigate && "cursor-pointer"
              )}
              onClick={handleClick}
            >
              <div className="feature-icon h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 mx-auto">
                <Icon className="text-gray-600 dark:text-gray-300 text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-1 sm:mt-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{feature.description}</p>
            </GlassCard>
          )
        })}
      </div>
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
      price: "Free",
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
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
        <p className="mt-2 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">Choose the plan that works for you</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <GlassCard key={tier.name} className={`pricing-card ${tier.highlighted ? 'ring-2 ring-black dark:ring-white' : ''}`}>
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
        ))}
      </div>
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
          "absolute h-6 w-6 rounded-full border border-black/30 bg-[#242824] transition-transform duration-300",
          isDark ? "translate-x-[calc(100%-4px)]" : "translate-x-1"
        )}
      />
    </button>
  )
}
