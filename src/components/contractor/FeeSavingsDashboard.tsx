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
        <Card className="p-8 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Medal className="w-6 h-6 text-black dark:text-white" weight="fill" />
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  You're Keeping 100% of Your Earnings
                </h3>
              </div>
              <p className="text-black dark:text-white/80 text-sm">
                Other platforms would have taken ${homeadvisorSavings.toLocaleString()} to ${taskrabbitSavings.toLocaleString()} from you this year
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-black dark:text-white">
                ${totalEarningsThisYear.toLocaleString()}
              </div>
              <div className="text-sm text-black dark:text-white font-medium">
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
              <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                <CurrencyDollar className="w-6 h-6 text-black dark:text-white" weight="bold" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-black dark:text-white">Fees You've Avoided</h4>
                  <p className="text-sm text-black dark:text-white">If you'd used competitor platforms</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <span className="text-sm">Thumbtack (15%)</span>
                    <span className="font-semibold text-black dark:text-white">
                      ${thumbtackSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <span className="text-sm">HomeAdvisor (20%)</span>
                    <span className="font-semibold text-black dark:text-white">
                      ${homeadvisorSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <span className="text-sm">Angi (18%)</span>
                    <span className="font-semibold text-black dark:text-white">
                      ${angiSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none font-mono shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <span className="text-sm">TaskRabbit (26%)</span>
                    <span className="font-semibold text-black dark:text-white">
                      ${taskrabbitSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-black dark:text-white">FairTradeWorker Fee</span>
                    <span className="text-2xl font-bold text-black dark:text-white">
                      $0
                    </span>
                  </div>
                  <p className="text-xs text-black dark:text-white mt-1">
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
              <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                <TrendUp className="w-6 h-6 text-black dark:text-white" weight="bold" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-black dark:text-white">Future Savings</h4>
                  <p className="text-sm text-black dark:text-white">Your projected advantage</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-black dark:text-white">This Year (Projected)</span>
                      <span className="text-xl font-bold text-black dark:text-white">
                        ${projectedYearlySavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-4 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none overflow-hidden shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                      <div 
                        className="h-full bg-black dark:bg-white rounded-full"
                        style={{ width: `${((new Date().getMonth() + 1) / 12) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-black dark:text-white mt-1">
                      Based on current pace: ${projectedYearlyEarnings.toLocaleString()} annual earnings
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-black rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarBlank className="w-5 h-5 text-black dark:text-white" />
                      <span className="font-semibold text-black dark:text-white">
                        5-Year Projection
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-black dark:text-white mb-1">
                      ${fiveYearSavings.toLocaleString()}
                    </div>
                    <p className="text-sm text-black dark:text-white/80">
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
        <Card className="p-6" glass={user.isPro}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg flex-shrink-0">
              <Medal className="w-6 h-6 text-black dark:text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-black dark:text-white mb-2">
                What You Could Do With Your Savings
              </h4>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <div className="font-semibold text-black dark:text-white">
                    ${(homeadvisorSavings / 12).toFixed(0)}/month
                  </div>
                  <div className="text-sm text-black dark:text-white/80">
                    New truck payment
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <div className="font-semibold text-black dark:text-white">
                    ${homeadvisorSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-black dark:text-white/80">
                    Family vacation
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <div className="font-semibold text-black dark:text-white">
                    ${fiveYearSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-black dark:text-white/80">
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
