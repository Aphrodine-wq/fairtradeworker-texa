import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Users, 
  Plus,
  Share,
  Gift,
  CheckCircle,
  Clock,
  TrendingUp
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ReferralsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function ReferralsPage({ user, onNavigate }: ReferralsPageProps) {
  const [referralCode] = useState("CONTRACTOR2025")
  
  const referrals = [
    { 
      id: 1, 
      name: "John Smith", 
      email: "john@example.com", 
      status: "signed_up", 
      date: "2025-01-15",
      reward: "$25"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      email: "sarah@example.com", 
      status: "pending", 
      date: "2025-01-18",
      reward: "Pending"
    },
    { 
      id: 3, 
      name: "Mike Davis", 
      email: "mike@example.com", 
      status: "signed_up", 
      date: "2025-01-10",
      reward: "$25"
    },
  ]

  const stats = {
    totalReferrals: referrals.length,
    successful: referrals.filter(r => r.status === 'signed_up').length,
    totalEarned: "$50",
    pending: referrals.filter(r => r.status === 'pending').length
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-black dark:bg-white">
              <Users size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Referrals</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Earn rewards by referring contractors and homeowners
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 border-2 border-transparent dark:border-white bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-2">Your Referral Code</h3>
                <div className="flex items-center gap-3">
                  <Input 
                    value={referralCode} 
                    readOnly 
                    className="text-xl font-mono font-bold bg-white dark:bg-black border-transparent dark:border-white"
                  />
                  <Button 
                    variant="outline" 
                    className="border-transparent dark:border-white text-black dark:text-white"
                    onClick={() => navigator.clipboard.writeText(referralCode)}
                  >
                    <Share size={16} className="mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-black/60 dark:text-white/60 mt-2">
                  Share this code with friends and earn $25 for each successful referral
                </p>
              </div>
              <div className="text-center">
                <Gift size={48} className="mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{stats.totalEarned}</p>
                <p className="text-xs text-black/60 dark:text-white/60">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.totalReferrals}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successful}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-primary">{stats.totalEarned}</p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <Card className="border-2 border-transparent dark:border-white">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Your Referrals</CardTitle>
            <CardDescription className="text-black/60 dark:text-white/60">
              Track the status of your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-black dark:text-white">{referral.name}</h4>
                      <Badge 
                        variant={referral.status === 'signed_up' ? 'default' : 'secondary'}
                        className={referral.status === 'signed_up' 
                          ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300" 
                          : "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
                        }
                      >
                        {referral.status === 'signed_up' ? (
                          <CheckCircle size={12} className="mr-1" />
                        ) : (
                          <Clock size={12} className="mr-1" />
                        )}
                        {referral.status === 'signed_up' ? 'Signed Up' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-1">{referral.email}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">Referred on: {referral.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{referral.reward}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">Reward</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
