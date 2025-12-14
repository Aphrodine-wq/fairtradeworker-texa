import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Bank, ArrowUp, ArrowDown, TrendingUp, Funnel, Clock } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Invoice } from "@/lib/types"

interface Transaction {
  id: string
  type: 'payment' | 'payout' | 'refund'
  amount: number
  method: 'card' | 'ach' | 'check'
  status: 'pending' | 'completed' | 'failed'
  date: string
  description: string
  invoiceId?: string
}

export function PaymentProcessing({ user }: { user: User }) {
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [transactions] = useKV<Transaction[]>("payment-transactions", [])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'card' | 'ach'>('all')

  const myInvoices = useMemo(() => 
    (invoices || []).filter(inv => inv.contractorId === user.id),
    [invoices, user.id]
  )

  const filteredTransactions = useMemo(() => {
    let filtered = transactions
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter)
    }
    if (methodFilter !== 'all') {
      filtered = filtered.filter(t => t.method === methodFilter)
    }
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [transactions, filter, methodFilter])

  const stats = useMemo(() => {
    const totalReceived = filteredTransactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingAmount = filteredTransactions
      .filter(t => t.type === 'payment' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const cardPayments = filteredTransactions.filter(t => t.method === 'card' && t.status === 'completed').length
    const achPayments = filteredTransactions.filter(t => t.method === 'ach' && t.status === 'completed').length

    return {
      totalReceived,
      pendingAmount,
      totalTransactions: filteredTransactions.length,
      cardPayments,
      achPayments
    }
  }, [filteredTransactions])

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return CreditCard
      case 'ach': return Bank
      default: return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
      case 'failed': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <CreditCard weight="duotone" size={40} className="text-black dark:text-white" />
              <span className="text-black dark:text-white">Payment Processing</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Multiple payment methods and transaction tracking
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Received</span>
                  <ArrowUp size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${stats.totalReceived.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${stats.pendingAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Card Payments</span>
                  <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.cardPayments}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">ACH Payments</span>
                  <Bank size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats.achPayments}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-40 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={(v: any) => setMethodFilter(v)}>
              <SelectTrigger className="w-40 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions */}
          <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All payment and payout transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map(transaction => {
                  const MethodIcon = getMethodIcon(transaction.method)
                  return (
                    <Card key={transaction.id} className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'payment' 
                                ? 'bg-green-100 dark:bg-green-950' 
                                : 'bg-blue-100 dark:bg-blue-950'
                            }`}>
                              {transaction.type === 'payment' ? (
                                <ArrowDown size={20} className="text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUp size={20} className="text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-black dark:text-white">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()} • 
                                <MethodIcon size={14} className="inline mx-1" />
                                {transaction.method.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.type === 'payment' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {transaction.type === 'payment' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </div>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}