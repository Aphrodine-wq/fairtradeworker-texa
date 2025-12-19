import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Users, EnvelopeSimple, DeviceMobile, Note, Trash, MagnifyingGlass, 
  Plus, PencilSimple, Calendar, Phone, Tag, Gear, Eye, EyeSlash
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { InstantInvite } from "./InstantInvite"
import type { User, CRMCustomer, CRMInteraction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SimpleCRMDashboardProps {
  user: User
}

export function SimpleCRMDashboard({ user }: SimpleCRMDashboardProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions, setInteractions] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCustomize, setShowCustomize] = useState(false)
  const [visibleFields, setVisibleFields] = useKV<string[]>("crm-visible-fields", [
    'name', 'email', 'phone', 'status', 'lifetimeValue', 'lastContact'
  ])

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

  const filteredCustomers = useMemo(() => {
    let filtered = myCustomers

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    return filtered.sort((a, b) => 
      new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
    )
  }, [myCustomers, searchQuery, statusFilter])

  const handleUpdateStatus = (customerId: string, newStatus: CRMCustomer['status']) => {
    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === customerId ? { ...c, status: newStatus } : c
      )
    )
    toast.success("Status updated!")
  }

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (confirm(`Delete ${customerName} from CRM?`)) {
      setCustomers((current) => (current || []).filter((c) => c.id !== customerId))
      setInteractions((current) => (current || []).filter((i) => i.customerId !== customerId))
      toast.success(`${customerName} removed`)
      setSelectedCustomer(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const availableFields = [
    { id: 'name', label: 'Name', required: true },
    { id: 'email', label: 'Email', required: false },
    { id: 'phone', label: 'Phone', required: false },
    { id: 'status', label: 'Status', required: true },
    { id: 'lifetimeValue', label: 'Lifetime Value', required: false },
    { id: 'lastContact', label: 'Last Contact', required: false },
    { id: 'tags', label: 'Tags', required: false },
    { id: 'notes', label: 'Notes', required: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Users size={32} weight="duotone" className="text-primary" />
            CRM
          </h1>
          <p className="text-muted-foreground">
            Manage your customers simply and efficiently
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCustomize(!showCustomize)}
          className="gap-2"
        >
          <Gear size={18} weight="duotone" />
          Customize
        </Button>
      </div>

      {/* Add Customer */}
      <InstantInvite user={user} />

      {/* Customize Panel */}
      {showCustomize && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customize View</CardTitle>
            <CardDescription>Choose which fields to display</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableFields.map((field) => {
                const isVisible = visibleFields.includes(field.id)
                return (
                  <button
                    key={field.id}
                    onClick={() => {
                      if (field.required) return
                      if (isVisible) {
                        setVisibleFields(visibleFields.filter(f => f !== field.id))
                      } else {
                        setVisibleFields([...visibleFields, field.id])
                      }
                    }}
                    disabled={field.required}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isVisible
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      field.required && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isVisible ? (
                      <Eye size={18} weight="duotone" className="text-primary" />
                    ) : (
                      <EyeSlash size={18} weight="duotone" className="text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{field.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      {myCustomers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} weight="duotone" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'lead', 'active', 'completed', 'advocate'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers List */}
      {myCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={64} weight="duotone" className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No customers yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Use the form above to add your first customer
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <Dialog key={customer.id}>
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <Select
                        value={customer.status}
                        onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="advocate">Advocate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {visibleFields.includes('email') && customer.email && (
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <EnvelopeSimple size={14} weight="duotone" />
                        {customer.email}
                      </CardDescription>
                    )}
                    {visibleFields.includes('phone') && customer.phone && (
                      <CardDescription className="flex items-center gap-2">
                        <DeviceMobile size={14} weight="duotone" />
                        {customer.phone}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {visibleFields.includes('lifetimeValue') && customer.lifetimeValue > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Lifetime Value</span>
                          <span className="font-semibold">${customer.lifetimeValue.toLocaleString()}</span>
                        </div>
                      )}
                      {visibleFields.includes('lastContact') && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Last contact</span>
                          <span>{formatDate(customer.lastContact)}</span>
                        </div>
                      )}
                      {visibleFields.includes('tags') && customer.tags && customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {customer.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{customer.name}</DialogTitle>
                  <DialogDescription>Customer details and interactions</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm mt-1">{customer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm mt-1">{customer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={customer.status}
                        onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="advocate">Advocate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Lifetime Value</Label>
                      <p className="text-sm mt-1 font-semibold">${customer.lifetimeValue.toLocaleString()}</p>
                    </div>
                  </div>
                  {customer.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )
}