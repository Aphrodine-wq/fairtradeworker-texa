import { useState, useEffect, memo } from "react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, FileText, Warning, CheckCircle, XCircle, Download, Trash, Shield, Certificate, Briefcase, HardHat } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Certification, CertificationType, CertificationStatus, CertificationAlert } from "@/lib/types"

interface CertificationWalletProps {
  user: User
}

const CERTIFICATION_TYPES: { value: CertificationType; label: string; icon: any }[] = [
  { value: 'trade-license', label: 'Trade License', icon: FileText },
  { value: 'insurance', label: 'Insurance Certificate', icon: Shield },
  { value: 'background-check', label: 'Background Check', icon: FileText },
  { value: 'manufacturer-cert', label: 'Manufacturer Certification', icon: Certificate },
  { value: 'safety-training', label: 'Safety Training', icon: HardHat },
  { value: 'other', label: 'Other', icon: Briefcase },
]

const JOB_TYPES = [
  'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Carpentry', 
  'Painting', 'Flooring', 'Drywall', 'Appliance Repair',
  'Gas Line', 'Refrigerant Handling', 'Electrical Panel',
  'Water Heater', 'Septic', 'Foundation'
]

function getCertificationStatus(cert: Certification): { status: CertificationStatus; daysUntil: number } {
  if (cert.neverExpires || !cert.expirationDate) {
    return { status: 'active', daysUntil: Infinity }
  }
  
  const today = new Date()
  const expDate = new Date(cert.expirationDate)
  const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0) return { status: 'expired', daysUntil }
  if (daysUntil <= 60) return { status: 'expiring-soon', daysUntil }
  return { status: 'active', daysUntil }
}

function getStatusBadge(status: CertificationStatus, daysUntil: number) {
  switch (status) {
    case 'active':
      return <Badge className="bg-[#00FF00] text-black border-2 border-black dark:border-white"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
    case 'expiring-soon':
      return <Badge className="bg-[#FFFF00] text-black border-2 border-black dark:border-white"><Warning className="w-3 h-3 mr-1" />Expires in {daysUntil}d</Badge>
    case 'expired':
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>
  }
}

