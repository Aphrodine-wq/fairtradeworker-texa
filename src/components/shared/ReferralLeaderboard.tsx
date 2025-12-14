/**
 * Referral Leaderboard
 * Free Feature - Public ranking of top referrers
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy,
  Medal,
  Star
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface ReferralLeaderboardProps {
  user?: User
  period?: 'monthly' | 'all-time'
}

export function ReferralLeaderboard({ user, period = 'monthly' }: ReferralLeaderboardProps) {
  const [users] = useLocalKV<User[]>("users", [])

  const leaderboard = useMemo(() => {
    return users
      .filter(u => u.referralEarnings > 0 || (u.referralCode && u.referralEarnings))
      .map(u => ({
        id: u.id,
        name: u.fullName,
        earnings: u.referralEarnings || 0,
        referrals: u.contractorInviteCount || 0
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10)
      .map((entry, idx) => ({
        ...entry,
        rank: idx + 1
      }))
  }, [users])

  const userRank = useMemo(() => {
    if (!user) return null
    const index = leaderboard.findIndex(e => e.id === user.id)
    return index >= 0 ? index + 1 : null
  }, [leaderboard, user])

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy weight="duotone" size={24} />
          Referral Leaderboard
        </CardTitle>
        <CardDescription>
          Top referrers {period === 'monthly' ? 'this month' : 'all-time'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderboard.length === 0 ? (
          <p className="text-center text-black dark:text-white py-8">
            No referrals yet. Be the first!
          </p>
        ) : (
          <>
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 border-2 flex items-center justify-between ${
                  entry.id === user?.id
                    ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                    : 'border-black dark:border-white'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-black font-bold text-black dark:text-white">
                    {entry.rank <= 3 ? (
                      entry.rank === 1 ? (
                        <Trophy size={24} weight="fill" className="text-yellow-400" />
                      ) : entry.rank === 2 ? (
                        <Medal size={24} weight="fill" className="text-gray-300" />
                      ) : (
                        <Medal size={24} weight="fill" className="text-amber-600" />
                      )
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black dark:text-white">
                      {entry.name}
                      {entry.id === user?.id && (
                        <Badge variant="outline" className="ml-2">You</Badge>
                      )}
                    </h3>
                    <p className="text-xs text-black dark:text-white">
                      {entry.referrals} referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black dark:text-white">
                      ${entry.earnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-black dark:text-white">earned</p>
                  </div>
                </div>
              </div>
            ))}

            {userRank && userRank > 10 && (
              <div className="p-4 border border-black/20 dark:border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-black font-bold text-black dark:text-white">
                      {userRank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                        {user?.fullName}
                        <Badge variant="outline">You</Badge>
                      </h3>
                      <p className="text-xs text-black dark:text-white">
                        {user?.contractorInviteCount || 0} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black dark:text-white">
                      ${(user?.referralEarnings || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-black dark:text-white">earned</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
