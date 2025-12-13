import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  ArrowsClockwise, 
  TrendUp, 
  CheckCircle, 
  Clock, 
  Warning,
  Bank,
  Receipt,
  ChartBar
} from '@phosphor-icons/react'
import { ContractorPayouts } from './ContractorPayouts'
import type { User, Invoice, Job } from '@/lib/types'

interface PaymentDashboardProps {
  user: User
}

export function PaymentDashboard({ user }: PaymentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const paymentStats = {
    totalProcessed: 127450,
    thisMonth: 12340,
    pendingPayouts: 2450,
    averageTransactionSize: 875,
    transactionCount: 147,
    successRate: 98.6,
    averagePayoutTime: user.isPro ? 0.5 : 2.5,
    savedInFees: 18420
  }

  const recentTransactions = [
    {
      id: '1',
      type: 'payout' as const,
      amount: 1250,
      status: 'completed' as 'completed' | 'pending' | 'failed',
      date: '2024-03-18',
      description: 'Bathroom Remodel - Final Payment',
      method: user.isPro ? 'instant' : 'standard'
    },
    {
      id: '2',
      type: 'payment' as const,
      amount: 485,
      status: 'completed' as 'completed' | 'pending' | 'failed',
      date: '2024-03-17',
      description: 'Water Heater Replacement',
      method: 'card'
    },
    {
      id: '3',
      type: 'payout' as const,
      amount: 715,
      status: 'pending' as 'completed' | 'pending' | 'failed',
      date: '2024-03-17',
      description: 'Kitchen Cabinet Installation',
      method: 'standard'
    },
    {
      id: '4',
      type: 'payment' as const,
      amount: 2850,
      status: 'completed' as 'completed' | 'pending' | 'failed',
      date: '2024-03-15',
      description: 'Deck Build - Milestone 1',
      method: 'card'
    },
    {
      id: '5',
      type: 'refund' as const,
      amount: 150,
      status: 'completed' as 'completed' | 'pending' | 'failed',
      date: '2024-03-14',
      description: 'Cancelled Service Call',
      method: 'card'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
        <p className="text-muted-foreground">
          Manage your payments, payouts, and financial overview
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">
            <ChartBar className="mr-2" size={18} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Bank className="mr-2" size={18} />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="mr-2" size={18} />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Processed</CardDescription>
                <CardTitle className="text-2xl">
                  ${paymentStats.totalProcessed.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendUp className="mr-1 text-black dark:text-white" size={16} weight="bold" />
                  <span className="text-black dark:text-white font-semibold mr-1">+23%</span>
                  vs last year
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>This Month</CardDescription>
                <CardTitle className="text-2xl">
                  ${paymentStats.thisMonth.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {paymentStats.transactionCount} transactions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Payouts</CardDescription>
                <CardTitle className="text-2xl">
                  ${paymentStats.pendingPayouts.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Avg {paymentStats.averagePayoutTime}hr clearance
                </div>
              </CardContent>
            </Card>

            <Card className="border border-black/10 dark:border-white/10">
              <CardHeader className="pb-3">
                <CardDescription>Fees Saved (vs 15%)</CardDescription>
                <CardTitle className="text-2xl text-black dark:text-white">
                  ${paymentStats.savedInFees.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-1 text-black dark:text-white" size={16} weight="fill" />
                  <span className="font-semibold">Zero contractor fees</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-black dark:text-white mb-2">
                      {paymentStats.successRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(paymentStats.transactionCount * (paymentStats.successRate / 100))} of {paymentStats.transactionCount} successful
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-black dark:text-white" size={16} weight="fill" />
                        <span>Successful</span>
                      </div>
                      <span className="font-semibold">{Math.floor(paymentStats.transactionCount * (paymentStats.successRate / 100))}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="text-black dark:text-white" size={16} weight="fill" />
                        <span>Pending</span>
                      </div>
                      <span className="font-semibold">1</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Warning className="text-black dark:text-white" size={16} weight="fill" />
                        <span>Failed</span>
                      </div>
                      <span className="font-semibold">{paymentStats.transactionCount - Math.floor(paymentStats.transactionCount * (paymentStats.successRate / 100)) - 1}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common payment tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="mr-2" size={18} />
                  Update Payment Method
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bank className="mr-2" size={18} />
                  Manage Bank Account
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Receipt className="mr-2" size={18} />
                  Download Tax Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ArrowsClockwise className="mr-2" size={18} />
                  View Payment History
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fee Comparison</CardTitle>
              <CardDescription>How much you're saving vs competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">FairTradeWorker</p>
                    <p className="text-2xl font-bold text-black dark:text-white">0%</p>
                    <p className="text-xs text-muted-foreground mt-1">Contractor fees</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white dark:bg-black">
                    <p className="text-sm text-muted-foreground mb-1">Thumbtack</p>
                    <p className="text-2xl font-bold">10-15%</p>
                    <p className="text-xs text-muted-foreground mt-1">Lead fees + commission</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-white dark:bg-black">
                    <p className="text-sm text-muted-foreground mb-1">HomeAdvisor</p>
                    <p className="text-2xl font-bold">15-20%</p>
                    <p className="text-xs text-muted-foreground mt-1">Per lead + monthly</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-black dark:text-white flex-shrink-0 mt-0.5" size={20} weight="fill" />
                    <div className="space-y-1">
                      <p className="font-semibold">You've saved ${paymentStats.savedInFees.toLocaleString()} this year</p>
                      <p className="text-sm text-muted-foreground">
                        Based on ${paymentStats.totalProcessed.toLocaleString()} in completed jobs. 
                        On competitor platforms charging 15%, you would have paid ${Math.floor(paymentStats.totalProcessed * 0.15).toLocaleString()} in fees.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <ContractorPayouts user={user} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your payment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-white dark:hover:bg-black transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        transaction.type === 'payout' ? 'bg-primary/10' :
                        transaction.type === 'payment' ? 'bg-green-500/10' :
                        'bg-yellow-500/10'
                      }`}>
                        {transaction.type === 'payout' && (
                          <Bank size={20} className="text-primary" weight="fill" />
                        )}
                        {transaction.type === 'payment' && (
                          <CreditCard size={20} className="text-green-500" weight="fill" />
                        )}
                        {transaction.type === 'refund' && (
                          <ArrowsClockwise size={20} className="text-yellow-500" weight="fill" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} • {transaction.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`font-bold ${
                          transaction.type === 'payout' ? 'text-primary' :
                          transaction.type === 'refund' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {transaction.type === 'payment' && '+'}
                          {transaction.type === 'refund' && '-'}
                          ${transaction.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            transaction.status === 'completed' ? 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10' :
                            transaction.status === 'pending' ? 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10' :
                            'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10'
                          }`}
                        >
                          {transaction.status === 'completed' && <CheckCircle className="mr-1" size={10} weight="fill" />}
                          {transaction.status === 'pending' && <Clock className="mr-1" size={10} weight="fill" />}
                          {transaction.status === 'failed' && <Warning className="mr-1" size={10} weight="fill" />}
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of {paymentStats.transactionCount} transactions
                </p>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
