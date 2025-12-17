import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Receipt, 
  Plus,
  MagnifyingGlass,
  Calendar,
  CurrencyDollar,
  CheckCircle,
  Clock,
  XCircle,
  FilePdf
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface InvoicesPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function InvoicesPage({ user, onNavigate }: InvoicesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const invoices = [
    { id: 1, number: "INV-2025-001", client: "John Smith", amount: "$450", status: "paid", date: "2025-01-15", dueDate: "2025-01-20" },
    { id: 2, number: "INV-2025-002", client: "Sarah Johnson", amount: "$320", status: "pending", date: "2025-01-18", dueDate: "2025-01-23" },
    { id: 3, number: "INV-2025-003", client: "Mike Davis", amount: "$1,200", status: "paid", date: "2025-01-10", dueDate: "2025-01-15" },
    { id: 4, number: "INV-2025-004", client: "Emily Brown", amount: "$850", status: "overdue", date: "2025-01-05", dueDate: "2025-01-10" },
    { id: 5, number: "INV-2025-005", client: "David Wilson", amount: "$2,400", status: "pending", date: "2025-01-19", dueDate: "2025-01-24" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300"><CheckCircle size={12} className="mr-1" />Paid</Badge>
      case "pending":
        return <Badge className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"><Clock size={12} className="mr-1" />Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300"><XCircle size={12} className="mr-1" />Overdue</Badge>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black dark:bg-white">
                <Receipt size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Invoices</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  Create, manage, and track all your invoices
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <Input
                placeholder="Search invoices by number, client, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-black border-transparent dark:border-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-black dark:text-white">{invoices.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {invoices.filter(i => i.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                ${invoices.reduce((sum, i) => sum + parseFloat(i.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-1">{invoice.number}</h3>
                        <p className="text-sm text-black/60 dark:text-white/60">Client: {invoice.client}</p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="text-green-600 dark:text-green-400" />
                        <span className="font-bold text-lg text-black dark:text-white">{invoice.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Date: {invoice.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Due: {invoice.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Invoice
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      <FilePdf size={16} className="mr-2" />
                      Download PDF
                    </Button>
                    {invoice.status === 'pending' && (
                      <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        Send Reminder
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
