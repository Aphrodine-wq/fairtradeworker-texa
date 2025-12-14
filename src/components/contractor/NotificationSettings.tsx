import { useState } from 'react';
import { Bell, BellOff, Check, Moon, Settings2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { User } from '@/lib/types';

interface NotificationSettingsProps {
  user: User;
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const {
    preferences,
    isSupported,
    isSubscribing,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    testNotification,
  } = usePushNotifications(user);

  const [isExpanded, setIsExpanded] = useState(false);

  const handleEnable = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Notification permission denied');
        return;
      }
    }

    const success = await subscribe();
    if (success) {
      toast.success('Push notifications enabled! 🎉');
      await testNotification();
    } else {
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisable = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success('Push notifications disabled');
    } else {
      toast.error('Failed to disable notifications');
    }
  };

  const handleTest = async () => {
    await testNotification();
    toast.success('Test notification sent!');
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="w-5 h-5" />
          <p>Push notifications are not supported in this browser</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {isSubscribed ? (
              <div className="w-10 h-10 rounded-none bg-black dark:bg-white border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                <Bell className="w-5 h-5 text-primary" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                <BellOff className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg">Push Notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isSubscribed
                  ? 'Get instant alerts for new jobs matching your preferences'
                  : 'Enable push notifications to never miss a job opportunity'}
              </p>
              {isSubscribed && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Instant Alerts On
                  </Badge>
                  {preferences.quietHoursEnabled && (
                    <Badge variant="outline" className="gap-1">
                      <Moon className="w-3 h-3" />
                      Quiet Hours: {preferences.quietHoursStart} - {preferences.quietHoursEnd}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                >
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisable}
                >
                  Disable
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEnable}
                disabled={isSubscribing}
                className="gap-2"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-none animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Enable Notifications
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isSubscribed && isExpanded && (
          <div className="mt-6 pt-6 border-t space-y-6">
            <div>
              <h4 className="font-medium mb-4">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newJobs">New Jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      All new jobs matching your service area
                    </p>
                  </div>
                  <Switch
                    id="newJobs"
                    checked={preferences.newJobs}
                    onCheckedChange={(checked) =>
                      updatePreferences({ newJobs: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="jobMatches">Smart Matches</Label>
                    <p className="text-sm text-muted-foreground">
                      Jobs that perfectly match your preferences
                    </p>
                  </div>
                  <Switch
                    id="jobMatches"
                    checked={preferences.jobMatches}
                    onCheckedChange={(checked) =>
                      updatePreferences({ jobMatches: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bidAccepted">Bid Accepted</Label>
                    <p className="text-sm text-muted-foreground">
                      When homeowners accept your bids
                    </p>
                  </div>
                  <Switch
                    id="bidAccepted"
                    checked={preferences.bidAccepted}
                    onCheckedChange={(checked) =>
                      updatePreferences({ bidAccepted: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      New messages from homeowners
                    </p>
                  </div>
                  <Switch
                    id="messages"
                    checked={preferences.messages}
                    onCheckedChange={(checked) =>
                      updatePreferences({ messages: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payments">Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Payment received and invoice status
                    </p>
                  </div>
                  <Switch
                    id="payments"
                    checked={preferences.payments}
                    onCheckedChange={(checked) =>
                      updatePreferences({ payments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reviews">Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      New reviews from customers
                    </p>
                  </div>
                  <Switch
                    id="reviews"
                    checked={preferences.reviews}
                    onCheckedChange={(checked) =>
                      updatePreferences({ reviews: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Job Filters</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minJobValue">Job Value Range</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1">
                      <Input
                        id="minJobValue"
                        type="number"
                        value={preferences.minJobValue}
                        onChange={(e) =>
                          updatePreferences({
                            minJobValue: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Min"
                        className="text-sm"
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex-1">
                      <Input
                        id="maxJobValue"
                        type="number"
                        value={preferences.maxJobValue}
                        onChange={(e) =>
                          updatePreferences({
                            maxJobValue: parseInt(e.target.value) || 50000,
                          })
                        }
                        placeholder="Max"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Only notify for jobs between ${preferences.minJobValue.toLocaleString()} and $
                    {preferences.maxJobValue.toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxDistance">Maximum Distance</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="maxDistance"
                      type="number"
                      value={preferences.maxDistance}
                      onChange={(e) =>
                        updatePreferences({
                          maxDistance: parseInt(e.target.value) || 50,
                        })
                      }
                      placeholder="Miles"
                      className="text-sm"
                    />
                    <span className="text-sm text-muted-foreground">miles</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Only notify for jobs within {preferences.maxDistance} miles
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Quiet Hours</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quietHours">Enable Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">
                      Pause notifications during specific times
                    </p>
                  </div>
                  <Switch
                    id="quietHours"
                    checked={preferences.quietHoursEnabled}
                    onCheckedChange={(checked) =>
                      updatePreferences({ quietHoursEnabled: checked })
                    }
                  />
                </div>

                {preferences.quietHoursEnabled && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="quietStart">Start Time</Label>
                      <Input
                        id="quietStart"
                        type="time"
                        value={preferences.quietHoursStart}
                        onChange={(e) =>
                          updatePreferences({ quietHoursStart: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="quietEnd">End Time</Label>
                      <Input
                        id="quietEnd"
                        type="time"
                        value={preferences.quietHoursEnd}
                        onChange={(e) =>
                          updatePreferences({ quietHoursEnd: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Delivery Mode</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="instantAlerts">Instant Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify immediately when jobs are posted
                    </p>
                  </div>
                  <Switch
                    id="instantAlerts"
                    checked={preferences.instantAlerts}
                    onCheckedChange={(checked) =>
                      updatePreferences({ instantAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="batchAlerts">Batch Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Group multiple alerts together
                    </p>
                  </div>
                  <Switch
                    id="batchAlerts"
                    checked={preferences.batchAlerts}
                    onCheckedChange={(checked) =>
                      updatePreferences({ batchAlerts: checked })
                    }
                  />
                </div>

                {preferences.batchAlerts && (
                  <div>
                    <Label htmlFor="batchInterval">Batch Interval (minutes)</Label>
                    <Input
                      id="batchInterval"
                      type="number"
                      value={preferences.batchInterval}
                      onChange={(e) =>
                        updatePreferences({
                          batchInterval: parseInt(e.target.value) || 60,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] font-mono">
              <Check className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Your notification settings are saved automatically
              </p>
            </div>
          </div>
        )}
      </Card>

      {isSubscribed && !isExpanded && (
        <Card className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Lightning-Fast Job Alerts</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive instant notifications when new jobs match your preferences. Top
                contractors respond within 15 minutes and win 2.3x more bids.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
