import { useState } from "react"
import { Hammer, DeviceMobile, CurrencyDollar, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { User, ContractorReferral } from "@/lib/types"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"

interface ContractorReferralSystemProps {
  user: User
}

export function ContractorReferralSystem({ user }: ContractorReferralSystemProps) {
  const [referrals, setReferrals] = useKV<ContractorReferral[]>("contractor-referrals", [])
  const [buddyName, setBuddyName] = useState("")
  const [buddyPhone, setBuddyPhone] = useState("")
  const [sending, setSending] = useState(false)

  const userReferrals = referrals?.filter(r => r.referrerId === user.id) || []
  const monthlyCount = userReferrals.filter(r => {
    const referralDate = new Date(r.createdAt)
    const now = new Date()
    return referralDate.getMonth() === now.getMonth() && referralDate.getFullYear() === now.getFullYear()
  }).length

  const canInviteMore = monthlyCount < 10
  const totalEarnings = userReferrals.filter(r => r.status === 'completed-first-job').reduce((sum, r) => sum + r.reward, 0)

  const handleInvite = async () => {
    if (!buddyName.trim() || !buddyPhone.trim()) {
      toast.error("Please enter both name and phone number")
      return
    }

    if (!canInviteMore) {
      toast.error("You've reached the 10 invites/month limit")
      return
    }

    setSending(true)

    const message = `Your boy ${user.fullName} just joined FairTradeWorker Texas – zero fees, same-day pay. Claim your county: https://fairtradeworker.com?contractor-ref=${user.id}`

    const newReferral: ContractorReferral = {
      id: `ref-${Date.now()}`,
      referrerId: user.id,
      referrerName: user.fullName,
      refereeName: buddyName,
      phone: buddyPhone,
      status: 'sent',
      reward: 50,
      createdAt: new Date().toISOString(),
    }

    setTimeout(() => {
      setReferrals((current) => [...(current || []), newReferral])
      toast.success(`Invite sent to ${buddyName}!`, {
        description: "You'll earn $50 when they complete their first job"
      })
      setBuddyName("")
      setBuddyPhone("")
      setSending(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-black border border-black/20 dark:border-white/20 p-3 rounded-md shadow-sm">
              <Hammer size={24} weight="bold" className="text-black dark:text-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">Invite a Tradesman</h3>
              <p className="text-sm opacity-90">Earn $50 per successful referral</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${totalEarnings}</div>
            <div className="text-sm text-black dark:text-white font-mono">Total Earned</div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t-2 border-black dark:border-white">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="buddy-name" className="text-black dark:text-white">Buddy's Name</Label>
              <Input
                id="buddy-name"
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                placeholder="Carlos"
                className="mt-1.5 bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black dark:placeholder:text-white font-mono"
              />
            </div>
            <div>
              <Label htmlFor="buddy-phone" className="text-black dark:text-white">Phone Number</Label>
              <Input
                id="buddy-phone"
                type="tel"
                value={buddyPhone}
                onChange={(e) => setBuddyPhone(e.target.value)}
                placeholder="(512) 555-0123"
                className="mt-1.5 bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black dark:placeholder:text-white font-mono"
              />
            </div>
          </div>

          <Button
            onClick={handleInvite}
            disabled={sending || !canInviteMore}
            className="w-full bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/80 h-12 text-lg font-bold"
          >
            <DeviceMobile size={20} className="mr-2" weight="bold" />
            {sending ? "Sending..." : `Send Invite (${monthlyCount}/10 this month)`}
          </Button>
        </div>
      </Card>

      {userReferrals.length > 0 && (
        <Card className="p-6">
          <h4 className="font-heading text-lg font-semibold mb-4">Your Referrals</h4>
          <div className="space-y-3">
            {userReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md shadow-sm">
                <div>
                  <p className="font-medium">{referral.refereeName}</p>
                  <p className="text-sm text-muted-foreground">{referral.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  {referral.status === 'completed-first-job' ? (
                    <>
                      <div className="flex items-center gap-1 text-black dark:text-white font-bold">
                        <CurrencyDollar size={18} weight="bold" />
                        <span>$50</span>
                      </div>
                      <CheckCircle size={20} weight="fill" className="text-black dark:text-white" />
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground capitalize">{referral.status.replace('-', ' ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
