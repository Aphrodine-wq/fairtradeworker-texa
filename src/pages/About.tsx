import { Heart, Shield, Hammer, House, MapTrifold, Zap, Gauge, Lightning } from "@phosphor-icons/react"
import { HeroSection, StatsSection, GlassCard, FeatureSection } from "@/components/ui/MarketingSections"

interface AboutPageProps {
  onNavigate?: (page: string) => void
}

export function AboutPage({ onNavigate }: AboutPageProps = {}) {
  const stats = [
    { label: "Contractors onboarded", value: "4,800+", icon: Hammer },
    { label: "Homeowners served", value: "12,000+", icon: House },
    { label: "Avg. bid speed", value: "< 4 min", icon: Lightning },
    { label: "Satisfaction", value: "4.9 / 5", icon: MapTrifold },
  ]

  const values = [
    {
      title: "Zero platform fees",
      description: "Contractors keep 100% of earnings; homeowners see transparent pricing.",
      icon: Shield,
    },
    {
      title: "AI-first scoping",
      description: "Smart Claude tiering scopes jobs in under a minute with budget guardrails.",
      icon: Zap,
    },
    {
      title: "Open marketplace",
      description: "No gatekeeping—relevance, quality, and performance decide ranking, not paywalls.",
      icon: Heart,
    },
  ]

  const howItWorks = [
    {
      title: "Post your job",
      description: "Upload photos, video, or voice. AI returns scope + price window in seconds.",
      icon: House,
    },
    {
      title: "Review bids",
      description: "Qualified contractors respond quickly. Compare price, quality, and speed.",
      icon: Hammer,
    },
    {
      title: "Hire & pay",
      description: "Direct payment and zero platform fees keep costs fair for everyone.",
      icon: MapTrifold,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <HeroSection
          title="Built for fair, zero-fee home services"
          subtitle="We connect homeowners and contractors with transparent pricing, AI-powered scoping, and a marketplace where quality—not fees—wins."
          primaryAction={{ label: "Get started", onClick: () => onNavigate?.('signup') }}
          secondaryAction={{ label: "See how it works", onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }}
        />

        <StatsSection stats={stats} />

        <GlassCard className="p-8 space-y-4">
          <h2 className="text-3xl font-bold">Our mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Eliminate unfair marketplace fees and create a level playing field for home service professionals. We keep
            the platform open, transparent, and fast so contractors keep every dollar they earn and homeowners get clear,
            comparable bids.
          </p>
        </GlassCard>

        <FeatureSection features={values.map((v) => ({ title: v.title, description: v.description, icon: v.icon }))} />

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <GlassCard key={item.title} className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <GlassCard className="p-8 space-y-4">
          <h2 className="text-3xl font-bold text-center">Performance = priority</h2>
          <p className="text-muted-foreground text-center">
            Bids sort by contractor performance score, accuracy, and completion rate—so homeowners always see the best
            options first and contractors win by delivering great work.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard className="p-4 bg-white/60 dark:bg-black/40">
              <h3 className="font-semibold">Operator view</h3>
              <p className="text-sm text-muted-foreground">Track job-to-bid speed, acceptance, and territory growth.</p>
            </GlassCard>
            <GlassCard className="p-4 bg-white/60 dark:bg-black/40">
              <h3 className="font-semibold">Quality guardrails</h3>
              <p className="text-sm text-muted-foreground">Safety, compliance, and bid sanity checks keep the marketplace healthy.</p>
            </GlassCard>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
