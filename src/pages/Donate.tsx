import { Heart, CurrencyDollar, Users, Shield } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSection, StatsSection, GlassCard } from "@/components/ui/MarketingSections"
import { toast } from "sonner"

interface DonatePageProps {
  onNavigate?: (page: string) => void
}

export function DonatePage({ onNavigate }: DonatePageProps = {}) {
  const handleDonate = (amount: number) => {
    toast.success(`Thank you for your ${amount > 0 ? `$${amount}` : ''} donation!`, {
      description: "Your support helps us keep the platform fee-free for contractors."
    })
  }

  const stats = [
    { label: "Platform fees saved", value: "$892K", icon: CurrencyDollar },
    { label: "Active contractors", value: "4,800+", icon: Users },
    { label: "Zero contractor fees", value: "Always", icon: Shield },
    { label: "Community support", value: "100%", icon: Heart },
  ]

  const donationTiers = [
    {
      amount: 10,
      title: "Supporter",
      description: "Help cover server costs for one day",
      benefits: ["Supporter badge", "Our gratitude"]
    },
    {
      amount: 50,
      title: "Advocate",
      description: "Keep the platform running for a week",
      benefits: ["Advocate badge", "Monthly newsletter", "Our gratitude"],
      highlighted: true
    },
    {
      amount: 100,
      title: "Champion",
      description: "Fund development of new features",
      benefits: ["Champion badge", "Early access to features", "Monthly newsletter", "Our gratitude"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-10 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <HeroSection
          title="Support Fair Trade Worker"
          subtitle="Help us maintain a zero-fee platform for contractors. Your donations keep us sustainable while contractors keep 100% of their earnings."
          primaryAction={{ label: "Make a donation", onClick: () => window.scrollTo({ top: 400, behavior: 'smooth' }) }}
          secondaryAction={{ label: "Learn more", onClick: () => onNavigate?.('about') }}
        />

        <StatsSection stats={stats} />

        <GlassCard className="p-8 space-y-4">
          <h2 className="text-3xl font-bold text-center">Why donate?</h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            Unlike traditional platforms that take 15-30% of contractor earnings, we charge contractors $0.
            We sustain ourselves through homeowner posting fees and optional pro subscriptions. Your donations
            help us build new features, improve infrastructure, and keep the platform free for contractors forever.
          </p>
        </GlassCard>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Choose your support level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {donationTiers.map((tier) => (
              <GlassCard 
                key={tier.amount} 
                className={`p-6 ${tier.highlighted ? 'ring-2 ring-[#00FF00]' : ''}`}
              >
                <CardHeader>
                  <div className="text-center space-y-2">
                    <CardTitle className="text-2xl">{tier.title}</CardTitle>
                    <p className="text-4xl font-bold text-black dark:text-white">${tier.amount}</p>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <span className="text-[#00FF00] text-lg" aria-hidden="true">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handleDonate(tier.amount)}
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    Donate ${tier.amount}
                  </Button>
                </CardContent>
              </GlassCard>
            ))}
          </div>
        </div>

        <GlassCard className="p-8 space-y-4">
          <h2 className="text-3xl font-bold text-center">Custom amount</h2>
          <p className="text-center text-muted-foreground">
            Every dollar helps. Choose any amount that works for you.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[25, 75, 150, 250].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleDonate(amount)}
              >
                ${amount}
              </Button>
            ))}
            <Button onClick={() => handleDonate(0)}>Custom Amount</Button>
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 bg-white/60 dark:bg-black/40">
          <div className="flex items-center justify-center gap-3">
            <Heart weight="fill" className="text-[#FF0000]" size={32} />
            <h3 className="text-2xl font-bold">Thank you for your support!</h3>
          </div>
          <p className="text-center text-muted-foreground">
            Your generosity helps thousands of contractors keep 100% of what they earn.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
