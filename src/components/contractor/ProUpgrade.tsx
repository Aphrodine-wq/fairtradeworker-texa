import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { Crown, Lightning, Bell, Shield, FileText, CheckCircle } from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ProUpgradeProps {
  user: User
  onNavigate: (page: string) => void
}

export function ProUpgrade({ user, onNavigate }: ProUpgradeProps) {
  const [users, setUsers] = useKV<User[]>("users", [])

  const handleUpgrade = () => {
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
      </div>
    )
  }

  const features = [
    {
      icon: <Lightning weight="fill" size={24} />,
      title: "Instant Payouts",
      description: "Get paid immediately instead of waiting 3-5 days. 1% fee capped at $5."
    },
    {
      icon: <Bell weight="fill" size={24} />,
      title: "Auto Invoice Reminders",
      description: "Automatic payment reminders sent 3 days before and after due dates."
    },
    {
      icon: <Shield weight="fill" size={24} />,
      title: "No-Show Protection",
      description: "Charge $50 fee when homeowners don't show up for scheduled appointments."
    },
    {
      icon: <FileText weight="fill" size={24} />,
      title: "Tax Export",
      description: "Download yearly earnings reports formatted for tax filing."
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
              $39<span className="text-2xl text-muted-foreground">/mo</span>
            </CardTitle>
            <CardDescription className="text-base">
              Cancel anytime, no commitment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={handleUpgrade}
              >
                <Crown weight="fill" className="mr-2" size={24} />
                Start Pro – $39/mo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
              <CheckCircle weight="fill" className="text-accent" />
              <span>30-day money-back guarantee</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
