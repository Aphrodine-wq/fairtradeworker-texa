import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Crown, Clock, Shield, Calendar, ChartLine, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User } from '@/lib/types'
import { UnifiedPaymentScreen } from '@/components/payments/UnifiedPaymentScreen'

interface HomeownerProUpgradeProps {
  user: User
  onNavigate: (page: string) => void
}

export function HomeownerProUpgrade({ user, onNavigate }: HomeownerProUpgradeProps) {
  const [users, setUsers] = useKV<User[]>('users', [])
  const [paymentOpen, setPaymentOpen] = useState(false)

  const handleUpgrade = () => {
    setPaymentOpen(true)
  }

  const handlePaymentComplete = (paymentId: string) => {
    setUsers((currentUsers) =>
      (currentUsers || []).map(u =>
        u.id === user.id
          ? { ...u, isHomeownerPro: true, homeownerProSince: new Date().toISOString() }
          : u
      )
    )
    
    toast.success("Welcome to Homeowner Pro! 🎉")
    setTimeout(() => {
      onNavigate('dashboard')
    }, 1000)
  }

  if (user.isHomeownerPro) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Crown className="text-accent mb-4" size={64} weight="fill" />
              <h2 className="text-3xl font-bold mb-2">You're already Homeowner Pro!</h2>
              <p className="text-muted-foreground text-center mb-6">
                Enjoy all the premium features
              </p>
              <Button onClick={() => onNavigate('dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: <Clock weight="fill" size={24} />,
      title: "Priority Scheduling",
      description: "Get priority placement for your jobs. Contractors see priority badges and respond faster with guaranteed response times."
    },
    {
      icon: <Shield weight="fill" size={24} />,
      title: "Extended Service Guarantees",
      description: "90-day guarantee on all work (vs. standard 30 days). Peace of mind with longer protection periods."
    },
    {
      icon: <Calendar weight="fill" size={24} />,
      title: "Maintenance Planning Tools",
      description: "Annual maintenance calendar, service reminders, and cost tracking. Never miss important home maintenance tasks."
    },
    {
      icon: <Users weight="fill" size={24} />,
      title: "Direct Operator Communication",
      description: "Direct chat and messaging with territory operators. Priority support channel for faster assistance."
    },
    {
      icon: <ChartLine weight="fill" size={24} />,
      title: "Advanced Home Analytics",
      description: "Track total maintenance spend, service history, ROI on improvements, and home value impact estimates."
    }
  ]

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground px-4 py-2 text-base mb-4">
            <Crown weight="fill" className="mr-2" />
            HOMEOWNER PRO
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Upgrade to Homeowner Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Premium features for serious homeowners
          </p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-5xl font-bold mb-2">
              $25<span className="text-2xl text-muted-foreground">/mo</span>
            </CardTitle>
            <CardDescription className="text-base text-black dark:text-white">
              Cancel anytime, no commitment • 30-day money-back guarantee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-black dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-black dark:text-white leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="pt-6">
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={handleUpgrade}
              >
                <Crown weight="fill" className="mr-2" size={24} />
                Start Homeowner Pro – $25/mo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <UnifiedPaymentScreen
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        paymentType="subscription"
        amount={25}
        title="Homeowner Pro Subscription"
        description="Monthly subscription to Homeowner Pro features"
        user={user}
        onPaymentComplete={handlePaymentComplete}
        enableRecurring={true}
        recurringInterval="monthly"
      />
    </div>
  )
}
