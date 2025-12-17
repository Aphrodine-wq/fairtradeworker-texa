import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrutalistGlassCard, GlassCardContent } from "@/components/ui/BrutalistGlassCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Crown, Lightning, Bell, Shield, FileText, CheckCircle, Brain, ChartBar } from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { UnifiedPaymentScreen } from "@/components/payments/UnifiedPaymentScreen"

interface ProUpgradeProps {
  user: User
  onNavigate: (page: string) => void
}

export function ProUpgrade({ user, onNavigate }: ProUpgradeProps) {
  const [users, setUsers] = useKV<User[]>("users", [])
  const [paymentOpen, setPaymentOpen] = useState(false)

  const handleUpgrade = () => {
    setPaymentOpen(true)
  }

  const handlePaymentComplete = (paymentId: string) => {
    setUsers((currentUsers) =>
      (currentUsers || []).map(u =>
        u.id === user.id
          ? { ...u, isPro: true, proSince: new Date().toISOString() }
          : u
      )
    )
    
    toast.success("Welcome to Pro! 🎉")
    setTimeout(() => {
      onNavigate('dashboard')
    }, 1000)
  }

  if (user.isPro) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Crown className="text-accent mb-4" size={64} weight="fill" />
              <h2 className="text-3xl font-bold mb-2">You're already Pro!</h2>
              <p className="text-muted-foreground text-center mb-6">
                Enjoy all the premium features
              </p>
              <Button onClick={() => onNavigate('dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

      <UnifiedPaymentScreen
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        paymentType="subscription"
        amount={59}
        title="Pro Subscription"
        description="Monthly subscription to Pro features"
        user={user}
        onPaymentComplete={handlePaymentComplete}
        enableRecurring={true}
        recurringInterval="monthly"
      />
      </div>
    )
  }

  const features = [
    {
      icon: <Lightning weight="fill" size={24} />,
      title: "Instant Payouts",
      description: "Get paid in 30 minutes instead of waiting 3-5 days. Low 1% fee capped at $5 per transaction. Never wait for your money again."
    },
    {
      icon: <Bell weight="fill" size={24} />,
      title: "Auto Invoice Reminders",
      description: "Intelligent payment reminders sent automatically 3 days before due dates, on due dates, and 7 days after. Increase collection rates by 30%."
    },
    {
      icon: <Shield weight="fill" size={24} />,
      title: "No-Show Protection",
      description: "Automatically charge a $50 no-show fee when homeowners don't show up for scheduled appointments. Protects your time and reduces wasted trips."
    },
    {
      icon: <FileText weight="fill" size={24} />,
      title: "Tax Export & Reports",
      description: "Download comprehensive yearly earnings reports formatted for tax filing. Includes categorized expenses, mileage logs, and all deductions."
    },
    {
      icon: <Brain weight="fill" size={24} />,
      title: "AI Bid Intelligence",
      description: "Get AI-powered bid recommendations based on your win/loss history, market data, and job characteristics. Maximize your win rate and profitability."
    },
    {
      icon: <ChartBar weight="fill" size={24} />,
      title: "Advanced Analytics Dashboard",
      description: "Deep business intelligence with profit forecasting, customer lifetime value tracking, seasonal trends analysis, and predictive insights to grow your business."
    }
  ]

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground px-4 py-2 text-base mb-4">
            <Crown weight="fill" className="mr-2" />
            PRO MEMBERSHIP
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Premium tools for serious contractors
          </p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-5xl font-bold mb-2">
              $59<span className="text-2xl text-muted-foreground">/mo</span>
            </CardTitle>
            <CardDescription className="text-base text-black dark:text-white">
              Cancel anytime, no commitment • 30-day money-back guarantee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <BrutalistGlassCard key={idx} glass={true} className="p-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm text-white dark:text-black">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-black dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-black dark:text-white leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </BrutalistGlassCard>
              ))}
            </div>

            <div className="pt-6">
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={handleUpgrade}
              >
                <Crown weight="fill" className="mr-2" size={24} />
                Start Pro – $59/mo
              </Button>
            </div>

            <div className="border-t-2 border-black dark:border-white pt-6 space-y-4">
              <h3 className="font-bold text-lg text-center text-black dark:text-white mb-4">What Pro Members Get:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>Unlimited CRM contacts</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>15% higher bid visibility</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>Route optimization</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>Repeat customer engine</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <CheckCircle weight="fill" className="text-green-600 dark:text-green-400 shrink-0" size={18} />
                  <span>Win/loss analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UnifiedPaymentScreen
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        paymentType="subscription"
        amount={59}
        title="Pro Subscription"
        description="Monthly subscription to Pro features"
        user={user}
        onPaymentComplete={handlePaymentComplete}
        enableRecurring={true}
        recurringInterval="monthly"
      />
    </div>
  )
}
