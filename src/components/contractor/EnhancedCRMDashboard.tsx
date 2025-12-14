import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { 
  Users, EnvelopeSimple, DeviceMobile, Note, Trash, MagnifyingGlass, Funnel,
  ChartLine, Calendar, Clock, TrendUp, CurrencyDollar, Target, Sparkle,
  Phone, ChatCircle, FileText, Tag, Plus, X, CheckCircle, Circle
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { InstantInvite } from "./InstantInvite"
import type { User, CRMCustomer, CRMInteraction } from "@/lib/types"

interface PipelineStage {
  id: string
  name: string
  customers: CRMCustomer[]
}

interface CRMDashboardProps {
  user: User
}

export function EnhancedCRMDashboard({ user }: CRMDashboardProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions, setInteractions] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null)
  const [notes, setNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'list' | 'pipeline' | 'analytics'>('list')
  const [newInteraction, setNewInteraction] = useState<Partial<CRMInteraction>>({
    type: 'note',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [showAddInteraction, setShowAddInteraction] = useState(false)

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

  const filteredCustomers = useMemo(() => {
    let filtered = myCustomers

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.notes?.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    return filtered.sort((a, b) => 
      new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
    )
  }, [myCustomers, searchQuery, statusFilter])

  // Pipeline stages
  const pipelineStages: PipelineStage[] = useMemo(() => {
    return [
      { id: 'lead', name: 'Leads', customers: filteredCustomers.filter(c => c.status === 'lead') },
      { id: 'active', name: 'Active', customers: filteredCustomers.filter(c => c.status === 'active') },
      { id: 'completed', name: 'Completed', customers: filteredCustomers.filter(c => c.status === 'completed') },
      { id: 'advocate', name: 'Advocates', customers: filteredCustomers.filter(c => c.status === 'advocate') },
    ]
  }, [filteredCustomers])

  // Analytics
  const analytics = useMemo(() => {
    const totalRevenue = myCustomers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0)
    const avgLTV = myCustomers.length > 0 ? totalRevenue / myCustomers.length : 0
    const conversionRate = myCustomers.length > 0 
      ? (myCustomers.filter(c => c.status === 'completed' || c.status === 'advocate').length / myCustomers.length) * 100 
      : 0
    const recentInteractions = (interactions || []).filter(i => {
      const interactionDate = new Date(i.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return interactionDate >= thirtyDaysAgo
    }).length

    return {
      totalRevenue,
      avgLTV,
      conversionRate,
      recentInteractions,
      totalCustomers: myCustomers.length,
      activeCustomers: myCustomers.filter(c => c.status === 'active').length,
      leads: myCustomers.filter(c => c.status === 'lead').length,
    }
  }, [myCustomers, interactions])

  // Get customer interactions
  const getCustomerInteractions = (customerId: string) => {
    return (interactions || []).filter(i => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

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

  const handleAddInteraction = () => {
    if (!selectedCustomer || !newInteraction.title) {
      toast.error("Please fill in all required fields")
      return
    }

    const interaction: CRMInteraction = {
      id: `interaction-${Date.now()}`,
      customerId: selectedCustomer.id,
      type: newInteraction.type || 'note',
      title: newInteraction.title,
      description: newInteraction.description,
      date: newInteraction.date || new Date().toISOString(),
      outcome: newInteraction.outcome,
      nextAction: newInteraction.nextAction,
      nextActionDate: newInteraction.nextActionDate,
    }

    setInteractions((current) => [...(current || []), interaction])
    
    // Update customer last contact
    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === selectedCustomer.id 
          ? { ...c, lastContact: interaction.date } 
          : c
      )
    )

    toast.success("Interaction added!")
    setShowAddInteraction(false)
    setNewInteraction({
      type: 'note',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const handleUpdateStatus = (customerId: string, newStatus: CRMCustomer['status']) => {
    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === customerId ? { ...c, status: newStatus } : c
      )
    )
    toast.success("Status updated!")
  }

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    setCustomers((current) => (current || []).filter((c) => c.id !== customerId))
    setInteractions((current) => (current || []).filter((i) => i.customerId !== customerId))
    toast.success(`${customerName} removed from CRM`)
    setSelectedCustomer(null)
  }

  const getStatusColor = (status: CRMCustomer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10'
      case 'lead':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10'
      case 'completed':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10'
      case 'advocate':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getInteractionIcon = (type: CRMInteraction['type']) => {
    switch (type) {
      case 'call': return Phone
      case 'email': return EnvelopeSimple
      case 'meeting': return Calendar
      case 'note': return Note
      case 'bid': return Target
      case 'payment': return CurrencyDollar
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Customer Section - Always Visible */}
      <InstantInvite user={user} />

      {/* View Mode Tabs */}
      {myCustomers.length > 0 && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-black border border-black/10 dark:border-white/10">
            <TabsTrigger 
              value="list" 
              className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
            >
              <Users weight="duotone" size={18} />
              List View
            </TabsTrigger>
            <TabsTrigger 
              value="pipeline" 
              className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
            >
              <Target weight="duotone" size={18} />
              Pipeline
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black"
            >
              <ChartLine weight="duotone" size={18} />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-6">

        {/* Search and Filter - Always visible when customers exist */}
        {myCustomers.length > 0 && (
          <Card className="p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} weight="duotone" />
                <Input
                  placeholder="Search by name, email, phone, notes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-black text-black dark:text-white border-black/10 dark:border-white/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-black text-black dark:text-white border-black/10 dark:border-white/20">
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

        {myCustomers.length === 0 ? (
          <Card className="max-w-2xl mx-auto dark:bg-black dark:border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users size={64} weight="duotone" className="text-muted-foreground mb-4 dark:text-white/50" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">No customers yet</h3>
              <p className="text-muted-foreground text-center max-w-md dark:text-white/70">
                Use the instant invite form above to add your first customer to your CRM
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <Dialog key={customer.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-white dark:bg-black border-black/10 dark:border-white/10 dark:hover:border-white/20"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setNotes(customer.notes || "")
                          setIsEditingNotes(false)
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg dark:text-white">{customer.name}</CardTitle>
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-2 dark:text-white/70">
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
                          <div className="space-y-2">
                            {customer.lifetimeValue > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground dark:text-white/70">Lifetime Value</span>
                                <span className="font-semibold text-black dark:text-white">
                                  ${customer.lifetimeValue.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-white/60">
                              <span>Last contact: {formatDate(customer.lastContact)}</span>
                            </div>
                            {customer.tags && customer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {customer.tags.slice(0, 3).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs dark:border-white/20 dark:text-white/80">
                                    {tag}
                                  </Badge>
                                ))}
                                {customer.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs dark:border-white/20 dark:text-white/80">
                                    +{customer.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-black dark:border-white/20">
                      <DialogHeader>
                        <DialogTitle className="dark:text-white">{customer.name}</DialogTitle>
                        <DialogDescription className="dark:text-white/70">
                          Complete customer profile and interaction history
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 dark:bg-black dark:border-white/10">
                          <TabsTrigger value="overview" className="dark:text-white dark:data-[state=active]:bg-black">
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="interactions" className="dark:text-white dark:data-[state=active]:bg-black">
                            Interactions
                          </TabsTrigger>
                          <TabsTrigger value="notes" className="dark:text-white dark:data-[state=active]:bg-black">
                            Notes
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="dark:text-white">Contact</Label>
                              <div className="flex items-center gap-2 p-3 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10">
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
                              <Select
                                value={customer.status}
                                onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                              >
                                <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20">
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
                          </div>

                          <div className="space-y-2">
                            <Label className="dark:text-white">Customer Information</Label>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground dark:text-white/70">Lifetime Value:</span>
                                <span className="ml-2 font-semibold text-primary dark:text-white">
                                  ${customer.lifetimeValue.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground dark:text-white/70">Source:</span>
                                <span className="ml-2 font-semibold dark:text-white capitalize">
                                  {customer.source.replace('_', ' ')}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground dark:text-white/70">Added:</span>
                                <span className="ml-2 dark:text-white">{formatDate(customer.createdAt)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground dark:text-white/70">Last Contact:</span>
                                <span className="ml-2 dark:text-white">{formatDate(customer.lastContact)}</span>
                              </div>
                            </div>
                          </div>

                          {customer.tags && customer.tags.length > 0 && (
                            <div className="space-y-2">
                              <Label className="dark:text-white">Tags</Label>
                              <div className="flex flex-wrap gap-2">
                                {customer.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="dark:border-white/20 dark:text-white/80">
                                    <Tag weight="duotone" size={12} className="mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="interactions" className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <Label className="dark:text-white">Interaction History</Label>
                            <Button
                              size="sm"
                              onClick={() => setShowAddInteraction(true)}
                            >
                              <Plus size={16} className="mr-2" />
                              Add Interaction
                            </Button>
                          </div>

                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {getCustomerInteractions(customer.id).length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground dark:text-white/70">
                                <Clock size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
                                <p>No interactions recorded yet</p>
                              </div>
                            ) : (
                              getCustomerInteractions(customer.id).map((interaction) => {
                                const Icon = getInteractionIcon(interaction.type)
                                return (
                                  <Card key={interaction.id} className="p-4 dark:bg-black dark:border-white/10">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-lg bg-white dark:bg-black border border-black/10 dark:border-white/10">
                                        <Icon weight="duotone" size={20} className="text-black dark:text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <h4 className="font-semibold dark:text-white">{interaction.title}</h4>
                                          <span className="text-xs text-muted-foreground dark:text-white/60">
                                            {formatDateTime(interaction.date)}
                                          </span>
                                        </div>
                                        {interaction.description && (
                                          <p className="text-sm text-muted-foreground dark:text-white/70 mb-2">
                                            {interaction.description}
                                          </p>
                                        )}
                                        {interaction.nextAction && (
                                          <div className="flex items-center gap-2 text-xs text-black dark:text-white/80">
                                            <Circle weight="fill" size={8} />
                                            Next: {interaction.nextAction}
                                            {interaction.nextActionDate && (
                                              <span className="text-muted-foreground dark:text-white/60">
                                                ({formatDate(interaction.nextActionDate)})
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                )
                              })
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 dark:text-white">
                              <Note weight="duotone" size={20} />
                              Notes
                            </Label>
                            {!isEditingNotes && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingNotes(true)}
                                className="dark:text-white dark:hover:bg-black"
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
                                rows={6}
                                className="dark:bg-black dark:text-white dark:border-white/20"
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleSaveNotes} size="sm">
                                  Save Notes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setNotes(customer.notes || "")
                                    setIsEditingNotes(false)
                                  }}
                                  className="dark:bg-black dark:text-white dark:border-white/20"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm p-4 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 min-h-[120px] dark:text-white">
                              {customer.notes || "No notes yet. Click Edit to add notes about this customer."}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>

                      <div className="pt-4 border-t dark:border-white/10">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="dark:bg-black dark:hover:bg-black/80"
                        >
                          <Trash weight="bold" className="mr-2" />
                          Remove Customer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}

            {viewMode === 'pipeline' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {pipelineStages.map((stage) => (
                    <div key={stage.id} className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10">
                        <h3 className="font-semibold dark:text-white">{stage.name}</h3>
                        <Badge variant="outline" className="dark:border-white/20 dark:text-white/80">
                          {stage.customers.length}
                        </Badge>
                      </div>
                      <div className="space-y-3 min-h-[200px]">
                        {stage.customers.map((customer) => (
                          <Dialog key={customer.id}>
                            <DialogTrigger asChild>
                              <Card
                                className="cursor-pointer hover:shadow-lg transition-all dark:bg-black dark:border-white/10 dark:hover:border-white/20"
                                onClick={() => {
                                  setSelectedCustomer(customer)
                                  setNotes(customer.notes || "")
                                  setIsEditingNotes(false)
                                }}
                              >
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base dark:text-white">{customer.name}</CardTitle>
                                  {customer.lifetimeValue > 0 && (
                                    <CardDescription className="dark:text-white/70">
                                      ${customer.lifetimeValue.toLocaleString()} LTV
                                    </CardDescription>
                                  )}
                                </CardHeader>
                              </Card>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl dark:bg-black dark:border-white/20">
                              <DialogHeader>
                                <DialogTitle className="dark:text-white">{customer.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="dark:text-white">Move to Stage</Label>
                                  <Select
                                    value={customer.status}
                                    onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                                  >
                                    <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20">
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
                                <div className="text-sm text-muted-foreground dark:text-white/70">
                                  Last contact: {formatDate(customer.lastContact)}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                        {stage.customers.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground dark:text-white/50 text-sm">
                            No customers in this stage
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'analytics' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 dark:bg-black dark:border-white/10">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Revenue Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Total Revenue</span>
                        <span className="text-2xl font-bold text-black dark:text-white">
                          ${analytics.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Average LTV</span>
                        <span className="text-xl font-semibold dark:text-white">
                          ${analytics.avgLTV.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Conversion Rate</span>
                        <span className="text-xl font-semibold text-black dark:text-white">
                          {analytics.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 dark:bg-black dark:border-white/10">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Customer Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Total Customers</span>
                        <span className="text-2xl font-bold dark:text-white">{analytics.totalCustomers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Active</span>
                        <span className="text-xl font-semibold text-black dark:text-white">
                          {analytics.activeCustomers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground dark:text-white/70">Leads</span>
                        <span className="text-xl font-semibold text-black dark:text-white">
                          {analytics.leads}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6 dark:bg-black dark:border-white/10">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {(interactions || []).slice(0, 10).map((interaction) => {
                      const customer = myCustomers.find(c => c.id === interaction.customerId)
                      const Icon = getInteractionIcon(interaction.type)
                      return (
                        <div key={interaction.id} className="flex items-center gap-3 p-3 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10">
                          <Icon weight="duotone" size={20} className="text-black dark:text-white" />
                          <div className="flex-1">
                            <div className="font-semibold dark:text-white">{interaction.title}</div>
                            <div className="text-sm text-muted-foreground dark:text-white/70">
                              {customer?.name} • {formatDateTime(interaction.date)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {(!interactions || interactions.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground dark:text-white/70">
                        No interactions recorded yet
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Interaction Dialog */}
      {selectedCustomer && (
        <Dialog open={showAddInteraction} onOpenChange={setShowAddInteraction}>
          <DialogContent className="dark:bg-black dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Add Interaction</DialogTitle>
              <DialogDescription className="dark:text-white/70">
                Record a new interaction with {selectedCustomer.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-white">Type</Label>
                <Select
                  value={newInteraction.type}
                  onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value as any })}
                >
                  <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="bid">Bid Submitted</SelectItem>
                    <SelectItem value="payment">Payment Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Title *</Label>
                <Input
                  value={newInteraction.title}
                  onChange={(e) => setNewInteraction({ ...newInteraction, title: e.target.value })}
                  placeholder="Brief description of interaction"
                  className="dark:bg-black dark:text-white dark:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Description</Label>
                <Textarea
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                  placeholder="Detailed notes about the interaction..."
                  rows={4}
                  className="dark:bg-black dark:text-white dark:border-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-white">Date</Label>
                  <Input
                    type="date"
                    value={newInteraction.date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                    className="dark:bg-black dark:text-white dark:border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-white">Outcome</Label>
                  <Select
                    value={newInteraction.outcome}
                    onValueChange={(value) => setNewInteraction({ ...newInteraction, outcome: value as any })}
                  >
                    <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Next Action</Label>
                <Input
                  value={newInteraction.nextAction}
                  onChange={(e) => setNewInteraction({ ...newInteraction, nextAction: e.target.value })}
                  placeholder="What should happen next?"
                  className="dark:bg-black dark:text-white dark:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Next Action Date</Label>
                <Input
                  type="date"
                  value={newInteraction.nextActionDate}
                  onChange={(e) => setNewInteraction({ ...newInteraction, nextActionDate: e.target.value })}
                  className="dark:bg-black dark:text-white dark:border-white/20"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddInteraction}
                  className="flex-1"
                >
                  Add Interaction
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddInteraction(false)}
                  className="dark:bg-black dark:text-white dark:border-white/20"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

