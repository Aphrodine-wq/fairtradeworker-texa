import { useState, useMemo, useCallback } from "react"
import { safeInput } from "@/lib/utils"
import { CircleNotch } from "@phosphor-icons/react"
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    customerName?: string
    jobDescription?: string
    warrantyType?: string
    durationMonths?: string
    startDate?: string
  }>({})

  const handleAddWarranty = useCallback(async () => {
    setErrors({})
    
    // Validation
    if (!customerName.trim()) {
      setErrors({ customerName: "Customer name is required" })
      toast.error("Please enter customer name")
      return
    } else if (customerName.trim().length < 2) {
      setErrors({ customerName: "Name must be at least 2 characters" })
      toast.error("Customer name must be at least 2 characters")
      return
    }

    if (!jobDescription.trim()) {
      setErrors({ jobDescription: "Job description is required" })
      toast.error("Please enter job description")
      return
    } else if (jobDescription.trim().length < 3) {
      setErrors({ jobDescription: "Description must be at least 3 characters" })
      toast.error("Job description must be at least 3 characters")
      return
    }

    if (!warrantyType.trim()) {
      setErrors({ warrantyType: "Warranty type is required" })
      toast.error("Please enter warranty type")
      return
    } else if (warrantyType.trim().length < 2) {
      setErrors({ warrantyType: "Warranty type must be at least 2 characters" })
      toast.error("Warranty type must be at least 2 characters")
      return
    }

    const months = parseInt(durationMonths)
    if (isNaN(months) || months <= 0) {
      setErrors({ durationMonths: "Duration must be greater than 0" })
      toast.error("Please enter a valid warranty duration")
      return
    } else if (months > 120) {
      setErrors({ durationMonths: "Duration cannot exceed 120 months" })
      toast.error("Duration cannot exceed 120 months")
      return
    }

    if (!startDate) {
      setErrors({ startDate: "Start date is required" })
      toast.error("Please select a start date")
      return
    }

    const start = new Date(startDate)
    if (start > new Date()) {
      setErrors({ startDate: "Start date cannot be in the future" })
      toast.error("Start date cannot be in the future")
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 400))

      const end = new Date(start)
      end.setMonth(end.getMonth() + months)

      const newWarranty: Warranty = {
        id: `warranty-${Date.now()}`,
        customerId: `customer-${customerName.toLowerCase().replace(/\s+/g, '-')}`,
        customerName: safeInput(customerName.trim()),
        jobDescription: safeInput(jobDescription.trim()),
        warrantyType: safeInput(warrantyType.trim()),
        durationMonths: months,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        notes: notes ? safeInput(notes.trim()) : undefined,
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
      setErrors({})
      setIsAddDialogOpen(false)

      toast.success("Warranty added successfully!")
    } catch (error) {
      console.error("Error adding warranty:", error)
      toast.error("Failed to add warranty. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [customerName, jobDescription, warrantyType, durationMonths, startDate, notes, warranties])

  const [deletingWarrantyId, setDeletingWarrantyId] = useState<string | null>(null)

  const handleDeleteWarranty = useCallback(async (id: string) => {
    if (deletingWarrantyId) return

    const warranty = warranties.find(w => w.id === id)
    const confirmed = window.confirm(
      warranty 
        ? `Are you sure you want to delete the warranty for "${warranty.customerName}"? This action cannot be undone.`
        : "Are you sure you want to delete this warranty? This action cannot be undone."
    )
    if (!confirmed) return

    setDeletingWarrantyId(id)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setWarranties(warranties.filter(w => w.id !== id))
      toast.success("Warranty deleted successfully")
    } catch (error) {
      console.error("Error deleting warranty:", error)
      toast.error('Failed to delete warranty. Please try again.')
    } finally {
      setDeletingWarrantyId(null)
    }
  }, [warranties, deletingWarrantyId])

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getWarrantyStatus = (endDate: string) => {
    const days = getDaysRemaining(endDate)
    if (days < 0) return { text: "Expired", color: "bg-white dark:bg-black border-0 shadow-md hover:shadow-lg", icon: Clock }
    if (days <= 30) return { text: `${days} days left`, color: "bg-white dark:bg-black border-0 shadow-md hover:shadow-lg", icon: Warning }
    if (days <= 90) return { text: `${days} days left`, color: "bg-white dark:bg-black border-0 shadow-md hover:shadow-lg", icon: Clock }
    return { text: `${days} days left`, color: "bg-white dark:bg-black border-0 shadow-md hover:shadow-lg", icon: CheckCircle }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-white dark:bg-black border-0 shadow-md hover:shadow-lg flex items-center justify-center shadow-sm">
              <ShieldCheck weight="fill" className="text-black dark:text-white" size={24} />
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
            <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
              <div className="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl">Add New Warranty</DialogTitle>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(safeInput(e.target.value))
                      if (errors.customerName) setErrors(prev => ({ ...prev, customerName: undefined }))
                    }}
                    onBlur={() => {
                      if (customerName && customerName.trim().length < 2) {
                        setErrors(prev => ({ ...prev, customerName: "Name must be at least 2 characters" }))
                      }
                    }}
                    className={errors.customerName ? "border-[#FF0000]" : ""}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!!errors.customerName}
                    aria-describedby={errors.customerName ? "customer-name-error" : undefined}
                  />
                  {errors.customerName && (
                    <p id="customer-name-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Input
                    id="jobDescription"
                    placeholder="Water heater installation"
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(safeInput(e.target.value))
                      if (errors.jobDescription) setErrors(prev => ({ ...prev, jobDescription: undefined }))
                    }}
                    onBlur={() => {
                      if (jobDescription && jobDescription.trim().length < 3) {
                        setErrors(prev => ({ ...prev, jobDescription: "Description must be at least 3 characters" }))
                      }
                    }}
                    className={errors.jobDescription ? "border-[#FF0000]" : ""}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!!errors.jobDescription}
                    aria-describedby={errors.jobDescription ? "job-description-error" : undefined}
                  />
                  {errors.jobDescription && (
                    <p id="job-description-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyType">Warranty Type *</Label>
                  <Input
                    id="warrantyType"
                    placeholder="Parts and Labor"
                    value={warrantyType}
                    onChange={(e) => {
                      setWarrantyType(safeInput(e.target.value))
                      if (errors.warrantyType) setErrors(prev => ({ ...prev, warrantyType: undefined }))
                    }}
                    onBlur={() => {
                      if (warrantyType && warrantyType.trim().length < 2) {
                        setErrors(prev => ({ ...prev, warrantyType: "Warranty type must be at least 2 characters" }))
                      }
                    }}
                    className={errors.warrantyType ? "border-[#FF0000]" : ""}
                    disabled={isSubmitting}
                    required
                    aria-invalid={!!errors.warrantyType}
                    aria-describedby={errors.warrantyType ? "warranty-type-error" : undefined}
                  />
                  {errors.warrantyType && (
                    <p id="warranty-type-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                      {errors.warrantyType}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationMonths">Duration (months)</Label>
                    <Input
                      id="durationMonths"
                      type="number"
                      min="1"
                      max="120"
                      value={durationMonths}
                      onChange={(e) => {
                        setDurationMonths(e.target.value)
                        if (errors.durationMonths) setErrors(prev => ({ ...prev, durationMonths: undefined }))
                      }}
                      onBlur={() => {
                        const months = parseInt(durationMonths)
                        if (isNaN(months) || months <= 0) {
                          setErrors(prev => ({ ...prev, durationMonths: "Duration must be greater than 0" }))
                        } else if (months > 120) {
                          setErrors(prev => ({ ...prev, durationMonths: "Duration cannot exceed 120 months" }))
                        }
                      }}
                      className={errors.durationMonths ? "border-[#FF0000]" : ""}
                      disabled={isSubmitting}
                      required
                      aria-invalid={!!errors.durationMonths}
                      aria-describedby={errors.durationMonths ? "duration-months-error" : undefined}
                    />
                    {errors.durationMonths && (
                      <p id="duration-months-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                        {errors.durationMonths}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        if (errors.startDate) setErrors(prev => ({ ...prev, startDate: undefined }))
                      }}
                      onBlur={() => {
                        if (!startDate) {
                          setErrors(prev => ({ ...prev, startDate: "Start date is required" }))
                        } else if (new Date(startDate) > new Date()) {
                          setErrors(prev => ({ ...prev, startDate: "Start date cannot be in the future" }))
                        }
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors.startDate ? "border-[#FF0000]" : ""}
                      disabled={isSubmitting}
                      required
                      aria-invalid={!!errors.startDate}
                      aria-describedby={errors.startDate ? "start-date-error" : undefined}
                    />
                    {errors.startDate && (
                      <p id="start-date-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                        {errors.startDate}
                      </p>
                    )}
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
              <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                <DialogFooter className="gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-11">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddWarranty} 
                    className="h-11 border-0 shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Warranty
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="p-4 bg-white dark:bg-black rounded-md border-0 shadow-md hover:shadow-lg shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Active Warranties</p>
            <p className="text-3xl font-bold text-black dark:text-white">{activeWarranties.length}</p>
          </div>

          <div className="p-4 bg-white dark:bg-black rounded-md border-0 shadow-md hover:shadow-lg shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Expiring Soon (30 days)</p>
            <p className="text-3xl font-bold text-black dark:text-white">{expiringIn30Days.length}</p>
          </div>

          <div className="p-4 bg-white dark:bg-black rounded-md border-0 shadow-md hover:shadow-lg shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Expired</p>
            <p className="text-3xl font-bold text-black dark:text-white">{expiredWarranties.length}</p>
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
                <Warning size={20} className="text-black dark:text-white" />
                Expiring Soon
              </h3>
              <div className="space-y-3">
                {expiringIn30Days.map(warranty => {
                  const status = getWarrantyStatus(warranty.endDate)
                  return (
                    <Card key={warranty.id} className="p-4 border-0 shadow-md hover:shadow-lg bg-white dark:bg-black">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User size={16} className="text-muted-foreground" />
                            <span className="font-semibold">{warranty.customerName}</span>
                            <Badge className={`${status.color} text-black dark:text-white`}>
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
                <CheckCircle size={20} className="text-black dark:text-white" />
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
                            <Badge className={`${status.color} text-black dark:text-white`}>
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
                <Clock size={20} className="text-black dark:text-white" />
                Expired Warranties
              </h3>
              <div className="space-y-3">
                {expiredWarranties.slice(0, 5).map(warranty => (
                  <Card key={warranty.id} className="p-4 opacity-100 border-0 shadow-md hover:shadow-lg">
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
