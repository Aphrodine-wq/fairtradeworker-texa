import { useState, useMemo, memo, useCallback, useEffect } from "react"
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
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
import type { User, CRMCustomer, CRMInteraction } from "@/lib/types"

interface PipelineStage {
  id: string
  name: string
  customers: CRMCustomer[]
}

interface CRMDashboardProps {
  user: User
}

export const EnhancedCRMDashboard = memo(function EnhancedCRMDashboard({ user }: CRMDashboardProps) {
  const [customers, setCustomers, customersLoading] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions, setInteractions, interactionsLoading] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null)
  const [notes, setNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'list' | 'pipeline' | 'analytics'>('list')
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Use glass for Pro users
  const isPro = user.isPro || false

  // Simulate initial loading
  useEffect(() => {
    if (!customersLoading && !interactionsLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [customersLoading, interactionsLoading])
  const [newInteraction, setNewInteraction] = useState<Partial<CRMInteraction>>({
    type: 'note',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [showAddInteraction, setShowAddInteraction] = useState(false)

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

  // Calculate lead scores
  const customersWithScores = useMemo(() => {
    return myCustomers.map(customer => {
      let score = 0
      
      // Base score by status
      if (customer.status === 'active') score += 30
      else if (customer.status === 'lead') score += 10
      
      // Lifetime value (higher LTV = higher score)
      if (customer.lifetimeValue > 10000) score += 40
      else if (customer.lifetimeValue > 5000) score += 30
      else if (customer.lifetimeValue > 1000) score += 20
      else if (customer.lifetimeValue > 0) score += 10
      
      // Recent interactions (more recent = higher score)
      const customerInteractions = getCustomerInteractions(customer.id)
      const recentInteractions = customerInteractions.filter(i => {
        const interactionDate = new Date(i.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return interactionDate >= thirtyDaysAgo
      })
      score += Math.min(recentInteractions.length * 5, 20)
      
      // Tags (VIP, High Priority, etc.)
      if (customer.tags?.some(tag => tag.toLowerCase().includes('vip'))) score += 15
      if (customer.tags?.some(tag => tag.toLowerCase().includes('priority'))) score += 10
      
      // Source (referrals score higher)
      if (customer.source === 'referral') score += 10
      
      return { ...customer, leadScore: Math.min(score, 100) }
    })
  }, [myCustomers, interactions])

  const filteredCustomers = useMemo(() => {
    let filtered = customersWithScores

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
      ((b as any).leadScore || 0) - ((a as any).leadScore || 0) ||
      new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
    )
  }, [customersWithScores, searchQuery, statusFilter])

  // Pipeline stages
  const pipelineStages: PipelineStage[] = useMemo(() => {
    return [
      { id: 'lead', name: 'Leads', customers: filteredCustomers.filter(c => c.status === 'lead') },
      { id: 'active', name: 'Active', customers: filteredCustomers.filter(c => c.status === 'active') },
      { id: 'completed', name: 'Completed', customers: filteredCustomers.filter(c => c.status === 'completed') },
      { id: 'advocate', name: 'Advocates', customers: filteredCustomers.filter(c => c.status === 'advocate') },
    ]
  }, [filteredCustomers])

  // Get customer interactions (sorted by date, newest first)  
  const getCustomerInteractions = (customerId: string) => {
    return (interactions || []).filter(i => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
  }

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
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20'
      case 'lead':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20'
      case 'completed':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20'
      case 'advocate':
        return 'bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20'
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
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-black border border-black/20 dark:border-white/20">
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
          <Card className="p-4" glass={isPro}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} weight="duotone" />
                <Input
                  placeholder="Search by name, email, phone, notes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20">
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
          <Card className="max-w-2xl mx-auto" glass={isPro}>
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
                {isInitializing ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonLoader key={i} variant="card" />
                  ))
                ) : (
                  filteredCustomers.map((customer) => (
                  <Dialog key={customer.id}>
                    <DialogTrigger asChild>
                      <Card
                        className="cursor-pointer hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] hover:scale-[1.02] transition-all duration-200 bg-white dark:bg-black border border-black/20 dark:border-white/20"
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
                            {(customer as any).leadScore !== undefined && (
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground dark:text-white/70">Lead Score</span>
                                <Badge className={`text-xs ${getLeadScoreColor((customer as any).leadScore || 0)}`}>
                                  {(customer as any).leadScore || 0}/100
                                </Badge>
                              </div>
                            )}
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
                    <DialogContent className="dark:bg-black dark:border-white/20 overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                      {/* Header */}
                      <div className="px-8 pt-6 pb-4 border-b dark:border-white/10 flex-shrink-0">
                        <DialogHeader className="text-left">
                          <DialogTitle className="dark:text-white text-2xl">{customer.name}</DialogTitle>
                          <DialogDescription className="dark:text-white/70">
                            Complete customer profile and interaction history
                          </DialogDescription>
                        </DialogHeader>
                      </div>

                      {/* Main Content - Column Layout */}
                      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
                        {/* Left Column - Overview */}
                        <div className="lg:col-span-1 space-y-4 overflow-hidden flex flex-col">
                          <div className="bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20 p-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="dark:text-white text-sm">Contact</Label>
                              <div className="flex items-center gap-2 p-2 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20">
                                {customer.invitedVia === 'email' ? (
                                  <>
                                    <EnvelopeSimple weight="duotone" size={18} className="dark:text-white" />
                                    <span className="dark:text-white text-sm">{customer.email}</span>
                                  </>
                                ) : (
                                  <>
                                    <DeviceMobile weight="duotone" size={18} className="dark:text-white" />
                                    <span className="dark:text-white text-sm">{customer.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="dark:text-white text-sm">Status</Label>
                              <Select
                                value={customer.status}
                                onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                              >
                                <SelectTrigger className="dark:bg-black dark:text-white border border-black/20 dark:border-white/20 h-9">
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

                            <div className="space-y-2">
                              <Label className="dark:text-white text-sm">Customer Information</Label>
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground dark:text-white/70">Lifetime Value:</span>
                                  <span className="font-semibold dark:text-white">${customer.lifetimeValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground dark:text-white/70">Source:</span>
                                  <span className="font-semibold dark:text-white capitalize">{customer.source.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground dark:text-white/70">Added:</span>
                                  <span className="dark:text-white">{formatDate(customer.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground dark:text-white/70">Last Contact:</span>
                                  <span className="dark:text-white">{formatDate(customer.lastContact)}</span>
                                </div>
                              </div>
                            </div>

                            {customer.tags && customer.tags.length > 0 && (
                              <div className="space-y-2">
                                <Label className="dark:text-white text-sm">Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                  {customer.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="dark:border-white/20 dark:text-white/80 text-xs">
                                      <Tag weight="duotone" size={10} className="mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notes Section */}
                          <div className="bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20 p-4 flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                              <Label className="flex items-center gap-2 dark:text-white text-sm">
                                <Note weight="duotone" size={16} />
                                Notes
                              </Label>
                              {!isEditingNotes && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsEditingNotes(true)}
                                  className="dark:text-white dark:hover:bg-black h-8 text-xs"
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                            {isEditingNotes ? (
                              <div className="flex-1 flex flex-col space-y-2">
                                <Textarea
                                  id="customer-notes"
                                  placeholder="Add notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="flex-1 dark:bg-black dark:text-white border border-black/20 dark:border-white/20 text-sm resize-none font-mono"
                                />
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button onClick={handleSaveNotes} size="sm" className="h-8 text-xs">Save</Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setNotes(customer.notes || "")
                                      setIsEditingNotes(false)
                                    }}
                                    className="dark:bg-black dark:text-white border border-black/20 dark:border-white/20 h-8 text-xs font-mono"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 text-xs p-3 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20 dark:text-white overflow-hidden font-mono">
                                {customer.notes || "No notes yet. Click Edit to add notes."}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Interactions */}
                        <div className="lg:col-span-2 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20 p-4 overflow-hidden flex flex-col">
                          <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <Label className="dark:text-white text-base font-semibold">Interaction History</Label>
                            <Button
                              size="sm"
                              onClick={() => setShowAddInteraction(true)}
                              className="h-9 text-xs"
                            >
                              <Plus size={14} className="mr-2" />
                              Add Interaction
                            </Button>
                          </div>

                          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3">
                            {getCustomerInteractions(customer.id).length === 0 ? (
                              <div className="col-span-2 text-center py-8 text-muted-foreground dark:text-white/70">
                                <Clock size={24} weight="duotone" className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No interactions recorded yet</p>
                              </div>
                            ) : (
                              getCustomerInteractions(customer.id).map((interaction) => {
                                const Icon = getInteractionIcon(interaction.type)
                                return (
                                  <Card key={interaction.id} className="p-3 dark:bg-black dark:border-white/10">
                                    <div className="flex items-start gap-2">
                                      <div className="p-1.5 rounded-md bg-white dark:bg-black border border-black/20 dark:border-white/20 flex-shrink-0">
                                        <Icon weight="duotone" size={16} className="text-black dark:text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                          <h4 className="font-semibold dark:text-white text-sm truncate">{interaction.title}</h4>
                                          <span className="text-xs text-muted-foreground dark:text-white/60 ml-2 flex-shrink-0">
                                            {formatDateTime(interaction.date)}
                                          </span>
                                        </div>
                                        {interaction.description && (
                                          <p className="text-xs text-muted-foreground dark:text-white/70 mb-1 line-clamp-2">
                                            {interaction.description}
                                          </p>
                                        )}
                                        {interaction.nextAction && (
                                          <div className="flex items-center gap-1 text-xs text-black dark:text-white/80">
                                            <Circle weight="fill" size={6} />
                                            <span className="truncate">Next: {interaction.nextAction}</span>
                                            {interaction.nextActionDate && (
                                              <span className="text-muted-foreground dark:text-white/60 ml-1">
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
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-8 py-4 border-t-2 border-black dark:border-white flex-shrink-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="dark:bg-black dark:hover:bg-black/80 h-9 text-xs"
                        >
                          <Trash weight="bold" className="mr-2" size={14} />
                          Remove Customer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  ))
                )}
              </div>
            )}

            {viewMode === 'pipeline' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {pipelineStages.map((stage) => (
                    <div key={stage.id} className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20">
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
                                className="cursor-pointer hover:shadow-lg transition-all" glass={isPro}
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
                            <DialogContent className="dark:bg-black dark:border-white/20 overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                              <div className="px-8 pt-6 pb-4 border-b dark:border-white/10 flex-shrink-0">
                                <DialogHeader className="text-left">
                                  <DialogTitle className="dark:text-white text-2xl">{customer.name}</DialogTitle>
                                </DialogHeader>
                              </div>
                              <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="dark:text-white">Move to Stage</Label>
                                    <Select
                                      value={customer.status}
                                      onValueChange={(value) => handleUpdateStatus(customer.id, value as CRMCustomer['status'])}
                                    >
                                      <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20 h-10">
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
                                  {customer.lifetimeValue > 0 && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground dark:text-white/70">Lifetime Value: </span>
                                      <span className="font-semibold dark:text-white">${customer.lifetimeValue.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {customer.notes && (
                                    <div>
                                      <Label className="dark:text-white text-sm mb-2 block">Notes</Label>
                                      <div className="text-sm p-3 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20 dark:text-white">
                                        {customer.notes}
                                      </div>
                                    </div>
                                  )}
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
                  <Card className="p-6" glass={isPro}>
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

                  <Card className="p-6" glass={isPro}>
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

                <Card className="p-6" glass={isPro}>
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {(interactions || []).slice(0, 10).map((interaction) => {
                      const customer = myCustomers.find(c => c.id === interaction.customerId)
                      const Icon = getInteractionIcon(interaction.type)
                      return (
                        <div key={interaction.id} className="flex items-center gap-3 p-3 bg-white dark:bg-black rounded-md border border-black/20 dark:border-white/20">
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
          <DialogContent className="dark:bg-black dark:border-white/20 overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
            <div className="px-8 pt-6 pb-4 border-b dark:border-white/10 flex-shrink-0">
              <DialogHeader className="text-left">
                <DialogTitle className="dark:text-white text-2xl">Add Interaction</DialogTitle>
                <DialogDescription className="dark:text-white/70">
                  Record a new interaction with {selectedCustomer.name}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Type</Label>
                  <Select
                    value={newInteraction.type}
                    onValueChange={(value) => setNewInteraction({ ...newInteraction, type: value as any })}
                  >
                    <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20 h-10">
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
                  <Label className="dark:text-white text-sm">Title *</Label>
                  <Input
                    value={newInteraction.title}
                    onChange={(e) => setNewInteraction({ ...newInteraction, title: e.target.value })}
                    placeholder="Brief description of interaction"
                    className="dark:bg-black dark:text-white dark:border-white/20 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Date</Label>
                  <Input
                    type="date"
                    value={newInteraction.date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                    className="dark:bg-black dark:text-white dark:border-white/20 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Outcome</Label>
                  <Select
                    value={newInteraction.outcome}
                    onValueChange={(value) => setNewInteraction({ ...newInteraction, outcome: value as any })}
                  >
                    <SelectTrigger className="dark:bg-black dark:text-white dark:border-white/20 h-10">
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

              {/* Right Column */}
              <div className="space-y-4 flex flex-col">
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Description</Label>
                  <Textarea
                    value={newInteraction.description}
                    onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                    placeholder="Detailed notes about the interaction..."
                    className="flex-1 dark:bg-black dark:text-white dark:border-white/20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Next Action</Label>
                  <Input
                    value={newInteraction.nextAction}
                    onChange={(e) => setNewInteraction({ ...newInteraction, nextAction: e.target.value })}
                    placeholder="What should happen next?"
                    className="dark:bg-black dark:text-white dark:border-white/20 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-white text-sm">Next Action Date</Label>
                  <Input
                    type="date"
                    value={newInteraction.nextActionDate}
                    onChange={(e) => setNewInteraction({ ...newInteraction, nextActionDate: e.target.value })}
                    className="dark:bg-black dark:text-white dark:border-white/20 h-10"
                  />
                </div>
              </div>
            </div>
            <div className="px-8 py-4 border-t dark:border-white/10 flex-shrink-0">
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddInteraction(false)}
                  className="dark:bg-black dark:text-white dark:border-white/20 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInteraction}
                  className="h-10"
                >
                  Add Interaction
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
})

