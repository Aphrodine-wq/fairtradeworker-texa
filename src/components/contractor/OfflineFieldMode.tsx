import { useState, useCallback, useEffect, useRef } from 'react'
import { WifiSlash, WifiHigh, CloudArrowUp, Clock, Camera, Microphone, CheckCircle, Warning, Files, Database, ArrowsClockwise, Eye, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface PendingItem {
  id: string
  type: 'photo' | 'voice_note' | 'checklist' | 'message' | 'job_update'
  jobId: string
  jobTitle: string
  data: any
  thumbnail?: string
  size: number
  createdAt: Date
  retries: number
  status: 'pending' | 'syncing' | 'failed'
  error?: string
}

interface CachedJob {
  id: string
  title: string
  address: string
  description: string
  photos: string[]
  notes: string[]
  checklist: { item: string; completed: boolean }[]
  materials: { name: string; quantity: number }[]
  lastSynced: Date
}

interface OfflineFieldModeProps {
  currentJobId?: string
  contractorId: string
}

// Simulated IndexedDB operations (in production, use actual IndexedDB)
const db = {
  pendingItems: [] as PendingItem[],
  cachedJobs: [] as CachedJob[],
  
  async savePending(item: PendingItem) {
    this.pendingItems.push(item)
    localStorage.setItem('ftw_pending_sync', JSON.stringify(this.pendingItems))
    return item
  },
  
  async getPending(): Promise<PendingItem[]> {
    const stored = localStorage.getItem('ftw_pending_sync')
    if (stored) {
      this.pendingItems = JSON.parse(stored)
    }
    return this.pendingItems
  },
  
  async removePending(id: string) {
    this.pendingItems = this.pendingItems.filter(i => i.id !== id)
    localStorage.setItem('ftw_pending_sync', JSON.stringify(this.pendingItems))
  },
  
  async updatePending(id: string, updates: Partial<PendingItem>) {
    this.pendingItems = this.pendingItems.map(i => i.id === id ? { ...i, ...updates } : i)
    localStorage.setItem('ftw_pending_sync', JSON.stringify(this.pendingItems))
  },
  
  async cacheJob(job: CachedJob) {
    const existing = this.cachedJobs.findIndex(j => j.id === job.id)
    if (existing >= 0) {
      this.cachedJobs[existing] = job
    } else {
      this.cachedJobs.push(job)
    }
    localStorage.setItem('ftw_cached_jobs', JSON.stringify(this.cachedJobs))
    return job
  },
  
  async getCachedJobs(): Promise<CachedJob[]> {
    const stored = localStorage.getItem('ftw_cached_jobs')
    if (stored) {
      this.cachedJobs = JSON.parse(stored)
    }
    return this.cachedJobs
  },
  
  async getCachedJob(id: string): Promise<CachedJob | null> {
    const jobs = await this.getCachedJobs()
    return jobs.find(j => j.id === id) || null
  }
}

export function OfflineFieldMode({ currentJobId, contractorId }: OfflineFieldModeProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [cachedJobs, setCachedJobs] = useState<CachedJob[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [currentJob, setCurrentJob] = useState<CachedJob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online! Syncing pending items...')
      syncPendingItems()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You\'re offline. Changes will sync when connected.')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
  }, [currentJobId])

  const loadCachedData = async () => {
    const pending = await db.getPending()
    setPendingItems(pending)
    
    const jobs = await db.getCachedJobs()
    setCachedJobs(jobs)
    
    if (currentJobId) {
      const job = await db.getCachedJob(currentJobId)
      setCurrentJob(job)
    }
  }

  // Sync pending items when online
  const syncPendingItems = async () => {
    if (!isOnline || syncing || pendingItems.length === 0) return
    
    setSyncing(true)
    setSyncProgress(0)
    
    const toSync = pendingItems.filter(i => i.status !== 'syncing')
    let completed = 0
    
    for (const item of toSync) {
      try {
        await db.updatePending(item.id, { status: 'syncing' })
        
        // Simulate API call (in production, actually upload to server)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
        
        // Success - remove from pending
        await db.removePending(item.id)
        completed++
        setSyncProgress((completed / toSync.length) * 100)
        
      } catch (error) {
        // Failed - increment retry count
        await db.updatePending(item.id, { 
          status: 'failed', 
          retries: item.retries + 1,
          error: (error as Error).message
        })
      }
    }
    
    // Reload pending items
    const updated = await db.getPending()
    setPendingItems(updated)
    
    setSyncing(false)
    setSyncProgress(0)
    
    if (completed > 0) {
      toast.success(`Synced ${completed} item${completed > 1 ? 's' : ''}`)
    }
  }

  // Capture photo offline
  const capturePhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      
      // Compress image for storage
      const compressedUrl = await compressImage(dataUrl, 0.7)
      
      const pendingItem: PendingItem = {
        id: `photo-${Date.now()}`,
        type: 'photo',
        jobId: currentJobId || 'unassigned',
        jobTitle: currentJob?.title || 'Unassigned',
        data: { imageData: compressedUrl },
        thumbnail: compressedUrl,
        size: compressedUrl.length,
        createdAt: new Date(),
        retries: 0,
        status: 'pending'
      }
      
      await db.savePending(pendingItem)
      setPendingItems(prev => [...prev, pendingItem])
      
      toast.success('Photo saved offline')
      
      // Try to sync if online
      if (isOnline) {
        syncPendingItems()
      }
    }
    reader.readAsDataURL(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [currentJobId, currentJob, isOnline])

  // Record voice note offline
  const startVoiceNote = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string
          
          const pendingItem: PendingItem = {
            id: `voice-${Date.now()}`,
            type: 'voice_note',
            jobId: currentJobId || 'unassigned',
            jobTitle: currentJob?.title || 'Unassigned',
            data: { audioData: dataUrl },
            size: dataUrl.length,
            createdAt: new Date(),
            retries: 0,
            status: 'pending'
          }
          
          await db.savePending(pendingItem)
          setPendingItems(prev => [...prev, pendingItem])
          
          toast.success('Voice note saved offline')
          
          if (isOnline) {
            syncPendingItems()
          }
        }
        reader.readAsDataURL(blob)
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
      // Auto-stop after 2 minutes
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopVoiceNote()
        }
      }, 120000)
      
    } catch (error) {
      toast.error('Could not access microphone')
    }
  }, [currentJobId, currentJob, isOnline])

  const stopVoiceNote = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  // Save checklist update offline
  const updateChecklist = useCallback(async (item: string, completed: boolean) => {
    if (!currentJob) return
    
    const pendingItem: PendingItem = {
      id: `checklist-${Date.now()}`,
      type: 'checklist',
      jobId: currentJobId || 'unassigned',
      jobTitle: currentJob.title,
      data: { item, completed },
      size: 100,
      createdAt: new Date(),
      retries: 0,
      status: 'pending'
    }
    
    await db.savePending(pendingItem)
    setPendingItems(prev => [...prev, pendingItem])
    
    // Update local cache
    const updatedJob = {
      ...currentJob,
      checklist: currentJob.checklist.map(c => 
        c.item === item ? { ...c, completed } : c
      )
    }
    await db.cacheJob(updatedJob)
    setCurrentJob(updatedJob)
    
    if (isOnline) {
      syncPendingItems()
    }
  }, [currentJob, currentJobId, isOnline])

  // Delete pending item
  const deletePendingItem = useCallback(async (id: string) => {
    await db.removePending(id)
    setPendingItems(prev => prev.filter(i => i.id !== id))
    toast.success('Item deleted')
  }, [])

  // Calculate total pending size
  const totalPendingSize = pendingItems.reduce((acc, item) => acc + item.size, 0)
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <WifiHigh className="h-5 w-5 text-green-500" />
              ) : (
                <WifiSlash className="h-5 w-5 text-red-500" />
              )}
              Field Mode
            </CardTitle>
            <CardDescription>
              {isOnline ? 'Online - changes sync automatically' : 'Offline - changes saved locally'}
            </CardDescription>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sync Status */}
        {pendingItems.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudArrowUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium">{pendingItems.length} items pending sync</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatSize(totalPendingSize)}</span>
            </div>
            
            {syncing && (
              <Progress value={syncProgress} className="h-2" />
            )}
            
            {isOnline && !syncing && (
              <Button size="sm" onClick={syncPendingItems}>
                <ArrowsClockwise className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6" />
            <span>Take Photo</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={capturePhoto}
          />
          
          <Button 
            variant={isRecording ? 'destructive' : 'outline'}
            className="h-20 flex-col gap-2"
            onClick={isRecording ? stopVoiceNote : startVoiceNote}
          >
            <Microphone className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
            <span>{isRecording ? 'Stop Recording' : 'Voice Note'}</span>
          </Button>
        </div>
        
        {/* Current Job Info */}
        {currentJob && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{currentJob.title}</h4>
                <Badge variant="outline" className="text-xs">
                  Cached
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentJob.address}</p>
              
              {/* Offline Checklist */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Checklist</h5>
                {currentJob.checklist.map((item, i) => (
                  <label 
                    key={i}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => updateChecklist(item.item, e.target.checked)}
                      className="rounded"
                    />
                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                      {item.item}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Cached Materials */}
              {currentJob.materials.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Materials</h5>
                  <div className="text-sm text-muted-foreground">
                    {currentJob.materials.map((m, i) => (
                      <div key={i}>{m.quantity}x {m.name}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                Last synced: {new Date(currentJob.lastSynced).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Pending Items List */}
        {pendingItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Files className="h-4 w-4" />
              Pending Items
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {item.thumbnail && (
                      <img 
                        src={item.thumbnail} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    {item.type === 'voice_note' && (
                      <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                        <Microphone className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {item.type === 'checklist' && (
                      <div className="w-12 h-12 bg-green-500/10 rounded flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{item.type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(item.size)} • {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.status === 'syncing' && (
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                      {item.status === 'failed' && (
                        <Warning className="h-4 w-4 text-red-500" />
                      )}
                      {item.status === 'pending' && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deletePendingItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Cached Jobs */}
        {cachedJobs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cached Jobs ({cachedJobs.length})
            </h4>
            <div className="text-sm text-muted-foreground">
              {cachedJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between py-1">
                  <span>{job.title}</span>
                  <Button size="sm" variant="ghost" onClick={() => setCurrentJob(job)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Storage Info */}
        <div className="text-xs text-muted-foreground text-center">
          <Database className="h-3 w-3 inline mr-1" />
          Local storage: {formatSize(totalPendingSize)} used
        </div>
      </CardContent>
    </Card>
  )
}

// Helper: Compress image
async function compressImage(dataUrl: string, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 1024
      let width = img.width
      let height = img.height
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

export default OfflineFieldMode
