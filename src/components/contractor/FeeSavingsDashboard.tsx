import { Card } from "@/components/ui/card"
import { CurrencyDollar, TrendUp, CalendarBlank, Medal } from "@phosphor-icons/react"
import { motion } from "framer-motion"

interface FeeSavingsDashboardProps {
  totalEarningsThisYear: number
  jobsCompletedThisYear: number
  averageJobValue: number
}

const COMPETITOR_FEES = {
  thumbtack: 0.15,
  homeadvisor: 0.20,
  angi: 0.18,
  taskrabbit: 0.26,
}

export function FeeSavingsDashboard({ 
  totalEarningsThisYear, 
  jobsCompletedThisYear,
  averageJobValue 
}: FeeSavingsDashboardProps) {
  
  const calculateSavings = (feePercentage: number) => {
    return totalEarningsThisYear * feePercentage
  }

  const thumbtackSavings = calculateSavings(COMPETITOR_FEES.thumbtack)
  const homeadvisorSavings = calculateSavings(COMPETITOR_FEES.homeadvisor)
  const angiSavings = calculateSavings(COMPETITOR_FEES.angi)
  const taskrabbitSavings = calculateSavings(COMPETITOR_FEES.taskrabbit)

  const projectedYearlyEarnings = (totalEarningsThisYear / (new Date().getMonth() + 1)) * 12
  const projectedYearlySavings = projectedYearlyEarnings * COMPETITOR_FEES.homeadvisor

  const fiveYearSavings = projectedYearlySavings * 5

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card className="p-8 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Medal className="w-6 h-6 text-green-600 dark:text-green-400" weight="fill" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  You're Keeping 100% of Your Earnings
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Other platforms would have taken ${homeadvisorSavings.toLocaleString()} to ${taskrabbitSavings.toLocaleString()} from you this year
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${totalEarningsThisYear.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Year to Date
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
                <CurrencyDollar className="w-6 h-6 text-red-600 dark:text-red-400" weight="bold" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground">Fees You've Avoided</h4>
                  <p className="text-sm text-muted-foreground">If you'd used competitor platforms</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Thumbtack (15%)</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${thumbtackSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">HomeAdvisor (20%)</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${homeadvisorSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">Angi (18%)</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${angiSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">TaskRabbit (26%)</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${taskrabbitSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">FairTradeWorker Fee</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $0
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You keep every dollar you earn
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <TrendUp className="w-6 h-6 text-blue-600 dark:text-blue-400" weight="bold" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground">Future Savings</h4>
                  <p className="text-sm text-muted-foreground">Your projected advantage</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-muted-foreground">This Year (Projected)</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${projectedYearlySavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                        style={{ width: `${((new Date().getMonth() + 1) / 12) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on current pace: ${projectedYearlyEarnings.toLocaleString()} annual earnings
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarBlank className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        5-Year Projection
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      ${fiveYearSavings.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      That's a down payment on a house, a work truck, or your kids' college fund
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex-shrink-0">
              <Medal className="w-6 h-6 text-amber-600 dark:text-amber-400" weight="fill" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                What You Could Do With Your Savings
              </h4>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                  <div className="font-semibold text-amber-900 dark:text-amber-100">
                    ${(homeadvisorSavings / 12).toFixed(0)}/month
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    New truck payment
                  </div>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                  <div className="font-semibold text-amber-900 dark:text-amber-100">
                    ${homeadvisorSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    Family vacation
                  </div>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                  <div className="font-semibold text-amber-900 dark:text-amber-100">
                    ${fiveYearSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    Retirement fund start
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
