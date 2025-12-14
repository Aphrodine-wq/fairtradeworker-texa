/**
 * Priority Job Alerts
 * Additional Pro Feature - Push notifications + 5-min head start on new jobs
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Bell,
  Lightning,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface PriorityJobAlertsProps {
  user: User
}

interface AlertSettings {
  enabled: boolean
  minBudget: number
  jobTypes: string[]
  zipCodes: string[]
  pushNotifications: boolean
  smsNotifications: boolean
}

export function PriorityJobAlerts({ user }: PriorityJobAlertsProps) {
  const isPro = user.isPro || false
  const [settings, setSettings] = useLocalKV<AlertSettings>(`priority-alerts-${user.id}`, {
    enabled: false,
    minBudget: 5000,
    jobTypes: [],
    zipCodes: [],
    pushNotifications: true,
    smsNotifications: false
  })

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success("Notifications enabled!")
      }
    }
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell weight="duotone" size={24} />
            Priority Job Alerts
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to get alerts 5 minutes before free tier users
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

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightning weight="duotone" size={24} />
          Priority Job Alerts
        </CardTitle>
        <CardDescription>
          Get notified 5 minutes early for high-value jobs. Exclusive Pro benefit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled">Enable Priority Alerts</Label>
            <p className="text-xs text-black dark:text-white">
              Get alerts 5 minutes before free tier users
            </p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => {
              setSettings({ ...settings, enabled: checked })
              if (checked) {
                requestNotificationPermission()
              }
            }}
          />
        </div>

        {settings.enabled && (
          <>
            <div>
              <Label htmlFor="min-budget">Minimum Budget</Label>
              <Input
                id="min-budget"
                type="number"
                value={settings.minBudget}
                onChange={(e) => setSettings({ ...settings, minBudget: Number(e.target.value) })}
                className="mt-2"
              />
              <p className="text-xs text-black dark:text-white mt-1">
                Only alert for jobs above this amount
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-xs text-black dark:text-white">
                  Browser notifications
                </p>
              </div>
              <Switch
                id="push"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms">SMS Notifications</Label>
                <p className="text-xs text-black dark:text-white">
                  Text messages for high-value jobs
                </p>
              </div>
              <Switch
                id="sms"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </div>

            <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
                <p className="font-semibold text-black dark:text-white">
                  Pro Advantage Active
                </p>
              </div>
              <p className="text-sm text-black dark:text-white">
                You'll receive job alerts 5 minutes before free tier users, giving you a competitive edge on high-value jobs.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
