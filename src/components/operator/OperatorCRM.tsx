import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, House, Wrench, ChartLine } from "@phosphor-icons/react"
import type { Job, User } from "@/lib/types"

interface OperatorCRMProps {
  jobs: Job[]
  contractors: User[]
  homeowners: User[]
}

export function OperatorCRM({ jobs, contractors, homeowners }: OperatorCRMProps) {
  const openJobs = jobs.filter((j) => j.status === "open")
  const activeJobs = jobs.filter((j) => j.status === "in-progress")
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
  const topContractors = [...contractors]
    .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Homeowners</p>
                <p className="text-3xl font-bold">{homeowners.length}</p>
              </div>
              <House size={28} className="text-primary" weight="duotone" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contractors</p>
                <p className="text-3xl font-bold">{contractors.length}</p>
              </div>
              <Users size={28} className="text-primary" weight="duotone" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold">{activeJobs.length}</p>
              </div>
              <Wrench size={28} className="text-primary" weight="duotone" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={18} weight="duotone" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px] pr-2">
              <div className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No jobs yet.</p>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.status} • {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users size={18} weight="duotone" />
              Top Contractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContractors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No contractors yet.</p>
              ) : (
                topContractors.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">Score: {c.performanceScore || 0}</p>
                    </div>
                    {c.isPro && <Badge variant="outline">PRO</Badge>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users size={18} weight="duotone" />
            Homeowners in Territory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] pr-2">
            <div className="space-y-2">
              {homeowners.length === 0 ? (
                <p className="text-muted-foreground text-sm">No homeowners yet.</p>
              ) : (
                homeowners.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{h.fullName}</p>
                      <p className="text-xs text-muted-foreground">{h.email}</p>
                    </div>
                    <Badge variant="outline">Homeowner</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
