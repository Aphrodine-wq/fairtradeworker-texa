/**
 * AI Change Order & Upsell Generator
 * Flagship Pro Feature - Generates change orders from mid-job discoveries
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle,
  XCircle,
  Download,
  Image as ImageIcon
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job, ScopeChange } from "@/lib/types"
import { toast } from "sonner"

interface ChangeOrderBuilderProps {
  user: User
  job?: Job
}

export function ChangeOrderBuilder({ user, job }: ChangeOrderBuilderProps) {
  const isPro = user.isPro || false
  const [changeOrders, setChangeOrders] = useLocalKV<ScopeChange[]>("change-orders", [])
  const [description, setDescription] = useState("")
  const [additionalCost, setAdditionalCost] = useState<number>(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(job)
  const [reason, setReason] = useState("")

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // In production, upload to storage and get URL
      // For now, create data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setPhotos([...photos, dataUrl])
        toast.success("Photo uploaded")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const analyzePhoto = async () => {
    if (photos.length === 0) {
      toast.error("Upload a photo first")
      return
    }

    setUploading(true)
    try {
      // AI analysis with GPT-4 Vision
      toast.info("Analyzing photo with AI...")
      
      // Mock analysis (replace with actual GPT-4 Vision call)
      const mockAnalysis = {
        issue: "Water damage discovered behind drywall",
        recommendedFix: "Remove affected drywall, treat mold, replace insulation, install new drywall",
        estimatedMaterials: 450,
        estimatedLabor: 800
      }

      setDescription(`Issue: ${mockAnalysis.issue}\n\nRecommended Fix: ${mockAnalysis.recommendedFix}\n\nEstimated Materials: $${mockAnalysis.estimatedMaterials}\nEstimated Labor: $${mockAnalysis.estimatedLabor}`)
      setAdditionalCost(mockAnalysis.estimatedMaterials + mockAnalysis.estimatedLabor)
      
      toast.success("AI analysis complete!")
    } catch (error) {
      toast.error("Analysis failed")
    } finally {
      setUploading(false)
    }
  }

  const createChangeOrder = () => {
    if (!job) {
      toast.error("Select a job first")
      return
    }

    if (!description.trim()) {
      toast.error("Enter a description")
      return
    }

    if (additionalCost <= 0) {
      toast.error("Enter additional cost")
      return
    }

    const newChangeOrder: ScopeChange = {
      id: `change-${Date.now()}`,
      jobId: job.id,
      discoveredAt: new Date().toISOString(),
      description,
      photos,
      additionalCost,
      status: 'pending'
    }

    setChangeOrders([...changeOrders, newChangeOrder])
    toast.success("Change order created!")
    
    // Reset form
    setDescription("")
    setAdditionalCost(0)
    setPhotos([])
  }

  const generatePDF = async () => {
    if (!job && !selectedJob) {
      toast.error("Select a job first")
      return
    }
    
    const currentJob = job || selectedJob
    if (!description.trim()) {
      toast.error("Enter a description first")
      return
    }

    try {
      const { generatePDF } = await import('@/lib/pdf')
      
      const content = [
        {
          type: 'text' as const,
          data: {
            text: `CHANGE ORDER\n\nJob: ${currentJob?.title || 'N/A'}\nDate: ${new Date().toLocaleDateString()}\n\nDescription:\n${description}\n\nAdditional Cost: $${additionalCost.toFixed(2)}\n\n${reason ? `Reason: ${reason}\n\n` : ''}This change order modifies the original contract and requires customer approval.`,
            fontSize: 12
          }
        }
      ]

      await generatePDF(content, `change-order-${Date.now()}.pdf`, {
        title: `Change Order - ${currentJob?.title || 'Job'}`,
        author: user.fullName
      })
      toast.success("Change order PDF generated!")
    } catch (error: any) {
      console.error('PDF generation failed:', error)
      if (error.message?.includes('jsPDF')) {
        toast.error("PDF generation requires jsPDF. Install with: npm install jspdf")
      } else {
        toast.error("PDF generation failed")
      }
    }
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText weight="duotone" size={24} />
            Change Order Generator
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to unlock AI-powered change order generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  const jobChangeOrders = job ? changeOrders.filter(co => co.jobId === job.id) : []

  return (
    <div className="space-y-6">
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText weight="duotone" size={24} />
            Create Change Order
          </CardTitle>
          <CardDescription>
            Document mid-job discoveries and generate professional change orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!job ? (
            <div className="text-center py-8">
              <p className="text-black dark:text-white mb-4">Select a job to create a change order</p>
            </div>
          ) : (
            <>
              <div>
                <Label>Job</Label>
                <p className="text-sm text-black dark:text-white mt-1 font-semibold">{job.title}</p>
                <p className="text-xs text-black dark:text-white">Current Total: ${(job.bids?.[0]?.amount || 0).toLocaleString()}</p>
              </div>

              <div>
                <Label htmlFor="photo-upload">Upload Discovery Photo</Label>
                <div className="mt-2 flex gap-4">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={analyzePhoto} 
                    disabled={photos.length === 0 || uploading}
                    variant="outline"
                  >
                    <Camera size={16} className="mr-2" />
                    AI Analyze
                  </Button>
                </div>
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img src={photo} alt={`Discovery ${idx + 1}`} className="w-full h-32 object-cover border border-black/20 dark:border-white/20" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the discovered issue and recommended fix..."
                  className="mt-2 min-h-[150px]"
                />
              </div>

              <div>
                <Label htmlFor="additional-cost">Additional Cost</Label>
                <Input
                  id="additional-cost"
                  type="number"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-2"
                />
                {job.bids?.[0]?.amount && (
                  <p className="text-sm text-black dark:text-white mt-2">
                    New Total: ${((job.bids[0].amount || 0) + additionalCost).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={createChangeOrder} className="flex-1">
                  Create Change Order
                </Button>
                <Button variant="outline" onClick={generatePDF}>
                  <Download size={16} className="mr-2" />
                  Generate PDF
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {job && jobChangeOrders.length > 0 && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Change Orders for {job.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobChangeOrders.map((co) => (
              <div key={co.id} className="p-4 border border-black/20 dark:border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-black dark:text-white">
                      +${co.additionalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-black dark:text-white">
                      {new Date(co.discoveredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={co.status === 'approved' ? 'default' : co.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {co.status}
                  </Badge>
                </div>
                <p className="text-sm text-black dark:text-white mb-2">{co.description}</p>
                {co.photos && co.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {co.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover border border-black dark:border-white" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
