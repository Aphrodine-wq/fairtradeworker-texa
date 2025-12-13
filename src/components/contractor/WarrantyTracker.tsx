import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  ShieldCheck, 
  Plus, 
  Clock, 
  User,
  Calendar,
  Warning,
  CheckCircle,
  Trash
} from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User } from "@/lib/types"

interface Warranty {
  id: string
  customerId: string
  customerName: string
  jobDescription: string
  warrantyType: string
  durationMonths: number
  startDate: string
  endDate: string
  notes?: string
  createdAt: string
}

interface WarrantyTrackerProps {
  user: User
}

export function WarrantyTracker({ user }: WarrantyTrackerProps) {
  const [warranties, setWarranties] = useKV<Warranty[]>(`warranties-${user.id}`, [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // Form state
  const [customerName, setCustomerName] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [warrantyType, setWarrantyType] = useState("")
  const [durationMonths, setDurationMonths] = useState("12")
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState("")

  const sortedWarranties = useMemo(() => {
    if (!warranties) return []
    return [...warranties].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
  }, [warranties])

  const activeWarranties = useMemo(() => 
    sortedWarranties.filter(w => new Date(w.endDate) > new Date()),
    [sortedWarranties]
  )

  const expiredWarranties = useMemo(() => 
    sortedWarranties.filter(w => new Date(w.endDate) <= new Date()),
    [sortedWarranties]
  )

  const expiringIn30Days = useMemo(() => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return activeWarranties.filter(w => 
      new Date(w.endDate) <= thirtyDaysFromNow
    )
  }, [activeWarranties])

  const handleAddWarranty = () => {
    if (!customerName.trim() || !jobDescription.trim() || !warrantyType.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const months = parseInt(durationMonths)
    if (isNaN(months) || months <= 0) {
      toast.error("Please enter a valid warranty duration")
      return
    }

    const start = new Date(startDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + months)

    const newWarranty: Warranty = {
      id: `warranty-${Date.now()}`,
      customerId: `customer-${customerName.toLowerCase().replace(/\s+/g, '-')}`,
      customerName: customerName.trim(),
      jobDescription: jobDescription.trim(),
      warrantyType: warrantyType.trim(),
      durationMonths: months,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    }

    setWarranties([...(warranties || []), newWarranty])
    
    // Reset form
    setCustomerName("")
    setJobDescription("")
    setWarrantyType("")
    setDurationMonths("12")
    setStartDate(new Date().toISOString().split('T')[0])
    setNotes("")
    setIsAddDialogOpen(false)

    toast.success("Warranty added successfully!")
  }

  const handleDeleteWarranty = (id: string) => {
    if (confirm("Are you sure you want to delete this warranty?")) {
      setWarranties(warranties.filter(w => w.id !== id))
      toast.success("Warranty deleted")
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getWarrantyStatus = (endDate: string) => {
    const days = getDaysRemaining(endDate)
    if (days < 0) return { text: "Expired", color: "bg-white dark:bg-black border-2 border-gray-500", icon: Clock }
    if (days <= 30) return { text: `${days} days left`, color: "bg-red-500", icon: Warning }
    if (days <= 90) return { text: `${days} days left`, color: "bg-yellow-500", icon: Clock }
    return { text: `${days} days left`, color: "bg-green-500", icon: CheckCircle }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-green-500/5 border-green-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <ShieldCheck weight="fill" className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Warranty Tracker</h2>
              <p className="text-sm text-muted-foreground">
                Never lose track of warranties you've given
              </p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add Warranty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Warranty</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Input
                    id="jobDescription"
                    placeholder="Water heater installation"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyType">Warranty Type *</Label>
                  <Input
                    id="warrantyType"
                    placeholder="Parts and Labor"
                    value={warrantyType}
                    onChange={(e) => setWarrantyType(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationMonths">Duration (months)</Label>
                    <Input
                      id="durationMonths"
                      type="number"
                      min="1"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special conditions or notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWarranty}>
                  Add Warranty
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-muted-foreground mb-1">Active Warranties</p>
            <p className="text-3xl font-bold text-green-500">{activeWarranties.length}</p>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-sm text-muted-foreground mb-1">Expiring Soon (30 days)</p>
            <p className="text-3xl font-bold text-yellow-500">{expiringIn30Days.length}</p>
          </div>

          <div className="p-4 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10">
            <p className="text-sm text-muted-foreground mb-1">Expired</p>
            <p className="text-3xl font-bold text-gray-500">{expiredWarranties.length}</p>
          </div>
        </div>
      </Card>

      {activeWarranties.length === 0 && expiredWarranties.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <ShieldCheck size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No warranties yet</p>
          <p className="text-muted-foreground mb-4">
            Track all warranties you give to customers in one place
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Your First Warranty
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {expiringIn30Days.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Warning size={20} className="text-yellow-500" />
                Expiring Soon
              </h3>
              <div className="space-y-3">
                {expiringIn30Days.map(warranty => {
                  const status = getWarrantyStatus(warranty.endDate)
                  return (
                    <Card key={warranty.id} className="p-4 border-yellow-500/30 bg-yellow-500/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User size={16} className="text-muted-foreground" />
                            <span className="font-semibold">{warranty.customerName}</span>
                            <Badge className={`${status.color} text-white`}>
                              {status.text}
                            </Badge>
                          </div>
                          <p className="text-sm mb-1">{warranty.jobDescription}</p>
                          <p className="text-xs text-muted-foreground">
                            {warranty.warrantyType} • Ends {new Date(warranty.endDate).toLocaleDateString()}
                          </p>
                          {warranty.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Note: {warranty.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWarranty(warranty.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeWarranties.filter(w => !expiringIn30Days.includes(w)).length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Active Warranties
              </h3>
              <div className="space-y-3">
                {activeWarranties.filter(w => !expiringIn30Days.includes(w)).map(warranty => {
                  const status = getWarrantyStatus(warranty.endDate)
                  return (
                    <Card key={warranty.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User size={16} className="text-muted-foreground" />
                            <span className="font-semibold">{warranty.customerName}</span>
                            <Badge className={`${status.color} text-white`}>
                              {status.text}
                            </Badge>
                          </div>
                          <p className="text-sm mb-1">{warranty.jobDescription}</p>
                          <p className="text-xs text-muted-foreground">
                            {warranty.warrantyType} • Ends {new Date(warranty.endDate).toLocaleDateString()}
                          </p>
                          {warranty.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Note: {warranty.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWarranty(warranty.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {expiredWarranties.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Clock size={20} className="text-gray-500" />
                Expired Warranties
              </h3>
              <div className="space-y-3">
                {expiredWarranties.slice(0, 5).map(warranty => (
                  <Card key={warranty.id} className="p-4 opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-muted-foreground" />
                          <span className="font-semibold">{warranty.customerName}</span>
                          <Badge className="bg-white dark:bg-black border-2 border-gray-500 text-black dark:text-white">
                            Expired
                          </Badge>
                        </div>
                        <p className="text-sm mb-1">{warranty.jobDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          {warranty.warrantyType} • Ended {new Date(warranty.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteWarranty(warranty.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
