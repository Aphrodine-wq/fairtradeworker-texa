import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Gear, 
  User, 
  Bell, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeSlash,
  Trash,
  Download,
  Upload
} from "@phosphor-icons/react"
import { BackButton } from "@/components/ui/BackButton"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface SettingsPageProps {
  user: User
  onNavigate: (page: string) => void
}

export function SettingsPage({ user, onNavigate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || "")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile
    toast.success("Profile updated successfully")
  }

  const handleExportData = () => {
    toast.info("Data export started. You'll receive an email when ready.")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion requires additional verification")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton onClick={() => onNavigate('dashboard')} />
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                  <Gear size={28} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Settings</h1>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} weight="duotone" className="text-primary" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell size={20} weight="duotone" className="text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about jobs, bids, and messages</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} weight="duotone" className="text-primary" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods and billing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">No payment methods</p>
                        <p className="text-sm text-muted-foreground">Add a payment method to get started</p>
                      </div>
                      <Button variant="outline" onClick={() => onNavigate('payments')}>
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => onNavigate('payments')}>
                    <CreditCard className="mr-2" size={18} />
                    Manage Payment Methods
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={20} weight="duotone" className="text-primary" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Public
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Allow data sharing for platform improvements</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full" onClick={handleExportData}>
                    <Download className="mr-2" size={18} />
                    Export My Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gear size={20} weight="duotone" className="text-primary" />
                    Account Management
                  </CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-destructive mb-1">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={handleDeleteAccount}
                    >
                      <Trash className="mr-2" size={18} />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}