import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  DeviceMobile, WifiSlash, WifiHigh, Download,
  CloudArrowUp, CloudArrowDown, CheckCircle, Clock
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, MobileSync, PendingChange } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface MobileCRMProps {
  user: User
}

export function MobileCRM({ user }: MobileCRMProps) {
  const [mobileSync, setMobileSync] = useKV<MobileSync>("crm-mobile-sync", {
    id: `sync-${user.id}`,
    deviceId: 'device-1',
    contractorId: user.id,
    lastSync: new Date().toISOString(),
    pendingChanges: [],
    offlineMode: false
  })
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))

    setMobileSync((current) => ({
      ...current!,
      lastSync: new Date().toISOString(),
      pendingChanges: []
    }))

    setIsSyncing(false)
    toast.success("Sync completed successfully")
  }

  const handleToggleOffline = (enabled: boolean) => {
    setMobileSync((current) => ({
      ...current!,
      offlineMode: enabled
    }))
    toast.success(`Offline mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  const syncStatus = useMemo(() => {
    const lastSync = mobileSync?.lastSync ? new Date(mobileSync.lastSync) : null
    const now = new Date()
    const hoursSinceSync = lastSync 
      ? Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60))
      : 999

    if (hoursSinceSync < 1) return { status: 'synced', label: 'Synced', color: 'green' }
    if (hoursSinceSync < 24) return { status: 'recent', label: 'Recent', color: 'yellow' }
    return { status: 'stale', label: 'Stale', color: 'red' }
  }, [mobileSync?.lastSync])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <DeviceMobile weight="duotone" size={28} className="text-black dark:text-white" />
          Mobile CRM with Offline Access
        </h2>
        <p className="text-muted-foreground mt-1">
          Fully-featured mobile CRM with robust offline capabilities and sync
        </p>
      </div>

      {/* Sync Status */}
      <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sync Status</CardTitle>
            <Badge 
              variant={
                syncStatus.status === 'synced' ? 'default' :
                syncStatus.status === 'recent' ? 'outline' :
                'destructive'
              }
            >
              {syncStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Offline Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable offline access to CRM data
                </p>
              </div>
              <Switch
                checked={mobileSync?.offlineMode || false}
                onCheckedChange={handleToggleOffline}
              />
            </div>

            {mobileSync?.offlineMode && (
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <WifiSlash size={20} className="text-orange-500" />
                  <span className="text-sm font-semibold text-black dark:text-white">
                    Offline Mode Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Changes will be synced when connection is restored
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-black dark:text-white">
                  {mobileSync?.lastSync
                    ? new Date(mobileSync.lastSync).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Changes</span>
                <Badge variant="outline">
                  {mobileSync?.pendingChanges?.length || 0}
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full"
            >
              {isSyncing ? (
                <>
                  <Clock size={16} className="mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <CloudArrowDown size={16} className="mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes */}
      {mobileSync?.pendingChanges && mobileSync.pendingChanges.length > 0 && (
        <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-lg">Pending Changes</CardTitle>
            <CardDescription>
              Changes made offline waiting to sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mobileSync.pendingChanges.map((change, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    {change.action === 'create' && <CloudArrowUp size={20} className="text-green-500" />}
                    {change.action === 'update' && <CloudArrowDown size={20} className="text-blue-500" />}
                    {change.action === 'delete' && <WifiSlash size={20} className="text-red-500" />}
                    <div>
                      <div className="text-sm font-medium text-black dark:text-white capitalize">
                        {change.action} {change.entityType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(change.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {change.action}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DeviceMobile weight="duotone" size={24} className="text-black dark:text-white" />
              Mobile Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Full customer management',
                'View and edit interactions',
                'Create and send invoices',
                'Access analytics dashboard',
                'Territory management',
                'Offline data access',
                'Push notifications',
                'Quick actions & shortcuts'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" weight="fill" />
                  <span className="text-black dark:text-white">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <WifiSlash weight="duotone" size={24} className="text-black dark:text-white" />
              Offline Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'View all customer data',
                'Create new records',
                'Edit existing records',
                'Delete records',
                'Queue changes for sync',
                'Automatic sync on reconnect',
                'Conflict resolution',
                'Data integrity checks'
              ].map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500" weight="fill" />
                  <span className="text-black dark:text-white">{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Instructions */}
      <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Get Mobile App</CardTitle>
          <CardDescription>
            Download the mobile app for iOS and Android
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Download size={16} className="mr-2" />
              Download for iOS
            </Button>
            <Button variant="outline" className="flex-1">
              <Download size={16} className="mr-2" />
              Download for Android
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
