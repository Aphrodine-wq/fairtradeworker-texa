import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Funnel, ArrowRight, CheckCircle, Clock, XCircle,
  FileText, Hammer, Calendar, DollarSign, MapPin
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job, Bid, CRMCustomer } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ConstructionPipelineProps {
  user: User
}

type PipelineStage = 'lead' | 'bidding' | 'won' | 'active' | 'completed'

interface PipelineItem {
  id: string
  type: 'lead' | 'bid' | 'project'
  title: string
  customer?: string
  value: number
  stage: PipelineStage
  date: string
  job?: Job
  bid?: Bid
  customerData?: CRMCustomer
}

export function ConstructionPipeline({ user }: ConstructionPipelineProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null)

  const pipelineItems = useMemo(() => {
    const items: PipelineItem[] = []

    // Add leads (customers without active bids/projects)
    const leads = customers.filter(c => 
      c.contractorId === user.id && 
      c.status === 'lead' &&
      !jobs.some(j => 
        j.homeownerId === c.id && 
        j.bids.some(b => b.contractorId === user.id)
      )
    )
    
    leads.forEach(lead => {
      items.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: lead.name,
        customer: lead.name,
        value: lead.lifetimeValue || 0,
        stage: 'lead',
        date: lead.createdAt,
        customerData: lead
      })
    })

    // Add active bids
    jobs.forEach(job => {
      const myBid = job.bids.find(b => b.contractorId === user.id && b.status === 'pending')
      if (myBid) {
        const customer = customers.find(c => c.id === job.homeownerId)
        items.push({
          id: `bid-${myBid.id}`,
          type: 'bid',
          title: job.title,
          customer: customer?.name || 'Unknown',
          value: myBid.amount,
          stage: 'bidding',
          date: myBid.createdAt || job.createdAt,
          job,
          bid: myBid,
          customerData: customer
        })
      }
    })

    // Add won bids (accepted but not started)
    jobs.forEach(job => {
      const myBid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
      if (myBid && job.status === 'open') {
        const customer = customers.find(c => c.id === job.homeownerId)
        items.push({
          id: `won-${myBid.id}`,
          type: 'project',
          title: job.title,
          customer: customer?.name || 'Unknown',
          value: myBid.amount,
          stage: 'won',
          date: myBid.createdAt || job.createdAt,
          job,
          bid: myBid,
          customerData: customer
        })
      }
    })

    // Add active projects
    jobs.forEach(job => {
      if (job.status === 'in-progress' && job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')) {
        const myBid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
        const customer = customers.find(c => c.id === job.homeownerId)
        items.push({
          id: `project-${job.id}`,
          type: 'project',
          title: job.title,
          customer: customer?.name || 'Unknown',
          value: myBid?.amount || 0,
          stage: 'active',
          date: job.createdAt,
          job,
          bid: myBid,
          customerData: customer
        })
      }
    })

    // Add completed projects
    jobs.forEach(job => {
      if (job.status === 'completed' && job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')) {
        const myBid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
        const customer = customers.find(c => c.id === job.homeownerId)
        items.push({
          id: `completed-${job.id}`,
          type: 'project',
          title: job.title,
          customer: customer?.name || 'Unknown',
          value: myBid?.amount || 0,
          stage: 'completed',
          date: job.createdAt,
          job,
          bid: myBid,
          customerData: customer
        })
      }
    })

    return items
  }, [jobs, customers, user.id])

  const stageStats = useMemo(() => {
    const stats = {
      lead: { count: 0, value: 0 },
      bidding: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
      active: { count: 0, value: 0 },
      completed: { count: 0, value: 0 }
    }

    pipelineItems.forEach(item => {
      stats[item.stage].count++
      stats[item.stage].value += item.value
    })

    return stats
  }, [pipelineItems])

  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'lead': return 'bg-gray-500'
      case 'bidding': return 'bg-blue-500'
      case 'won': return 'bg-green-500'
      case 'active': return 'bg-orange-500'
      case 'completed': return 'bg-purple-500'
    }
  }

  const getStageIcon = (stage: PipelineStage) => {
    switch (stage) {
      case 'lead': return <Clock weight="fill" size={16} />
      case 'bidding': return <FileText weight="fill" size={16} />
      case 'won': return <CheckCircle weight="fill" size={16} />
      case 'active': return <Hammer weight="fill" size={16} />
      case 'completed': return <CheckCircle weight="fill" size={16} />
    }
  }

  const stages: PipelineStage[] = ['lead', 'bidding', 'won', 'active', 'completed']
  const stageLabels = {
    lead: 'Leads',
    bidding: 'Bidding',
    won: 'Won',
    active: 'Active',
    completed: 'Completed'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <Funnel weight="duotone" size={28} className="text-black dark:text-white" />
          Project & Bid Pipeline
        </h2>
        <p className="text-muted-foreground mt-1">
          Track leads, bids, and projects through the entire construction lifecycle
        </p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        {stages.map(stage => (
          <Card key={stage} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stageLabels[stage]}</span>
                <div className={`w-3 h-3 rounded-full ${getStageColor(stage)}`} />
              </div>
              <div className="text-2xl font-bold text-black dark:text-white">
                {stageStats[stage].count}
              </div>
              <div className="text-xs text-muted-foreground">
                ${stageStats[stage].value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {stages.map(stage => {
            const stageItems = pipelineItems.filter(item => item.stage === stage)
            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getStageIcon(stage)}
                    <h3 className="font-semibold text-black dark:text-white">
                      {stageLabels[stage]}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {stageItems.length}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${stageStats[stage].value.toLocaleString()} total
                  </div>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {stageItems.map(item => (
                    <Card
                      key={item.id}
                      className="bg-white dark:bg-black border border-black/20 dark:border-white/20 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-black dark:text-white line-clamp-2">
                              {item.title}
                            </h4>
                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                              {item.type}
                            </Badge>
                          </div>
                          {item.customer && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{item.customer}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-black dark:text-white">
                              ${item.value.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          {item.job && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-black/10 dark:border-white/10">
                              {item.job.size && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.job.size}
                                </Badge>
                              )}
                              {item.job.tier && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.job.tier}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageItems.length === 0 && (
                    <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20 border-dashed">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No items</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>
                  {selectedItem.type} • {stageLabels[selectedItem.stage]}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer</Label>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {selectedItem.customer || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <p className="text-sm font-medium text-black dark:text-white">
                      ${selectedItem.value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {new Date(selectedItem.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stage</Label>
                    <Badge variant="outline" className="mt-1">
                      {stageLabels[selectedItem.stage]}
                    </Badge>
                  </div>
                </div>
                {selectedItem.job && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <h4 className="font-semibold text-sm mb-2 text-black dark:text-white">Job Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Size: {selectedItem.job.size}</span>
                      </div>
                      {selectedItem.job.tier && (
                        <div className="flex items-center gap-2">
                          <Hammer size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">Tier: {selectedItem.job.tier}</span>
                        </div>
                      )}
                      {selectedItem.job.estimatedDays && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Est. Duration: {selectedItem.job.estimatedDays} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedItem.bid && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <h4 className="font-semibold text-sm mb-2 text-black dark:text-white">Bid Details</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.bid.message}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
