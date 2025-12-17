import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Users, 
  Plus,
  MagnifyingGlass,
  Phone,
  Envelope,
  MapPin,
  Calendar,
  CurrencyDollar,
  Briefcase
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface CustomerCRMPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function CustomerCRMPage({ user, onNavigate }: CustomerCRMPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const customers = [
    { 
      id: 1, 
      name: "John Smith", 
      email: "john@example.com", 
      phone: "(555) 123-4567", 
      location: "Downtown", 
      jobs: 5, 
      totalValue: "$12,450",
      lastContact: "2025-01-18",
      status: "active"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      email: "sarah@example.com", 
      phone: "(555) 234-5678", 
      location: "Northside", 
      jobs: 3, 
      totalValue: "$8,200",
      lastContact: "2025-01-15",
      status: "active"
    },
    { 
      id: 3, 
      name: "Mike Davis", 
      email: "mike@example.com", 
      phone: "(555) 345-6789", 
      location: "Eastside", 
      jobs: 8, 
      totalValue: "$24,800",
      lastContact: "2025-01-19",
      status: "vip"
    },
    { 
      id: 4, 
      name: "Emily Brown", 
      email: "emily@example.com", 
      phone: "(555) 456-7890", 
      location: "Westside", 
      jobs: 2, 
      totalValue: "$5,600",
      lastContact: "2025-01-10",
      status: "active"
    },
  ]

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
                <Users size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Customer CRM</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  Manage relationships and track customer history
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <Input
                placeholder="Search customers by name, email, or location..."
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
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-black dark:text-white">{customers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {customers.reduce((sum, c) => sum + c.jobs, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-primary">
                ${customers.reduce((sum, c) => sum + parseFloat(c.totalValue.replace(/[^0-9.]/g, '')), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-1">{customer.name}</h3>
                        {customer.status === 'vip' && (
                          <Badge className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
                            VIP Customer
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Envelope size={16} />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Phone size={16} />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <MapPin size={16} />
                        <span>{customer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                        <Calendar size={16} />
                        <span>Last contact: {customer.lastContact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-primary" />
                        <span className="text-sm text-black dark:text-white">
                          <span className="font-semibold">{customer.jobs}</span> jobs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-black dark:text-white">{customer.totalValue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Profile
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Contact
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      View Jobs
                    </Button>
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
