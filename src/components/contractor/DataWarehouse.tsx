import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, Download, RefreshCw, TrendingUp,
  HardDrive, Clock, FileArrowDown
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, DataWarehouse } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface DataWarehouseProps {
  user: User
}

export function DataWarehouse({ user }: DataWarehouseProps) {
  const [warehouses, setWarehouses] = useKV<DataWarehouse[]>("crm-data-warehouses", [])
  const [isSyncing, setIsSyncing] = useState<string | null>(null)

  // Initialize default warehouse if none exists
  useMemo(() => {
    if (warehouses.length === 0) {
      const defaultWarehouse: DataWarehouse = {
        id: `warehouse-${Date.now()}`,
        contractorId: user.id,
        name: 'Main Data Warehouse',
        tables: [
          { name: 'customers', schema: { id: 'string', name: 'string', email: 'string' }, rowCount: 0, lastUpdated: new Date().toISOString() },
          { name: 'interactions', schema: { id: 'string', customerId: 'string', type: 'string' }, rowCount: 0, lastUpdated: new Date().toISOString() },
          { name: 'invoices', schema: { id: 'string', customerId: 'string', amount: 'number' }, rowCount: 0, lastUpdated: new Date().toISOString() }
        ],
        lastSync: new Date().toISOString(),
        size: 0,
        createdAt: new Date().toISOString()
      }
      setWarehouses([defaultWarehouse])
    }
  }, [warehouses.length, user.id, setWarehouses])

  const handleSync = async (warehouseId: string) => {
    setIsSyncing(warehouseId)
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))

    setWarehouses((current) =>
      (current || []).map(w => {
        if (w.id === warehouseId) {
          return {
            ...w,
            lastSync: new Date().toISOString(),
            tables: w.tables.map(t => ({
              ...t,
              rowCount: Math.floor(Math.random() * 10000) + 1000,
              lastUpdated: new Date().toISOString()
            })),
            size: Math.floor(Math.random() * 1000000) + 100000
          }
        }
        return w
      })
    )

    setIsSyncing(null)
    toast.success("Data warehouse synced successfully")
  }

  const handleExport = (warehouseId: string) => {
    toast.success("Export started. You'll receive a notification when it's ready.")
  }

  const totalSize = warehouses.reduce((sum, w) => sum + w.size, 0)
  const totalRows = warehouses.reduce((sum, w) => 
    sum + w.tables.reduce((tableSum, t) => tableSum + t.rowCount, 0), 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Database weight="duotone" size={28} className="text-black dark:text-white" />
            Data Warehouse & Management
          </h2>
          <p className="text-muted-foreground mt-1">
            High-volume data storage, warehousing, and analytics capabilities
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive weight="duotone" size={24} className="text-black dark:text-white" />
              <span className="text-xs text-muted-foreground">Total Size</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">
              {(totalSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Database weight="duotone" size={24} className="text-black dark:text-white" />
              <span className="text-xs text-muted-foreground">Total Rows</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">
              {totalRows.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp weight="duotone" size={24} className="text-black dark:text-white" />
              <span className="text-xs text-muted-foreground">Warehouses</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">
              {warehouses.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock weight="duotone" size={24} className="text-black dark:text-white" />
              <span className="text-xs text-muted-foreground">Last Sync</span>
            </div>
            <div className="text-sm font-semibold text-black dark:text-white">
              {warehouses.length > 0 && warehouses[0].lastSync
                ? new Date(warehouses[0].lastSync).toLocaleDateString()
                : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses */}
      {warehouses.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
          <Database size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
          <p className="text-muted-foreground">No data warehouses configured</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {warehouses.map(warehouse => (
            <Card key={warehouse.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database weight="duotone" size={24} className="text-black dark:text-white" />
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <CardDescription>
                        {(warehouse.size / 1024 / 1024).toFixed(2)} MB • {warehouse.tables.length} tables
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(warehouse.id)}
                      disabled={isSyncing === warehouse.id}
                    >
                      <RefreshCw 
                        size={16} 
                        className={`mr-2 ${isSyncing === warehouse.id ? 'animate-spin' : ''}`} 
                      />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(warehouse.id)}
                    >
                      <FileArrowDown size={16} className="mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="text-black dark:text-white">
                        {new Date(warehouse.lastSync).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Storage Used</span>
                      <span className="text-black dark:text-white">
                        {(warehouse.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-sm font-semibold text-black dark:text-white mb-3">
                      Tables ({warehouse.tables.length})
                    </div>
                    <div className="space-y-2">
                      {warehouse.tables.map((table, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded">
                          <div>
                            <div className="font-medium text-sm text-black dark:text-white">
                              {table.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Object.keys(table.schema).length} columns
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-black dark:text-white">
                              {table.rowCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">rows</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
