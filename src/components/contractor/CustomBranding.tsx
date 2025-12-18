/**
 * Custom Branding on Portfolio
 * Additional Pro Feature - Custom domain/CNAME + remove FTW branding
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Globe,
  Image,
  Upload,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface BrandingSettings {
  customDomain?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  removeFTWBranding: boolean
  customFooter?: string
}

interface CustomBrandingProps {
  user: User
}

export function CustomBranding({ user }: CustomBrandingProps) {
  const isPro = user?.isPro || false
  const [branding, setBranding] = useLocalKV<BrandingSettings>(`branding-${user?.id}`, {
    removeFTWBranding: false
  })

  const handleLogoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setBranding({ ...branding, logoUrl: dataUrl })
        toast.success("Logo uploaded!")
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const saveBranding = () => {
    toast.success("Branding settings saved!")
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe weight="duotone" size={24} />
            Custom Branding
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to customize your portfolio with custom domain and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe weight="duotone" size={24} />
          Custom Branding
        </CardTitle>
        <CardDescription>
          Customize your portfolio with your own domain and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="custom-domain">Custom Domain</Label>
          <Input
            id="custom-domain"
            value={branding.customDomain || ''}
            onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
            placeholder="e.g., portfolio.yourcompany.com"
            className="mt-2"
          />
          <p className="text-xs text-black dark:text-white mt-1">
            Point your domain's CNAME to: portfolio.fairtradeworker.com
          </p>
        </div>

        <div>
          <Label>Logo</Label>
          <div className="mt-2">
            {branding.logoUrl ? (
              <div className="flex items-center gap-4">
                <img src={branding.logoUrl} alt="Logo" className="w-32 h-32 object-contain border-0 shadow-md hover:shadow-lg" />
                <Button variant="outline" onClick={handleLogoUpload}>
                  <Upload size={16} className="mr-2" />
                  Change Logo
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={handleLogoUpload}>
                <Upload size={16} className="mr-2" />
                Upload Logo
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <Input
              id="primary-color"
              type="color"
              value={branding.primaryColor || '#000000'}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="mt-2 w-full h-10"
            />
          </div>
          <div>
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <Input
              id="secondary-color"
              type="color"
              value={branding.secondaryColor || '#FFFFFF'}
              onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
              className="mt-2 w-full h-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-0 shadow-md hover:shadow-lg">
          <div>
            <Label htmlFor="remove-branding">Remove FTW Branding</Label>
            <p className="text-xs text-black dark:text-white mt-1">
              Hide FairTradeWorker branding from your portfolio
            </p>
          </div>
          <Switch
            id="remove-branding"
            checked={branding.removeFTWBranding}
            onCheckedChange={(checked) => setBranding({ ...branding, removeFTWBranding: checked })}
          />
        </div>

        <div>
          <Label htmlFor="custom-footer">Custom Footer Text</Label>
          <Input
            id="custom-footer"
            value={branding.customFooter || ''}
            onChange={(e) => setBranding({ ...branding, customFooter: e.target.value })}
            placeholder="Optional custom footer text"
            className="mt-2"
          />
        </div>

        <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
            <div>
              <p className="font-semibold text-black dark:text-white mb-2">Portfolio URL</p>
              <p className="text-sm text-black dark:text-white">
                {branding.customDomain 
                  ? `https://${branding.customDomain}`
                  : `https://fairtradeworker.com/pro/${user?.id}`
                }
              </p>
            </div>
          </div>
        </div>

        <Button onClick={saveBranding} className="w-full">
          Save Branding Settings
        </Button>
      </CardContent>
    </Card>
  )
}
