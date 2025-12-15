import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plug, CheckCircle, XCircle, ArrowClockwise, 
  ShoppingCart, ChartBar, CreditCard, Database,
  Settings, Plus, Link
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMIntegration, IntegrationSync } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface IntegrationHubProps {
  user: User
}

export function IntegrationHub({ user }: IntegrationHubProps) {
  const [integrations, setIntegrations] = useKV<CRMIntegration[]>("crm-integrations", [])
  const [syncs, setSyncs] = useKV<IntegrationSync[]>("crm-integration-syncs", [])
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<CRMIntegration['type']>('accounting')

  const availableIntegrations = [
    { type: 'accounting' as const, name: 'Accounting Software', icon: CreditCard, providers: ['QuickBooks', 'Xero', 'Sage', 'FreshBooks'], priority: true },
    { type: 'pm' as const, name: 'Project Management', icon: Database, providers: ['Procore', 'Buildertrend', 'CoConstruct', 'JobNimbus'], priority: true },
    { type: 'finance' as const, name: 'Finance & Accounting', icon: CreditCard, providers: ['QuickBooks', 'Xero', 'Sage', 'FreshBooks'] },
    { type: 'erp' as const, name: 'ERP Systems', icon: Database, providers: ['SAP', 'Oracle', 'Microsoft Dynamics', 'NetSuite'] },
    { type: 'ecommerce' as const, name: 'E-Commerce', icon: ShoppingCart, providers: ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento'] },
    { type: 'marketing' as const, name: 'Marketing Automation', icon: ChartBar, providers: ['HubSpot', 'Mailchimp', 'Marketo', 'Pardot'] },
    { type: 'crm' as const, name: 'Other CRMs', icon: Plug, providers: ['Salesforce', 'HubSpot CRM', 'Zoho', 'Pipedrive'] }
  ]

  const handleConnect = async (type: CRMIntegration['type'], provider: string) => {
    setIsConnecting(true)
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newIntegration: CRMIntegration = {
      id: `int-${Date.now()}`,
      contractorId: user.id,
      type,
      name: provider,
      provider,
      status: 'connected',
      config: {
        apiKey: '***',
        syncInterval: 'hourly'
      },
      lastSync: new Date().toISOString(),
      syncDirection: 'two-way',
      createdAt: new Date().toISOString()
    }

    setIntegrations((current) => [...(current || []), newIntegration])
    setIsConnecting(false)
    setShowConnectDialog(false)
    toast.success(`${provider} connected successfully!`)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations((current) => (current || []).filter(i => i.id !== integrationId))
    toast.success("Integration disconnected")
  }

  const handleSync = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newSync: IntegrationSync = {
      id: `sync-${Date.now()}`,
      integrationId,
      direction: 'two-way',
      entityType: 'customer',
      entityId: `entity-${Date.now()}`,
      status: 'success',
      syncedAt: new Date().toISOString()
    }

    setSyncs((current) => [...(current || []), newSync])
    
    setIntegrations((current) =>
      (current || []).map(i =>
        i.id === integrationId
          ? { ...i, lastSync: new Date().toISOString() }
          : i
      )
    )

    toast.success("Sync completed successfully")
  }

  const getStatusIcon = (status: CRMIntegration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle weight="fill" size={20} className="text-green-500" />
      case 'error':
        return <XCircle weight="fill" size={20} className="text-red-500" />
      default:
        return <XCircle weight="fill" size={20} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Plug weight="duotone" size={28} className="text-black dark:text-white" />
            Integration Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            Connect QuickBooks, Procore, and other construction-specific tools
          </p>
        </div>
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Connect Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Integration</DialogTitle>
              <DialogDescription>
                Choose an integration type and provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Integration Type</Label>
                <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIntegrations.map(int => (
                      <SelectItem key={int.type} value={int.type}>
                        {int.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableIntegrations
                    .find(i => i.type === selectedType)
                    ?.providers.map(provider => (
                      <Button
                        key={provider}
                        variant="outline"
                        onClick={() => handleConnect(selectedType, provider)}
                        disabled={isConnecting}
                        className="justify-start"
                      >
                        <Link size={16} className="mr-2" />
                        {provider}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-black dark:text-white">Connected Integrations</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map(integration => {
              const integrationInfo = availableIntegrations.find(i => i.type === integration.type)
              const Icon = integrationInfo?.icon || Plug
              const recentSyncs = (syncs || []).filter(s => s.integrationId === integration.id).slice(0, 5)

              return (
                <Card key={integration.id} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon weight="duotone" size={24} className="text-black dark:text-white" />
                        <div>
                          <CardTitle className="text-lg">{integration.provider}</CardTitle>
                          <CardDescription>{integrationInfo?.name}</CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sync Direction</span>
                        <Badge variant="outline">{integration.syncDirection}</Badge>
                      </div>
                      
                      {integration.lastSync && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Sync</span>
                          <span className="text-black dark:text-white">
                            {new Date(integration.lastSync).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(integration.id)}
                          className="flex-1"
                        >
                          <ArrowClockwise size={16} className="mr-2" />
                          Sync Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* Open settings */}}
                        >
                          <Settings size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </div>

                      {recentSyncs.length > 0 && (
                        <div className="pt-2 border-t border-black/10 dark:border-white/10">
                          <div className="text-xs text-muted-foreground mb-2">Recent Syncs</div>
                          <div className="space-y-1">
                            {recentSyncs.map(sync => (
                              <div key={sync.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {sync.entityType} • {sync.direction}
                                </span>
                                <Badge 
                                  variant={sync.status === 'success' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {sync.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Construction-Specific Integrations */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-black dark:text-white">Construction-Specific Integrations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {availableIntegrations
            .filter(int => int.priority)
            .map(integration => {
              const Icon = integration.icon
              const isConnected = integrations.some(i => i.type === integration.type)

              return (
                <Card 
                  key={integration.type}
                  className={`bg-white dark:bg-black border-2 ${isConnected ? 'border-green-500' : 'border-black/20 dark:border-white/20'} ${
                    isConnected ? 'opacity-60' : 'cursor-pointer hover:shadow-md transition-all'
                  }`}
                  onClick={() => !isConnected && setShowConnectDialog(true)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon weight="duotone" size={32} className="text-black dark:text-white" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-white">{integration.name}</h3>
                        {isConnected && (
                          <Badge variant="default" className="mt-1 text-xs">Connected</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {integration.providers.map(provider => (
                        <div key={provider} className="text-sm text-muted-foreground">
                          • {provider}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Available Integrations */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-black dark:text-white">All Available Integrations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {availableIntegrations.filter(int => !int.priority).map(integration => {
            const Icon = integration.icon
            const isConnected = integrations.some(i => i.type === integration.type)

            return (
              <Card 
                key={integration.type}
                className={`bg-white dark:bg-black border border-black/20 dark:border-white/20 ${
                  isConnected ? 'opacity-60' : 'cursor-pointer hover:shadow-md transition-all'
                }`}
                onClick={() => !isConnected && setShowConnectDialog(true)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon weight="duotone" size={32} className="text-black dark:text-white" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">{integration.name}</h3>
                      {isConnected && (
                        <Badge variant="default" className="mt-1 text-xs">Connected</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {integration.providers.slice(0, 3).map(provider => (
                      <div key={provider} className="text-sm text-muted-foreground">
                        • {provider}
                      </div>
                    ))}
                    {integration.providers.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{integration.providers.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
