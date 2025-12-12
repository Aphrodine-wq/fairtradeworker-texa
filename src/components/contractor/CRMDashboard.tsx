import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Users, EnvelopeSimple, DeviceMobile, Note, Trash, MagnifyingGlass, Funnel } from "@phosphor-icons/react"
import { toast } from "sonner"
import { InstantInvite } from "./InstantInvite"
import type { User, CRMCustomer } from "@/lib/types"

interface CRMDashboardProps {
  user: User
}

export function CRMDashboard({ user }: CRMDashboardProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null)
  const [notes, setNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

  const filteredCustomers = useMemo(() => {
    let filtered = myCustomers

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.notes?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    return filtered.sort((a, b) => 
      new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
    )
  }, [myCustomers, searchQuery, statusFilter])

  const handleSaveNotes = () => {
    if (!selectedCustomer) return

    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: notes.trim() } : c
      )
    )

    toast.success("Notes saved!")
    setIsEditingNotes(false)
  }

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    setCustomers((current) => (current || []).filter((c) => c.id !== customerId))
    toast.success(`${customerName} removed from CRM`)
    setSelectedCustomer(null)
  }

  const getStatusColor = (status: CRMCustomer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-500/20'
      case 'lead':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'completed':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20'
      case 'advocate':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const activeCount = myCustomers.filter(c => c.status === 'active').length
  const leadCount = myCustomers.filter(c => c.status === 'lead').length
  const completedCount = myCustomers.filter(c => c.status === 'completed').length

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-2 dark:text-white">
              <Users weight="duotone" size={40} className="text-primary" />
              Customer CRM
            </h1>
            <p className="text-muted-foreground text-lg dark:text-white/70">
              Manage relationships, track interactions, and grow your business
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 dark:bg-transparent dark:border-white/10">
            <div className="text-3xl font-bold text-primary mb-1 dark:text-white">{myCustomers.length}</div>
            <div className="text-sm text-muted-foreground dark:text-white/70">Total Customers</div>
          </Card>
          <Card className="p-6 dark:bg-transparent dark:border-white/10">
            <div className="text-3xl font-bold text-green-600 mb-1 dark:text-white">{activeCount}</div>
            <div className="text-sm text-muted-foreground dark:text-white/70">Active</div>
          </Card>
          <Card className="p-6 dark:bg-transparent dark:border-white/10">
            <div className="text-3xl font-bold text-blue-600 mb-1 dark:text-white">{leadCount}</div>
            <div className="text-sm text-muted-foreground dark:text-white/70">Leads</div>
          </Card>
          <Card className="p-6 dark:bg-transparent dark:border-white/10">
            <div className="text-3xl font-bold text-purple-600 mb-1 dark:text-white">{completedCount}</div>
            <div className="text-sm text-muted-foreground dark:text-white/70">Completed</div>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <InstantInvite user={user} />

        {myCustomers.length > 0 && (
          <Card className="p-4 dark:bg-transparent dark:border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} weight="duotone" />
                <Input
                  placeholder="Search customers by name, email, phone, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-transparent dark:text-white dark:border-white/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] dark:bg-transparent dark:text-white dark:border-white/20">
                  <Funnel weight="duotone" className="mr-2" size={16} />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="advocate">Advocates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}
      </div>

      {myCustomers.length === 0 ? (
        <Card className="max-w-2xl mx-auto dark:bg-transparent dark:border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={64} weight="duotone" className="text-muted-foreground mb-4 dark:text-white/50" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No customers yet</h3>
            <p className="text-muted-foreground text-center max-w-md dark:text-white/70">
              Use the instant invite form above to add your first customer to your CRM
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-7xl mx-auto">
          {filteredCustomers.length === 0 ? (
            <Card className="p-12 text-center dark:bg-transparent dark:border-white/10">
              <MagnifyingGlass size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 dark:text-white/50" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">No customers found</h3>
              <p className="text-muted-foreground dark:text-white/70">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No customers match your criteria"}
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
            <Dialog key={customer.id}>
              <DialogTrigger asChild>
                <Card
                  className="cursor-pointer hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 dark:bg-transparent dark:border-white/10 dark:hover:border-white/20"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setNotes(customer.notes || "")
                    setIsEditingNotes(false)
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      {customer.invitedVia === 'email' ? (
                        <>
                          <EnvelopeSimple weight="duotone" size={16} />
                          {customer.email}
                        </>
                      ) : (
                        <>
                          <DeviceMobile weight="duotone" size={16} />
                          {customer.phone}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(customer.invitedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="dark:bg-black dark:border-white/20">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">{customer.name}</DialogTitle>
                  <DialogDescription className="dark:text-white/70">Customer details and notes</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="dark:text-white">Contact</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg dark:bg-transparent dark:border dark:border-white/10">
                      {customer.invitedVia === 'email' ? (
                        <>
                          <EnvelopeSimple weight="duotone" size={20} className="dark:text-white" />
                          <span className="dark:text-white">{customer.email}</span>
                        </>
                      ) : (
                        <>
                          <DeviceMobile weight="duotone" size={20} className="dark:text-white" />
                          <span className="dark:text-white">{customer.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Status</Label>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Invited</Label>
                    <div className="text-sm text-muted-foreground dark:text-white/70">
                      {formatDate(customer.invitedAt)} via {customer.invitedVia}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Note weight="duotone" size={20} />
                        Notes
                      </Label>
                      {!isEditingNotes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingNotes(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {isEditingNotes ? (
                      <>
                        <Textarea
                          id="customer-notes"
                          placeholder="Add notes about this customer..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="dark:bg-transparent dark:text-white dark:border-white/20"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSaveNotes} size="sm" className="dark:bg-white dark:text-black dark:hover:bg-white/90">
                            Save Notes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNotes(customer.notes || "")
                              setIsEditingNotes(false)
                            }}
                            className="dark:bg-transparent dark:text-white dark:border-white/20"
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm p-3 bg-muted rounded-lg min-h-[80px] dark:bg-transparent dark:border dark:border-white/10 dark:text-white/80">
                        {customer.notes || "No notes yet"}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                    >
                      <Trash weight="bold" className="mr-2" />
                      Remove Customer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
