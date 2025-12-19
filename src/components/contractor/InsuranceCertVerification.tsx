/**
 * Insurance/Cert Upload Verification
 * Additional Pro Feature - Auto-flag verified contractors in search
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  XCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface InsuranceCertVerificationProps {
  user: User
}

interface Verification {
  id: string
  type: 'insurance' | 'license' | 'certification'
  documentUrl: string
  number: string
  expiryDate?: string
  status: 'pending' | 'verified' | 'rejected'
  verifiedAt?: string
  uploadedAt: string
}

export function InsuranceCertVerification({ user }: InsuranceCertVerificationProps) {
  const isPro = user.isPro || false
  const [verifications, setVerifications] = useLocalKV<Verification[]>(`verifications-${user.id}`, [])
  const [uploading, setUploading] = useState(false)
  const [certNumber, setCertNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  const handleUpload = (type: 'insurance' | 'license' | 'certification') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploading(true)
      try {
        // In production, upload to storage
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string

          const newVerification: Verification = {
            id: `verify-${Date.now()}`,
            type,
            documentUrl: dataUrl,
            number: certNumber || `DOC-${Date.now()}`,
            expiryDate: expiryDate || undefined,
            status: 'pending',
            uploadedAt: new Date().toISOString()
          }

          setVerifications([...verifications, newVerification])
          setCertNumber("")
          setExpiryDate("")
          toast.success(`${type} document uploaded. Awaiting verification.`)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        toast.error("Upload failed")
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }

  const verifiedCount = verifications.filter(v => v.status === 'verified').length

  return (
    <div className="space-y-6">
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck weight="duotone" size={24} />
            Insurance & Certification Verification
          </CardTitle>
          <CardDescription>
            Upload documents to get verified badge. Verified contractors rank higher in search.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPro && (
            <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
                <p className="font-semibold text-black dark:text-white">Pro Benefit</p>
              </div>
              <p className="text-sm text-black dark:text-white">
                Verified contractors appear first in homeowner search results and get a verified badge on their profile.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card glass={isPro}>
              <CardHeader>
                <CardTitle className="text-lg">Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="insurance-number">Policy Number</Label>
                  <Input
                    id="insurance-number"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="POL-123456"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="insurance-expiry">Expiry Date</Label>
                  <Input
                    id="insurance-expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={() => handleUpload('insurance')}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Insurance
                </Button>
              </CardContent>
            </Card>

            <Card glass={isPro}>
              <CardHeader>
                <CardTitle className="text-lg">License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="license-number">License Number</Label>
                  <Input
                    id="license-number"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="TX-GC-12345"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={() => handleUpload('license')}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload size={16} className="mr-2" />
                  Upload License
                </Button>
              </CardContent>
            </Card>

            <Card glass={isPro}>
              <CardHeader>
                <CardTitle className="text-lg">Certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cert-number">Cert Number</Label>
                  <Input
                    id="cert-number"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="CERT-12345"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={() => handleUpload('certification')}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Certification
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {verifications.length > 0 && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              {verifiedCount} verified, {verifications.filter(v => v.status === 'pending').length} pending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="p-4 border-0 shadow-md hover:shadow-lg flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-black dark:text-white capitalize">
                      {verification.type}
                    </h3>
                    <Badge variant={
                      verification.status === 'verified' ? 'default' :
                      verification.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {verification.status === 'verified' && (
                        <CheckCircle size={12} className="mr-1" weight="fill" />
                      )}
                      {verification.status === 'pending' && (
                        <Clock size={12} className="mr-1" />
                      )}
                      {verification.status === 'rejected' && (
                        <XCircle size={12} className="mr-1" />
                      )}
                      {verification.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-black dark:text-white">
                    Number: {verification.number}
                  </p>
                  {verification.expiryDate && (
                    <p className="text-xs text-black dark:text-white mt-1">
                      Expires: {new Date(verification.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  {verification.verifiedAt && (
                    <p className="text-xs text-black dark:text-white mt-1">
                      Verified: {new Date(verification.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
