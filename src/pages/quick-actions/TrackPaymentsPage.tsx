import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Wallet, 
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  CurrencyDollar
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface TrackPaymentsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function TrackPaymentsPage({ user, onNavigate }: TrackPaymentsPageProps) {
  const payments = [
    { id: 1, invoice: "INV-2025-001", client: "John Smith", amount: "$450", status: "completed", date: "2025-01-15", method: "Card" },
    { id: 2, invoice: "INV-2025-002", client: "Sarah Johnson", amount: "$320", status: "pending", date: "2025-01-18", method: "ACH" },
    { id: 3, invoice: "INV-2025-003", client: "Mike Davis", amount: "$1,200", status: "completed", date: "2025-01-10", method: "Card" },
    { id: 4, invoice: "INV-2025-004", client: "Emily Brown", amount: "$850", status: "failed", date: "2025-01-05", method: "Card" },
    { id: 5, invoice: "INV-2025-005", client: "David Wilson", amount: "$2,400", status: "processing", date: "2025-01-19", method: "ACH" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300"><CheckCircle size={12} className="mr-1" />Completed</Badge>
      case "pending":
        return <Badge className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"><Clock size={12} className="mr-1" />Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300"><Clock size={12} className="mr-1" />Processing</Badge>
      case "failed":
        return <Badge className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300"><XCircle size={12} className="mr-1" />Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
              <Wallet size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Track Payments</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Monitor payment status and transaction history
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Received</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ${payments.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">This Month</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Avg. Payment Time</p>
              <p className="text-2xl font-bold text-primary">2.3 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-1">{payment.invoice}</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">Client: {payment.client}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="text-green-600 dark:text-green-400" />
                        <span className="font-bold text-lg text-black dark:text-white">{payment.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>{payment.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Wallet size={16} />
                        <span>{payment.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    {payment.status === 'failed' && (
                      <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        Retry Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
