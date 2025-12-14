import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calculator, Receipt, CheckCircle, Plus, Trash } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface TaxDeduction {
  id: string
  category: string
  description: string
  amount: number
  date: string
  receipt?: string
}

interface TaxForm {
  id: string
  name: string
  type: string
  status: 'not-started' | 'in-progress' | 'completed'
  dueDate: string
}

export function TaxHelper({ user }: { user: User }) {
  const [deductions, setDeductions] = useKV<TaxDeduction[]>("tax-deductions", [])
  const [forms, setForms] = useKV<TaxForm[]>("tax-forms", [])
  const [income, setIncome] = useState(0)
  const [year, setYear] = useState(new Date().getFullYear())

  const totalDeductions = useMemo(() => 
    deductions.reduce((sum, d) => sum + d.amount, 0), 
    [deductions]
  )

  const taxableIncome = useMemo(() => 
    Math.max(0, income - totalDeductions), 
    [income, totalDeductions]
  )

  const estimatedTax = useMemo(() => {
    if (taxableIncome <= 0) return 0
    // Simplified tax calculation (self-employment ~15.3% + federal)
    const selfEmploymentTax = taxableIncome * 0.153
    const federalTax = taxableIncome > 578125 ? taxableIncome * 0.37 : taxableIncome * 0.22
    return selfEmploymentTax + federalTax
  }, [taxableIncome])

  const deductionCategories = [
    'Vehicle & Mileage',
    'Office & Equipment',
    'Tools & Supplies',
    'Insurance',
    'Professional Services',
    'Meals & Entertainment',
    'Education & Training',
    'Home Office',
    'Phone & Internet',
    'Advertising',
    'Other'
  ]

  const commonForms = [
    { id: '1040', name: 'Form 1040', type: 'Individual Tax Return', dueDate: 'April 15' },
    { id: 'schedule-c', name: 'Schedule C', type: 'Business Income', dueDate: 'April 15' },
    { id: 'schedule-se', name: 'Schedule SE', type: 'Self-Employment Tax', dueDate: 'April 15' },
    { id: '1099', name: 'Form 1099-NEC', type: 'Non-Employee Compensation', dueDate: 'January 31' },
    { id: 'quarterly', name: 'Quarterly Payments', type: 'Estimated Tax', dueDate: 'Quarterly' }
  ]

  const handleAddDeduction = () => {
    const newDeduction: TaxDeduction = {
      id: `deduction-${Date.now()}`,
      category: 'Other',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    }
    setDeductions([...deductions, newDeduction])
  }

  const handleUpdateDeduction = (id: string, updates: Partial<TaxDeduction>) => {
    setDeductions(deductions.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const handleDeleteDeduction = (id: string) => {
    setDeductions(deductions.filter(d => d.id !== id))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <FileText weight="duotone" size={40} className="text-black dark:text-white" />
              <span className="text-black dark:text-white">Tax Helper</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Track deductions, manage forms, and estimate your taxes
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">
                  ${income.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Income</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${totalDeductions.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Deductions</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${taxableIncome.toLocaleString()}
                </div>
                <div className="text-sm text-sm text-muted-foreground mt-1">Taxable Income</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  ${estimatedTax.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Est. Tax Owed</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="deductions" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
              <TabsTrigger value="forms">Forms & Filing</TabsTrigger>
            </TabsList>

            <TabsContent value="deductions" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Track Deductions</h2>
                <Button onClick={handleAddDeduction}>
                  <Plus size={18} className="mr-2" />
                  Add Deduction
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deductions.map(deduction => (
                  <Card key={deduction.id} className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">{deduction.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDeduction(deduction.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Select
                            value={deduction.category}
                            onValueChange={(value) => handleUpdateDeduction(deduction.id, { category: value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {deductionCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Description</Label>
                          <Input
                            value={deduction.description}
                            onChange={(e) => handleUpdateDeduction(deduction.id, { description: e.target.value })}
                            placeholder="Brief description"
                            className="h-9"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Amount</Label>
                            <Input
                              type="number"
                              value={deduction.amount}
                              onChange={(e) => handleUpdateDeduction(deduction.id, { amount: parseFloat(e.target.value) || 0 })}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Date</Label>
                            <Input
                              type="date"
                              value={deduction.date}
                              onChange={(e) => handleUpdateDeduction(deduction.id, { date: e.target.value })}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {deductions.length === 0 && (
                  <Card className="col-span-2 bg-white dark:bg-black border border-black/10 dark:border-white/10">
                    <CardContent className="p-12 text-center">
                      <FileText size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No deductions tracked yet</p>
                      <Button onClick={handleAddDeduction} className="mt-4">
                        Add Your First Deduction
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardHeader>
                  <CardTitle>Tax Calculator</CardTitle>
                  <CardDescription>Estimate your tax liability for {year}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Tax Year</Label>
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2023, 2022, 2021].map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Total Business Income</Label>
                    <Input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                      placeholder="Enter your total income"
                      className="h-11 text-lg"
                    />
                  </div>
                  <div className="p-6 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex justify-between text-base">
                      <span>Total Income:</span>
                      <span className="font-semibold">${income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Total Deductions:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">-${totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Taxable Income:</span>
                      <span className="text-blue-600 dark:text-blue-400">${taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-red-600 dark:text-red-400">
                      <span>Estimated Tax Owed:</span>
                      <span>${estimatedTax.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                    <p className="font-semibold mb-1">💡 Tax Tip</p>
                    <p className="text-muted-foreground">
                      This is an estimate. Consult a tax professional for accurate calculations.
                      Keep receipts for all deductions. File quarterly estimated taxes if your tax liability exceeds $1,000.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms" className="mt-6 space-y-4">
              <h2 className="text-2xl font-semibold">Tax Forms & Filing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonForms.map(form => (
                  <Card key={form.id} className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{form.name}</CardTitle>
                          <CardDescription>{form.type}</CardDescription>
                        </div>
                        <Badge variant="outline">Due: {form.dueDate}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Download Form
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Guide
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle size={32} weight="fill" className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Filing Assistance</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use our deduction tracker throughout the year, then export your data for your tax professional.
                        Keep all receipts organized and consider filing quarterly estimated taxes.
                      </p>
                      <Button>
                        Export Deduction Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}