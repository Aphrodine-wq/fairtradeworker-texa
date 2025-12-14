import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { EnvelopeSimple, DeviceMobile, Tag, Note, CurrencyDollar } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, CRMCustomer, CRMCustomerStatus } from "@/lib/types"

interface CRMKanbanProps {
  user: User
}

export function CRMKanban({ user }: CRMKanbanProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [draggedCustomer, setDraggedCustomer] = useState<CRMCustomer | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<CRMCustomerStatus | null>(null)

  const myCustomers = useMemo(() => {
    return (customers || []).filter(c => c.contractorId === user.id)
  }, [customers, user.id])

  const columns: { status: CRMCustomerStatus; title: string; color: string; bgColor: string }[] = [
    { status: 'lead', title: 'Leads', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
    { status: 'active', title: 'Active', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950/20' },
    { status: 'completed', title: 'Completed', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
    { status: 'advocate', title: 'Advocates', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/20' },
  ]

  const handleDragStart = (customer: CRMCustomer) => {
    setDraggedCustomer(customer)
  }

  const handleDragEnd = () => {
    setDraggedCustomer(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: CRMCustomerStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (newStatus: CRMCustomerStatus) => {
    if (!draggedCustomer) return

    if (draggedCustomer.status === newStatus) {
      setDraggedCustomer(null)
      setDragOverColumn(null)
      return
    }

    setCustomers((current) =>
      (current || []).map((c) =>
        c.id === draggedCustomer.id
          ? { ...c, status: newStatus, lastContact: new Date().toISOString() }
          : c
      )
    )

    toast.success(`${draggedCustomer.name} moved to ${columns.find(col => col.status === newStatus)?.title || newStatus}`)
    setDraggedCustomer(null)
    setDragOverColumn(null)
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
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-black dark:text-white">Kanban Board</h2>
        <p className="text-muted-foreground">
          Drag customers between columns to update their status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnCustomers = getCustomersByStatus(column.status)
          const isDragOver = dragOverColumn === column.status
          
          return (
            <div
              key={column.status}
              className="flex flex-col gap-3"
              onDrop={() => handleDrop(column.status)}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
            >
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isDragOver 
                  ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                  : 'border-black/10 dark:border-white/10 bg-white dark:bg-black'
              }`}>
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <Badge variant="secondary" className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                  {columnCustomers.length}
                </Badge>
              </div>

              <div className={`flex flex-col gap-3 min-h-[300px] p-2 rounded-lg transition-all ${
                isDragOver ? column.bgColor : ''
              }`}>
                {columnCustomers.map((customer) => {
                  const isDragging = draggedCustomer?.id === customer.id
                  
                  return (
                    <Card
                      key={customer.id}
                      draggable
                      onDragStart={() => handleDragStart(customer)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-move transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      } bg-white dark:bg-black border-black/10 dark:border-white/10`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold text-black dark:text-white">
                          {customer.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {customer.invitedVia === 'email' ? (
                            <>
                              <EnvelopeSimple size={12} />
                              <span className="truncate">{customer.email?.slice(0, 25)}</span>
                            </>
                          ) : (
                            <>
                              <DeviceMobile size={12} />
                              <span>{customer.phone}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-2">
                        {customer.lifetimeValue > 0 && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <CurrencyDollar size={12} weight="fill" />
                            ${customer.lifetimeValue.toLocaleString()} LTV
                          </div>
                        )}
                        
                        {getAutoTags(customer).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {getAutoTags(customer).slice(0, 2).map((tag, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="text-xs py-0 px-1.5 border-black/10 dark:border-white/10"
                              >
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

                        <div className="text-xs text-muted-foreground pt-1 border-t border-black/10 dark:border-white/10">
                          Last: {formatDate(customer.lastContact)}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {columnCustomers.length === 0 && (
                  <div className={`flex items-center justify-center p-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg transition-all ${
                    isDragOver 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                      : 'border-black/10 dark:border-white/10'
                  }`}>
                    {isDragOver ? 'Drop here!' : 'Drop customers here'}
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
