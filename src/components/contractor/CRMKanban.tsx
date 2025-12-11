import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useKV } from "@github/spark/hooks"
import { EnvelopeSimple, DeviceMobile, Tag, Note } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, CRMCustomer, CRMCustomerStatus } from "@/lib/types"

interface CRMKanbanProps {
  user: User
}

export function CRMKanban({ user }: CRMKanbanProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [draggedCustomer, setDraggedCustomer] = useState<CRMCustomer | null>(null)

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)

  const columns: { status: CRMCustomerStatus; title: string; color: string }[] = [
    { status: 'lead', title: 'Leads', color: 'text-blue-600' },
    { status: 'active', title: 'Active', color: 'text-green-600' },
    { status: 'completed', title: 'Completed', color: 'text-purple-600' },
    { status: 'advocate', title: 'Advocates', color: 'text-amber-600' },
  ]

  const handleDragStart = (customer: CRMCustomer) => {
    setDraggedCustomer(customer)
  }

  const handleDrop = (newStatus: CRMCustomerStatus) => {
    if (!draggedCustomer) return

    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === draggedCustomer.id
          ? { ...c, status: newStatus, lastContact: new Date().toISOString() }
          : c
      )
    )

    toast.success(`${draggedCustomer.name} moved to ${newStatus}`)
    setDraggedCustomer(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getCustomersByStatus = (status: CRMCustomerStatus) => {
    return myCustomers.filter(c => c.status === status)
  }

  const getAutoTags = (customer: CRMCustomer): string[] => {
    const tags: string[] = []
    if (customer.lifetimeValue > 1000) tags.push('High Value')
    if (customer.tags.includes('referrer')) tags.push('Referrer')
    return [...tags, ...customer.tags]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CRM Kanban Board</h2>
        <p className="text-muted-foreground mt-1">
          Drag customers between stages to update their status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnCustomers = getCustomersByStatus(column.status)
          
          return (
            <div
              key={column.status}
              className="flex flex-col gap-3"
              onDrop={() => handleDrop(column.status)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <Badge variant="secondary">{columnCustomers.length}</Badge>
              </div>

              <div className="flex flex-col gap-2 min-h-[400px]">
                {columnCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    draggable
                    onDragStart={() => handleDragStart(customer)}
                    className="cursor-move hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">{customer.name}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {customer.invitedVia === 'email' ? (
                          <>
                            <EnvelopeSimple size={12} />
                            {customer.email?.slice(0, 20)}
                          </>
                        ) : (
                          <>
                            <DeviceMobile size={12} />
                            {customer.phone}
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        {customer.lifetimeValue > 0 && (
                          <div className="text-xs font-semibold text-green-600">
                            ${customer.lifetimeValue.toLocaleString()} LTV
                          </div>
                        )}
                        
                        {getAutoTags(customer).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {getAutoTags(customer).slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs py-0 px-1.5">
                                <Tag size={10} weight="fill" className="mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {customer.notes && (
                          <div className="text-xs text-muted-foreground flex items-start gap-1">
                            <Note size={12} weight="duotone" className="mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{customer.notes}</span>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Last: {formatDate(customer.lastContact)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnCustomers.length === 0 && (
                  <div className="flex items-center justify-center p-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
