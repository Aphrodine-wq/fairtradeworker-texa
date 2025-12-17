import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackButton } from "@/components/ui/BackButton"
import { 
  Gear, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash,
  Eye,
  EyeSlash,
  Lock
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface SettingsPageProps {
  user: User
  onNavigate: (page: string) => void
}

export function SettingsPage({ user, onNavigate }: SettingsPageProps) {
  const [currentUser, setCurrentUser] = useKV<User | null>("current-user", user)
  const [name, setName] = useState(currentUser?.fullName || "")
  const [email, setEmail] = useState(currentUser?.email || "")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    jobUpdates: true,
    bidAlerts: true
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showContactInfo: true,
    allowMessages: true
  })

  const handleSaveAccount = () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error("Valid email is required")
      return
    }
    
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        fullName: name.trim(),
        email: email.trim()
      })
      toast.success("Account settings saved!")
    }
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      user: currentUser,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fairtradeworker-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (confirm("This will permanently delete all your data. Type 'DELETE' to confirm.")) {
        toast.success("Account deletion requested. This feature will be available soon.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <BackButton onClick={() => onNavigate('dashboard')} />
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Gear size={28} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} weight="duotone" className="text-primary" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button onClick={handleSaveAccount} className="w-full">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={20} weight="duotone" className="text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button variant="outline" className="w-full">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download size={20} weight="duotone" className="text-primary" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Export or delete your account data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-semibold">Export Data</p>
                      <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download size={18} className="mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash size={18} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell size={20} weight="duotone" className="text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Text message alerts</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="job-updates">Job Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about your jobs</p>
                    </div>
                    <Switch
                      id="job-updates"
                      checked={notifications.jobUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, jobUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bid-alerts">Bid Alerts</Label>
                      <p className="text-sm text-muted-foreground">New bid notifications</p>
                    </div>
                    <Switch
                      id="bid-alerts"
                      checked={notifications.bidAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, bidAlerts: checked})}
                    />
                  </div>
                  <Button onClick={() => toast.success("Notification preferences saved!")} className="w-full">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={20} weight="duotone" className="text-primary" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control your profile visibility and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-visible">Profile Visible</Label>
                      <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                    </div>
                    <Switch
                      id="profile-visible"
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => setPrivacy({...privacy, profileVisible: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-contact">Show Contact Info</Label>
                      <p className="text-sm text-muted-foreground">Display email and phone on profile</p>
                    </div>
                    <Switch
                      id="show-contact"
                      checked={privacy.showContactInfo}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showContactInfo: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-messages">Allow Messages</Label>
                      <p className="text-sm text-muted-foreground">Let others send you messages</p>
                    </div>
                    <Switch
                      id="allow-messages"
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                    />
                  </div>
                  <Button onClick={() => toast.success("Privacy settings saved!")} className="w-full">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} weight="duotone" className="text-primary" />
                    Subscription & Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Current Plan</span>
                      <Badge variant={user.isPro ? "default" : "outline"}>
                        {user.isPro ? "Pro" : "Free"}
                      </Badge>
                    </div>
                    {user.isPro ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        Pro subscription active. Manage or cancel anytime.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        You're on the free plan. Upgrade to unlock Pro features.
                      </p>
                    )}
                  </div>
                  {user.isPro ? (
                    <Button variant="outline" className="w-full" onClick={() => onNavigate('pro-upgrade')}>
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => onNavigate('pro-upgrade')}>
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}