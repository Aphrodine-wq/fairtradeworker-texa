import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Buildings, Upload, Image as ImageIcon, Trash } from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface CompanySettingsProps {
  user: User
  onUpdate: (updates: Partial<User>) => void
}

export function CompanySettings({ user, onUpdate }: CompanySettingsProps) {
  const [companyName, setCompanyName] = useState(user.companyName || "")
  const [companyAddress, setCompanyAddress] = useState(user.companyAddress || "")
  const [companyPhone, setCompanyPhone] = useState(user.companyPhone || "")
  const [companyEmail, setCompanyEmail] = useState(user.companyEmail || user.email)
  const [taxId, setTaxId] = useState(user.taxId || "")
  const [logoPreview, setLogoPreview] = useState(user.companyLogo || "")
  const [isUploading, setIsUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setLogoPreview(dataUrl)
        toast.success("Logo uploaded! Don't forget to save changes.")
      }
      reader.onerror = () => {
        toast.error("Failed to read image file")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Logo upload error:", error)
      toast.error("Failed to upload logo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview("")
    toast.success("Logo removed. Save changes to apply.")
  }

  const handleSave = () => {
    const updates: Partial<User> = {
      companyName: companyName.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
      companyPhone: companyPhone.trim() || undefined,
      companyEmail: companyEmail.trim() || undefined,
      taxId: taxId.trim() || undefined,
      companyLogo: logoPreview || undefined
    }

    onUpdate(updates)
    toast.success("Company settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Buildings weight="duotone" size={24} className="text-primary" />
            Company Profile
          </CardTitle>
          <CardDescription>
            Customize your company details for professional invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-start gap-4">
                {logoPreview ? (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="w-32 h-32 object-contain border-2 border-border rounded-lg bg-muted p-2"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveLogo}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                    <ImageIcon size={32} className="text-muted-foreground" weight="duotone" />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2" size={16} weight="bold" />
                      {isUploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, or SVG. Max 2MB. Transparent background recommended.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {logoPreview 
                      ? "Your custom logo will appear on all invoices." 
                      : "Without a logo, invoices will use the FairTradeWorker Texas generic logo."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="ABC Plumbing & Services"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
                <Input
                  id="taxId"
                  placeholder="XX-XXXXXXX"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Business Address</Label>
              <Textarea
                id="companyAddress"
                placeholder="123 Main Street&#10;Austin, TX 78701"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Business Phone</Label>
                <Input
                  id="companyPhone"
                  type="tel"
                  placeholder="(512) 555-0123"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Business Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setCompanyName(user.companyName || "")
              setCompanyAddress(user.companyAddress || "")
              setCompanyPhone(user.companyPhone || "")
              setCompanyEmail(user.companyEmail || user.email)
              setTaxId(user.taxId || "")
              setLogoPreview(user.companyLogo || "")
              toast.info("Changes discarded")
            }}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Company Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Tax-Compliant Invoicing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>With Company Logo:</strong> Your custom branding appears on all invoices, 
            perfect for maintaining your professional identity.
          </p>
          <p>
            <strong>Without Company Logo:</strong> Invoices display the FairTradeWorker Texas 
            generic logo, ensuring all documents remain tax-compliant and professional for IRS purposes.
          </p>
          <p className="text-muted-foreground pt-2">
            All invoices include proper line-item details, tax calculations, payment terms, 
            and business identification—meeting Texas tax requirements regardless of logo choice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
