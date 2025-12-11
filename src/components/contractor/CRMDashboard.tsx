import { useState } from "react"
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
import { useKV } from "@github/spark/hooks"
import { Users, EnvelopeSimple, DeviceMobile, Note, Trash } from "@phosphor-icons/react"
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

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

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
      case 'invited':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'inactive':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users weight="duotone" size={32} className="text-primary" />
            Customer CRM
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your customer relationships and in-person sign-ups
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{myCustomers.length}</div>
          <div className="text-sm text-muted-foreground">Total Customers</div>
        </div>
      </div>

      <InstantInvite user={user} />

      {myCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users size={64} weight="duotone" className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No customers yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Use the instant invite form above to add your first customer to your CRM
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCustomers.map((customer) => (
            <Dialog key={customer.id}>
              <DialogTrigger asChild>
                <Card
                  className="cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all"
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{customer.name}</DialogTitle>
                  <DialogDescription>Customer details and notes</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      {customer.invitedVia === 'email' ? (
                        <>
                          <EnvelopeSimple weight="duotone" size={20} />
                          <span>{customer.email}</span>
                        </>
                      ) : (
                        <>
                          <DeviceMobile weight="duotone" size={20} />
                          <span>{customer.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>Invited</Label>
                    <div className="text-sm text-muted-foreground">
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
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm p-3 bg-muted rounded-lg min-h-[80px]">
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
  )
}