const CertificationCard = memo(({ cert, onEdit, onDelete }: { 
  cert: Certification
  onEdit: () => void
  onDelete: () => void
}) => {
  const { status, daysUntil } = getCertificationStatus(cert)
  const typeInfo = CERTIFICATION_TYPES.find(t => t.value === cert.type)
  const Icon = typeInfo?.icon || Briefcase

  return (
    <Card className="p-4 hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all border-2 border-black dark:border-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-none bg-black dark:bg-white border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white">{cert.name}</h3>
            <p className="text-sm text-black dark:text-white">{cert.issuingOrganization}</p>
            {cert.licenseNumber && (
              <p className="text-xs text-black dark:text-white mt-1">License #: {cert.licenseNumber}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cert.verifiedByPlatform && (
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />Verified
            </Badge>
          )}
          {getStatusBadge(status, daysUntil)}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-black dark:text-white">
          <span>Issued:</span>
          <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
        </div>
        {!cert.neverExpires && cert.expirationDate && (
          <div className="flex items-center justify-between text-black dark:text-white">
            <span>Expires:</span>
            <span className={status === 'expired' ? 'text-red-600 font-medium' : ''}>
              {new Date(cert.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {cert.coverageAmount && (
          <div className="flex items-center justify-between text-black dark:text-white">
            <span>Coverage:</span>
            <span className="font-medium">${cert.coverageAmount.toLocaleString()}</span>
          </div>
        )}
        {cert.jobTypesQualified && cert.jobTypesQualified.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-black dark:text-white mb-1">Qualifies for:</p>
            <div className="flex flex-wrap gap-1">
              {cert.jobTypesQualified.slice(0, 3).map(job => (
                <Badge key={job} variant="outline" className="text-xs">{job}</Badge>
              ))}
              {cert.jobTypesQualified.length > 3 && (
                <Badge variant="outline" className="text-xs">+{cert.jobTypesQualified.length - 3}</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t-2 border-black dark:border-white">
        {cert.fileUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(cert.fileUrl, '_blank')}
          >
            <Download className="w-4 h-4 mr-1" />
            View
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
})

CertificationCard.displayName = 'CertificationCard'

export function CertificationWallet({ user }: CertificationWalletProps) {
  const [certifications, setCertifications] = useKV<Certification[]>(`certifications-${user.id}`, [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<Certification | null>(null)
  const [filter, setFilter] = useState<'all' | CertificationStatus>('all')

  const [formData, setFormData] = useState({
    type: 'trade-license' as CertificationType,
    name: '',
    issuingOrganization: '',
    licenseNumber: '',
    issueDate: '',
    expirationDate: '',
    neverExpires: false,
    coverageAmount: '',
    notes: '',
    jobTypesQualified: [] as string[],
    verifiedByPlatform: false,
  })

  const alerts: CertificationAlert[] = (certifications || [])
    .map(cert => {
      const { status, daysUntil } = getCertificationStatus(cert)
      if (status === 'expired' || status === 'expiring-soon') {
        let urgency: CertificationAlert['urgency'] = 'info'
        if (status === 'expired') urgency = 'critical'
        else if (daysUntil <= 7) urgency = 'urgent'
        else if (daysUntil <= 30) urgency = 'warning'
        
        return {
          certificationId: cert.id,
          daysUntilExpiration: daysUntil,
          urgency
        }
      }
      return null
    })
    .filter((a): a is CertificationAlert => a !== null)
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)

  const filteredCerts = (certifications || []).filter(cert => {
    if (filter === 'all') return true
    return getCertificationStatus(cert).status === filter
  })

  const stats = {
    total: (certifications || []).length,
    active: (certifications || []).filter(c => getCertificationStatus(c).status === 'active').length,
    expiringSoon: (certifications || []).filter(c => getCertificationStatus(c).status === 'expiring-soon').length,
    expired: (certifications || []).filter(c => getCertificationStatus(c).status === 'expired').length,
  }

  const resetForm = () => {
    setFormData({
      type: 'trade-license',
      name: '',
      issuingOrganization: '',
      licenseNumber: '',
      issueDate: '',
      expirationDate: '',
      neverExpires: false,
      coverageAmount: '',
      notes: '',
      jobTypesQualified: [],
      verifiedByPlatform: false,
    })
    setEditingCert(null)
  }

  const handleEdit = (cert: Certification) => {
    setFormData({
      type: cert.type,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      licenseNumber: cert.licenseNumber || '',
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate || '',
      neverExpires: cert.neverExpires,
      coverageAmount: cert.coverageAmount?.toString() || '',
      notes: cert.notes || '',
      jobTypesQualified: cert.jobTypesQualified || [],
      verifiedByPlatform: cert.verifiedByPlatform,
    })
    setEditingCert(cert)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (cert: Certification) => {
    if (window.confirm(`Delete ${cert.name}?`)) {
      setCertifications((prev = []) => prev.filter(c => c.id !== cert.id))
      toast.success('Certification deleted')
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.issuingOrganization || !formData.issueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const now = new Date().toISOString()
    
    if (editingCert) {
      setCertifications((prev = []) => prev.map(c => 
        c.id === editingCert.id 
          ? {
              ...c,
              ...formData,
              coverageAmount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : undefined,
              status: getCertificationStatus({
                ...c,
                expirationDate: formData.expirationDate,
                neverExpires: formData.neverExpires
              } as Certification).status,
              updatedAt: now,
            }
          : c
      ))
      toast.success('Certification updated')
    } else {
      const newCert: Certification = {
        id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contractorId: user.id,
        ...formData,
        coverageAmount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : undefined,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }
      
      const { status } = getCertificationStatus(newCert)
      newCert.status = status
      
      setCertifications((prev = []) => [...prev, newCert])
      toast.success('Certification added')
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleJobTypeToggle = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypesQualified: prev.jobTypesQualified.includes(jobType)
        ? prev.jobTypesQualified.filter(j => j !== jobType)
        : [...prev.jobTypesQualified, jobType]
    }))
  }

  useEffect(() => {
    if (!isAddDialogOpen) {
      resetForm()
    }
  }, [isAddDialogOpen])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Certification Wallet</h2>
          <p className="text-sm text-black dark:text-white mt-1">
            Manage your licenses, insurance, and certifications
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCert ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as CertificationType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  placeholder="e.g., Master Plumber License"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Issuing Organization *</Label>
                <Input 
                  placeholder="e.g., Texas State Board of Plumbing Examiners"
                  value={formData.issuingOrganization}
                  onChange={(e) => setFormData(p => ({ ...p, issuingOrganization: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input 
                    placeholder="Optional"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(p => ({ ...p, licenseNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Amount</Label>
                  <Input 
                    type="number"
                    placeholder="For insurance only"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData(p => ({ ...p, coverageAmount: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date *</Label>
                  <Input 
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(p => ({ ...p, issueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Input 
                    type="date"
                    value={formData.expirationDate}
                    disabled={formData.neverExpires}
                    onChange={(e) => setFormData(p => ({ ...p, expirationDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.neverExpires}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, neverExpires: checked }))}
                />
                <Label>This certification never expires</Label>
              </div>

              <div className="space-y-2">
                <Label>Qualifies for Job Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  {JOB_TYPES.map(jobType => (
                    <label key={jobType} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.jobTypesQualified.includes(jobType)}
                        onChange={() => handleJobTypeToggle(jobType)}
                        className="rounded border-border"
                      />
                      <span>{jobType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingCert ? 'Update' : 'Add'} Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length > 0 && (
        <Card className="p-4 bg-orange-500/5 border-orange-500/20">
          <div className="flex items-start gap-3">
            <Warning className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Expiration Alerts</h3>
              <div className="space-y-2 mt-2">
                {alerts.map(alert => {
                  const cert = (certifications || []).find(c => c.id === alert.certificationId)
                  if (!cert) return null
                  return (
                    <div key={alert.certificationId} className="text-sm">
                      <span className="font-medium">{cert.name}</span>
                      <span className="text-black dark:text-white">
                        {alert.daysUntilExpiration < 0 
                          ? ` expired ${Math.abs(alert.daysUntilExpiration)} days ago` 
                          : ` expires in ${alert.daysUntilExpiration} days`
                        }
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={`p-4 cursor-pointer transition-colors ${filter === 'all' ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
          onClick={() => setFilter('all')}
        >
          <div className="text-2xl font-bold text-black dark:text-white">{stats.total}</div>
          <div className="text-sm text-black dark:text-white">Total</div>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${filter === 'active' ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
          onClick={() => setFilter('active')}
        >
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-black dark:text-white">Active</div>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${filter === 'expiring-soon' ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
          onClick={() => setFilter('expiring-soon')}
        >
          <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
          <div className="text-sm text-black dark:text-white">Expiring Soon</div>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${filter === 'expired' ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
          onClick={() => setFilter('expired')}
        >
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-sm text-black dark:text-white">Expired</div>
        </Card>
      </div>

      {filteredCerts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <FileText className="w-8 h-8 text-black dark:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">
                {filter === 'all' ? 'No Certifications Yet' : `No ${filter.replace('-', ' ')} certifications`}
              </h3>
              <p className="text-sm text-black dark:text-white max-w-md">
                {filter === 'all' 
                  ? 'Add your licenses, insurance certificates, and other credentials to build trust with homeowners.'
                  : 'Adjust the filter to view other certifications.'
                }
              </p>
            </div>
            {filter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Certification
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCerts.map(cert => (
            <CertificationCard 
              key={cert.id}
              cert={cert}
              onEdit={() => handleEdit(cert)}
              onDelete={() => handleDelete(cert)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
