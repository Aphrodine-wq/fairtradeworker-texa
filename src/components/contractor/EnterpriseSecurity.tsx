import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, Lock, CheckCircle, XCircle, 
  FileX, Database, TestTube, AlertTriangle
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, EncryptionConfig, ComplianceAudit, Sandbox } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface EnterpriseSecurityProps {
  user: User
}

export function EnterpriseSecurity({ user }: EnterpriseSecurityProps) {
  const [encryptionConfig, setEncryptionConfig] = useKV<EncryptionConfig>("crm-encryption-config", {
    enabled: true,
    algorithm: 'AES-256',
    keyRotation: 90,
    lastRotation: new Date().toISOString()
  })
  const [audits, setAudits] = useKV<ComplianceAudit[]>("crm-compliance-audits", [])
  const [sandboxes, setSandboxes] = useKV<Sandbox[]>("crm-sandboxes", [])

  const handleCreateSandbox = () => {
    const newSandbox: Sandbox = {
      id: `sandbox-${Date.now()}`,
      contractorId: user.id,
      name: `Test Environment ${sandboxes.length + 1}`,
      environment: 'testing',
      data: {},
      lastReset: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    setSandboxes((current) => [...(current || []), newSandbox])
    toast.success("Sandbox created successfully")
  }

  const handleRunAudit = (type: ComplianceAudit['type']) => {
    // Simulate audit
    const findings: ComplianceAudit['findings'] = [
      {
        id: `finding-1`,
        severity: 'low',
        description: 'Data retention policy needs review',
        recommendation: 'Update retention policy to match compliance requirements',
        resolved: false
      }
    ]

    const newAudit: ComplianceAudit = {
      id: `audit-${Date.now()}`,
      contractorId: user.id,
      type,
      status: findings.some(f => f.severity === 'critical' || f.severity === 'high') ? 'non-compliant' : 'compliant',
      findings,
      lastAudit: new Date().toISOString(),
      nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }

    setAudits((current) => [...(current || []), newAudit])
    toast.success(`${type.toUpperCase()} audit completed`)
  }

  const getComplianceStatus = (type: ComplianceAudit['type']) => {
    const audit = audits.find(a => a.type === type)
    if (!audit) return { status: 'pending', color: 'gray' }
    
    switch (audit.status) {
      case 'compliant':
        return { status: 'Compliant', color: 'green' }
      case 'non-compliant':
        return { status: 'Non-Compliant', color: 'red' }
      default:
        return { status: 'Pending', color: 'yellow' }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <Shield weight="duotone" size={28} className="text-black dark:text-white" />
          Enterprise Security & Compliance
        </h2>
        <p className="text-muted-foreground mt-1">
          Advanced security features, data encryption, compliance tools, and sandbox environments
        </p>
      </div>

      <Tabs defaultValue="encryption" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="encryption" className="space-y-6 mt-6">
          <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Data Encryption</CardTitle>
              <CardDescription>
                Protect sensitive customer data with enterprise-grade encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    All customer data is encrypted at rest and in transit
                  </p>
                </div>
                <Switch
                  checked={encryptionConfig.enabled}
                  onCheckedChange={(checked) =>
                    setEncryptionConfig((current) => ({ ...current, enabled: checked }))
                  }
                />
              </div>

              {encryptionConfig.enabled && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <Label>Encryption Algorithm</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-sm">
                        {encryptionConfig.algorithm}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Key Rotation Interval (days)</Label>
                    <Input
                      type="number"
                      value={encryptionConfig.keyRotation}
                      onChange={(e) =>
                        setEncryptionConfig((current) => ({
                          ...current,
                          keyRotation: parseInt(e.target.value) || 90
                        }))
                      }
                      className="mt-2 max-w-32"
                    />
                  </div>

                  <div>
                    <Label>Last Key Rotation</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(encryptionConfig.lastRotation).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle weight="fill" size={20} className="text-green-500" />
                    <span className="text-sm text-black dark:text-white">
                      Encryption active and protecting all data
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <Lock weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Data at Rest</h3>
                <p className="text-sm text-muted-foreground">
                  All stored data is encrypted using {encryptionConfig.algorithm}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <Shield weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Data in Transit</h3>
                <p className="text-sm text-muted-foreground">
                  TLS 1.3 encryption for all data transfers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <FileX weight="duotone" size={32} className="text-black dark:text-white mb-3" />
                <h3 className="font-semibold text-black dark:text-white mb-2">Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Role-based access with audit logging
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {(['gdpr', 'ccpa', 'hipaa', 'pci'] as const).map(type => {
              const status = getComplianceStatus(type)
              const audit = audits.find(a => a.type === type)

              return (
                <Card key={type} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg uppercase">{type}</CardTitle>
                      <Badge
                        variant={status.color === 'green' ? 'default' : status.color === 'red' ? 'destructive' : 'outline'}
                      >
                        {status.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {audit ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Last Audit</span>
                            <span className="text-black dark:text-white">
                              {new Date(audit.lastAudit).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Next Audit</span>
                            <span className="text-black dark:text-white">
                              {new Date(audit.nextAudit).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Findings</span>
                            <span className="text-black dark:text-white">
                              {audit.findings.length} ({audit.findings.filter(f => !f.resolved).length} unresolved)
                            </span>
                          </div>
                        </div>

                        {audit.findings.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                            {audit.findings.slice(0, 2).map(finding => (
                              <div key={finding.id} className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle 
                                    size={16} 
                                    className={
                                      finding.severity === 'critical' ? 'text-red-500' :
                                      finding.severity === 'high' ? 'text-orange-500' :
                                      'text-yellow-500'
                                    }
                                  />
                                  <span className="font-medium text-black dark:text-white capitalize">
                                    {finding.severity}
                                  </span>
                                  {finding.resolved && (
                                    <CheckCircle size={16} className="text-green-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                  {finding.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunAudit(type)}
                          className="w-full"
                        >
                          Run New Audit
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          No audit performed yet
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleRunAudit(type)}
                        >
                          Run Initial Audit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="sandbox" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-black dark:text-white">Sandbox Environments</h3>
              <p className="text-sm text-muted-foreground">
                Test changes safely without affecting production data
              </p>
            </div>
            <Button onClick={handleCreateSandbox}>
              <TestTube size={16} className="mr-2" />
              Create Sandbox
            </Button>
          </div>

          {sandboxes.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
              <TestTube size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground mb-4">No sandbox environments created yet</p>
              <Button onClick={handleCreateSandbox}>Create Your First Sandbox</Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sandboxes.map(sandbox => (
                <Card key={sandbox.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sandbox.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {sandbox.environment}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-black dark:text-white">
                          {new Date(sandbox.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Reset</span>
                        <span className="text-black dark:text-white">
                          {new Date(sandbox.lastReset).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Objects</span>
                        <span className="text-black dark:text-white">
                          {Object.keys(sandbox.data).length}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <Button size="sm" variant="outline" className="flex-1">
                          Open Sandbox
                        </Button>
                        <Button size="sm" variant="outline">
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
