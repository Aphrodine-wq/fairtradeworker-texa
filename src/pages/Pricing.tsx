import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Sparkle, 
  CurrencyDollar, 
  ChartLine, 
  Users, 
  FileText,
  Brain,
  Shield,
  Megaphone,
  Crown,
  Hammer,
  House
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

interface PricingPageProps {
  user: User | null
  onNavigate: (page: string) => void
}

export const PricingPage = memo(function PricingPage({ user, onNavigate }: PricingPageProps) {
  const features = [
    {
      name: "AI Scoping",
      free: true,
      pro: true,
      description: "Smart job scoping with AI assistance"
    },
    {
      name: "Unlimited Job Postings",
      free: true,
      pro: true,
      description: "Post as many jobs as you need"
    },
    {
      name: "Zero Bidding Fees",
      free: true,
      pro: true,
      description: "Contractors keep 100% of earnings"
    },
    {
      name: "Basic CRM",
      free: true,
      pro: true,
      description: "Customer relationship management"
    },
    {
      name: "Invoice Management",
      free: true,
      pro: true,
      description: "Create and manage invoices"
    },
    {
      name: "Advanced Analytics",
      free: false,
      pro: true,
      description: "Detailed performance insights"
    },
    {
      name: "Automated Follow-ups",
      free: false,
      pro: true,
      description: "CRM automation and sequences"
    },
    {
      name: "Priority Support",
      free: false,
      pro: true,
      description: "24/7 priority customer support"
    },
    {
      name: "Custom Branding",
      free: false,
      pro: true,
      description: "White-label invoices and branding"
    },
    {
      name: "Advanced Workflows",
      free: false,
      pro: true,
      description: "Custom automation workflows"
    },
    {
      name: "Bid Boost",
      free: false,
      pro: true,
      description: "Boost bids to top of listings"
    },
    {
      name: "Revenue Dashboard",
      free: false,
      pro: true,
      description: "Advanced revenue analytics"
    }
  ]

  const contractorFeatures = [
    {
      name: "Browse All Jobs",
      free: true,
      pro: true
    },
    {
      name: "Place Unlimited Bids",
      free: true,
      pro: true
    },
    {
      name: "Basic Profile",
      free: true,
      pro: true
    },
    {
      name: "Job Notifications",
      free: true,
      pro: true
    },
    {
      name: "Advanced Filters",
      free: false,
      pro: true
    },
    {
      name: "Bid Analytics",
      free: false,
      pro: true
    },
    {
      name: "Smart Bid Suggestions",
      free: false,
      pro: true
    },
    {
      name: "Portfolio Builder",
      free: false,
      pro: true
    }
  ]

  const homeownerFeatures = [
    {
      name: "Post Jobs",
      free: true,
      pro: true,
      description: "$20 flat fee per job posting"
    },
    {
      name: "AI Photo Scoping",
      free: true,
      pro: true,
      description: "Get instant estimates from photos"
    },
    {
      name: "Multiple Bids",
      free: true,
      pro: true,
      description: "Receive bids from contractors"
    },
    {
      name: "Job Management",
      free: true,
      pro: true,
      description: "Track job progress"
    },
    {
      name: "Priority Listing",
      free: false,
      pro: true,
      description: "Boost your job to top of listings"
    },
    {
      name: "Advanced Analytics",
      free: false,
      pro: true,
      description: "Job performance insights"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <CurrencyDollar size={32} weight="duotone" className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground">
                Pricing
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent pricing. No hidden fees. Contractors keep 100% of earnings.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold mb-2">Free</CardTitle>
                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-foreground">$0</div>
                  <CardDescription className="text-base">Forever free</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.slice(0, 5).map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      <Check 
                        size={20} 
                        weight="bold" 
                        className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" 
                      />
                      <div>
                        <span className="font-medium text-foreground">{feature.name}</span>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 text-base font-semibold"
                  variant="outline"
                  onClick={() => onNavigate("signup")}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold">
                MOST POPULAR
              </div>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown size={24} weight="fill" className="text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-foreground">$59</div>
                  <CardDescription className="text-base">per month</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      <Check 
                        size={20} 
                        weight="bold" 
                        className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" 
                      />
                      <div>
                        <span className="font-medium text-foreground">{feature.name}</span>
                        {feature.description && (
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => onNavigate(user?.isPro ? "dashboard" : "pro-upgrade")}
                >
                  <Sparkle weight="fill" className="mr-2" size={18} />
                  {user?.isPro ? "Manage Subscription" : "Upgrade to Pro"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">Feature Comparison</h2>
              <p className="text-muted-foreground">See what's included in each plan</p>
            </div>

            {/* Contractor Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hammer size={24} weight="duotone" className="text-primary" />
                  <CardTitle className="text-2xl">For Contractors</CardTitle>
                </div>
                <CardDescription>Features available to contractors and subcontractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Free</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractorFeatures.map((feature, index) => (
                        <tr key={feature.name} className={cn("border-b border-border", index % 2 === 0 && "bg-muted/30")}>
                          <td className="py-3 px-4 font-medium text-foreground">{feature.name}</td>
                          <td className="py-3 px-4 text-center">
                            {feature.free ? (
                              <Check size={20} weight="bold" className="text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <X size={20} weight="bold" className="text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {feature.pro ? (
                              <Check size={20} weight="bold" className="text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <X size={20} weight="bold" className="text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Homeowner Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <House size={24} weight="duotone" className="text-primary" />
                  <CardTitle className="text-2xl">For Homeowners</CardTitle>
                </div>
                <CardDescription>Features available to homeowners posting jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Free</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeownerFeatures.map((feature, index) => (
                        <tr key={feature.name} className={cn("border-b border-border", index % 2 === 0 && "bg-muted/30")}>
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {feature.free ? (
                              <Check size={20} weight="bold" className="text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <X size={20} weight="bold" className="text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {feature.pro ? (
                              <Check size={20} weight="bold" className="text-green-600 dark:text-green-400 mx-auto" />
                            ) : (
                              <X size={20} weight="bold" className="text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Do contractors pay any fees?</h3>
                <p className="text-muted-foreground">
                  No! Contractors keep 100% of their earnings. There are zero bidding fees, zero commission, and zero hidden costs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">What does the $20 job posting fee cover?</h3>
                <p className="text-muted-foreground">
                  Homeowners pay a simple $20 flat fee to post a job. This covers platform costs, AI scoping, and access to our contractor network.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Can I cancel Pro anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! Pro is a month-to-month subscription. Cancel anytime with no penalties or fees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">What happens if I downgrade from Pro?</h3>
                <p className="text-muted-foreground">
                  You'll keep access to all free features. Pro features will be disabled at the end of your billing period.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold text-foreground">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of contractors and homeowners using FairTradeWorker
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold"
                onClick={() => onNavigate("signup", "contractor")}
              >
                <Hammer weight="fill" className="mr-2" size={20} />
                Sign Up as Contractor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold"
                onClick={() => onNavigate("signup", "homeowner")}
              >
                <House weight="fill" className="mr-2" size={20} />
                Sign Up as Homeowner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})