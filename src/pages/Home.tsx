import { House, Hammer, MapTrifold, Play, CurrencyDollar, Shield, Brain, FileText, ChartLine, UsersThree, Megaphone, Lock } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { LiveStatsBar } from "@/components/viral/LiveStatsBar"
import type { Job, User } from "@/lib/types"
import { DEMO_USERS } from "@/lib/demoData"
import { memo, useMemo } from "react"
import { HeroSection, FeatureSection, PricingSection, RatingSection, TrustBarSection, TestimonialsSection, FAQSection, HowItWorksSection } from "@/components/ui/MarketingSections"
import { PostMyJobButton } from "@/components/jobs/PostMyJobButton"
import { ServiceCategories } from "@/components/jobs/ServiceCategories"

interface HomePageProps {
  onNavigate: (page: string, role?: string) => void
  onDemoLogin?: (user: User) => void
}

export const HomePage = memo(function HomePage({ onNavigate, onDemoLogin }: HomePageProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [currentUser] = useKV<User | null>("current-user", null)


  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}
    >
      <div className="w-full pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <HeroSection
          title="Zero-Fee Home Services Marketplace"
          subtitle="Contractors keep 100% of earnings. Homeowners get fair, transparent prices."
          bullets={[
            "Zero platform fees for contractors",
            "Instant competitive bids for homeowners",
            "Modern AI tools included",
            "Full payment security"
          ]}
          primaryAction={{ label: "Get Started", onClick: () => onNavigate("signup") }}
          secondaryAction={{ label: "Learn More", onClick: () => onNavigate("about") }}
        />

        <TrustBarSection />

        <PostMyJobButton onNavigate={onNavigate} />

        <ServiceCategories onNavigate={onNavigate} />

        <div className="mt-16"></div>

        <HowItWorksSection />

        <FeatureSection
          onNavigate={onNavigate}
          features={[
            { title: "AI Scoping", description: "Smart Claude Tiering routes simple vs. complex scopes with budget guardrails.", icon: Brain },
            { title: "Smart Invoicing", description: "Automated invoices with late fees, reminders, and recurring billing.", icon: FileText },
            { title: "Analytics Dashboard", description: "Real-time insights into earnings, job performance, and market trends.", icon: ChartLine },
            { title: "CRM Suite", description: "List/pipeline/analytics views with customer lifetime metrics and sequences.", icon: UsersThree },
            { title: "Boosted Listings", description: "Paid visibility upgrades to get more bids on your jobs.", icon: Megaphone },
            { title: "Secure Payments", description: "Stripe-ready payment processing with transparent fees.", icon: Shield },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            variant="ghost"
            className="text-lg px-8 py-6 h-auto bg-white dark:bg-black shadow-lg hover:shadow-xl"
            onClick={() => onNavigate("signup", "homeowner")}
          >
            <House weight="fill" className="mr-3" size={24} />
            I'm a Homeowner
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-lg px-8 py-6 h-auto bg-white dark:bg-black shadow-lg hover:shadow-xl"
            onClick={() => onNavigate("signup", "contractor")}
          >
            <Hammer weight="fill" className="mr-3" size={24} />
            I'm a Contractor/Subcontractor
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-lg px-8 py-6 h-auto bg-white dark:bg-black shadow-lg hover:shadow-xl"
            onClick={() => onNavigate("signup", "operator")}
          >
            <MapTrifold weight="fill" className="mr-3" size={24} />
            I'm an Operator
          </Button>
        </div>

        {onDemoLogin && (
          <Card className="mt-8 mb-8 p-6 border-0 hover:shadow-xl transition-shadow max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Play weight="fill" size={24} className="text-primary" />
                <h3 className="text-xl font-bold">Try Demo Mode</h3>
              </div>
              <p className="text-base text-muted-foreground">Explore the platform instantly with pre-populated demo accounts for each user type.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 text-base font-semibold flex items-center justify-center gap-2" 
                  onClick={() => onDemoLogin(DEMO_USERS.homeowner)}
                >
                  <House weight="fill" size={20} />
                  Homeowner
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 text-base font-semibold flex items-center justify-center gap-2" 
                  onClick={() => onDemoLogin(DEMO_USERS.contractor)}
                >
                  <Hammer weight="fill" size={20} />
                  Contractor
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 text-base font-semibold flex items-center justify-center gap-2" 
                  onClick={() => onDemoLogin(DEMO_USERS.operator)}
                >
                  <MapTrifold weight="fill" size={20} />
                  Operator
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 text-base font-semibold flex items-center justify-center gap-2" 
                  onClick={() => onNavigate('admin-dashboard')}
                >
                  <Shield weight="fill" size={20} />
                  Admin
                </Button>
              </div>
            </div>
          </Card>
        )}

        <TestimonialsSection />

        <PricingSection user={currentUser} onNavigate={onNavigate} />

        <FAQSection />
        
        <RatingSection />
      </div>
    </div>
  )
})
