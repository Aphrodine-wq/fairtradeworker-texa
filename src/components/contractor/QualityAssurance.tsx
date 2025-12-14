import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Plus, Star, AlertCircle, Camera } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface Inspection {
  id: string
  jobId: string
  jobName: string
  date: string
  score: number
  items: InspectionItem[]
  notes: string
  photos?: string[]
  inspector: string
  status: 'passed' | 'failed' | 'pending'
}

interface InspectionItem {
  id: string
  name: string
  category: string
  passed: boolean
  notes?: string
}

export function QualityAssurance({ user }: { user: User }) {
  const [inspections, setInspections] = useKV<Inspection[]>("quality-inspections", [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newInspection, setNewInspection] = useState<Partial<Inspection>>({
    jobName: '',
    date: new Date().toISOString().split('T')[0],
    score: 100,
    items: [],
    notes: '',
    inspector: user.fullName,
    status: 'pending'
  })

  const avgScore = useMemo(() => {
    if (inspections.length === 0) return 0
    const total = inspections.reduce((sum, inv) => sum + inv.score, 0)
    return Math.round(total / inspections.length)
  }, [inspections])

  const passedCount = useMemo(() => 
    inspections.filter(inv => inv.status === 'passed').length,
    [inspections]
  )

  const inspectionCategories = [
    'Safety',
    'Quality',
    'Code Compliance',
    'Workmanship',
    'Cleanliness',
    'Materials'
  ]

  const standardItems = [
    { name: 'All work meets code requirements', category: 'Code Compliance' },
    { name: 'No safety hazards present', category: 'Safety' },
    { name: 'Workmanship meets standards', category: 'Workmanship' },
    { name: 'Job site is clean and organized', category: 'Cleanliness' },
    { name: 'Materials are properly installed', category: 'Materials' },
    { name: 'Quality checks completed', category: 'Quality' }
  ]

  const handleAddItem = () => {
    const item: InspectionItem = {
      id: `item-${Date.now()}`,
      name: '',
      category: 'Quality',
      passed: false
    }
    setNewInspection({
      ...newInspection,
      items: [...(newInspection.items || []), item]
    })
  }

  const handleSaveInspection = () => {
    if (!newInspection.jobName || !newInspection.items || newInspection.items.length === 0) return

    const passedItems = newInspection.items.filter(item => item.passed).length
    const totalItems = newInspection.items.length
    const score = Math.round((passedItems / totalItems) * 100)

    const inspection: Inspection = {
      id: `inspection-${Date.now()}`,
      jobId: `job-${Date.now()}`,
      jobName: newInspection.jobName!,
      date: newInspection.date || new Date().toISOString().split('T')[0],
      score,
      items: newInspection.items,
      notes: newInspection.notes || '',
      inspector: user.fullName,
      status: score >= 80 ? 'passed' : 'failed'
    }

    setInspections([...inspections, inspection])
    setNewInspection({
      jobName: '',
      date: new Date().toISOString().split('T')[0],
      score: 100,
      items: [],
      notes: '',
      inspector: user.fullName,
      status: 'pending'
    })
    setShowAddDialog(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <CheckCircle weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Quality Assurance</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Inspections, scoring, and compliance tracking
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-2" />
                  New Inspection
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl">New Quality Inspection</DialogTitle>
                    <DialogDescription>Record inspection results and compliance</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-hidden p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Job Name</Label>
                        <Input
                          value={newInspection.jobName}
                          onChange={(e) => setNewInspection({ ...newInspection, jobName: e.target.value })}
                          placeholder="e.g., Kitchen Remodel - 123 Main St"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label>Inspection Date</Label>
                        <Input
                          type="date"
                          value={newInspection.date}
                          onChange={(e) => setNewInspection({ ...newInspection, date: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <Button variant="outline" onClick={handleAddItem} className="w-full">
                        <Plus size={18} className="mr-2" />
                        Add Inspection Item
                      </Button>
                      {standardItems.map((std, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const item: InspectionItem = {
                              id: `item-${Date.now()}-${idx}`,
                              name: std.name,
                              category: std.category,
                              passed: false
                            }
                            setNewInspection({
                              ...newInspection,
                              items: [...(newInspection.items || []), item]
                            })
                          }}
                        >
                          Add: {std.name}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Inspection Items</Label>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {(newInspection.items || []).map((item, idx) => (
                            <Card key={item.id} className="p-3">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={item.passed}
                                  onChange={(e) => {
                                    const updatedItems = [...(newInspection.items || [])]
                                    updatedItems[idx] = { ...item, passed: e.target.checked }
                                    setNewInspection({ ...newInspection, items: updatedItems })
                                  }}
                                  className="mt-1 w-4 h-4"
                                />
                                <div className="flex-1">
                                  <Input
                                    value={item.name}
                                    onChange={(e) => {
                                      const updatedItems = [...(newInspection.items || [])]
                                      updatedItems[idx] = { ...item, name: e.target.value }
                                      setNewInspection({ ...newInspection, items: updatedItems })
                                    }}
                                    placeholder="Inspection item"
                                    className="h-9 mb-2"
                                  />
                                  <Select
                                    value={item.category}
                                    onValueChange={(v) => {
                                      const updatedItems = [...(newInspection.items || [])]
                                      updatedItems[idx] = { ...item, category: v }
                                      setNewInspection({ ...newInspection, items: updatedItems })
                                    }}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {inspectionCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={newInspection.notes}
                          onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
                          placeholder="Additional notes..."
                          className="h-24"
                        />
                      </div>
                      {(newInspection.items || []).length > 0 && (
                        <Card className="bg-muted/50 p-4">
                          <div className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span>Items Passed:</span>
                              <span className="font-semibold">
                                {(newInspection.items || []).filter(i => i.passed).length} / {(newInspection.items || []).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estimated Score:</span>
                              <span className={`font-bold ${getScoreColor(
                                (newInspection.items || []).length > 0
                                  ? Math.round(((newInspection.items || []).filter(i => i.passed).length / (newInspection.items || []).length) * 100)
                                  : 100
                              )}`}>
                                {(newInspection.items || []).length > 0
                                  ? Math.round(((newInspection.items || []).filter(i => i.passed).length / (newInspection.items || []).length) * 100)
                                  : 100}%
                              </span>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="h-11">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveInspection} className="h-11">
                      Save Inspection
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">{inspections.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Inspections</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                  {avgScore}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Avg Score</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {passedCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Passed</div>
              </CardContent>
            </Card>
          </div>

          {/* Inspections List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspections.map(inspection => (
              <Card
                key={inspection.id}
                className="bg-white dark:bg-black border border-black/10 dark:border-white/10"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-black dark:text-white">{inspection.jobName}</CardTitle>
                      <CardDescription>
                        {new Date(inspection.date).toLocaleDateString()} • {inspection.inspector}
                      </CardDescription>
                    </div>
                    <Badge variant={inspection.status === 'passed' ? 'default' : 'destructive'}>
                      {inspection.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                      <div className="flex items-center gap-2">
                        <Star weight="fill" size={16} className={getScoreColor(inspection.score)} />
                        <span className={`font-bold ${getScoreColor(inspection.score)}`}>
                          {inspection.score}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {inspection.items.filter(i => i.passed).length} of {inspection.items.length} items passed
                    </div>
                    {inspection.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {inspection.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {inspections.length === 0 && (
              <Card className="col-span-full bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardContent className="p-12 text-center">
                  <CheckCircle size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg">No inspections yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Track quality and compliance for your projects
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus size={18} className="mr-2" />
                    Create First Inspection
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}