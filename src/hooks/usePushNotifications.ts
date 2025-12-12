import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import type { User } from '@/lib/types';

export interface NotificationPreferences {
  enabled: boolean;
  newJobs: boolean;
  jobMatches: boolean;
  bidAccepted: boolean;
  bidRejected: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  jobCategories: string[];
  maxDistance: number;
  minJobValue: number;
  maxJobValue: number;
  instantAlerts: boolean;
  batchAlerts: boolean;
  batchInterval: number;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  newJobs: true,
  jobMatches: true,
  bidAccepted: true,
  bidRejected: true,
  messages: true,
  payments: true,
  reviews: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  jobCategories: [],
  maxDistance: 50,
  minJobValue: 0,
  maxJobValue: 50000,
  instantAlerts: true,
  batchAlerts: false,
  batchInterval: 60,
};

export function usePushNotifications(user: User | null) {
  const [preferences, setPreferences] = useKV<NotificationPreferences>(
    `notification-prefs-${user?.id}`,
    DEFAULT_PREFERENCES
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkSupport();
    checkPermission();
    loadSubscription();
  }, []);

  const checkSupport = () => {
    const supported = 
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;
    setIsSupported(supported);
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const loadSubscription = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Failed to load push subscription:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported, user]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user || permission !== 'granted') {
      return false;
    }

    setIsSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = 'BKxZ8YVvzVJ_X5VqHK9X8YVvzVJ_X5VqHK9X8YVvzVJ_X5VqHK9X8YVvzVJ_X5VqHK9';
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      setSubscription(sub);
      
      await savePushSubscription(sub, user.id);
      
      await setPreferences(prev => ({ ...(prev || DEFAULT_PREFERENCES), enabled: true }));
      
      setIsSubscribing(false);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setIsSubscribing(false);
      return false;
    }
  }, [isSupported, user, permission, setPreferences]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription || !user) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      await deletePushSubscription(user.id);
      
      await setPreferences(prev => ({ ...(prev || DEFAULT_PREFERENCES), enabled: false }));
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [subscription, user, setPreferences]);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    await setPreferences(prev => ({ ...(prev || DEFAULT_PREFERENCES), ...updates }));
  }, [setPreferences]);

  const testNotification = useCallback(async () => {
    if (permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: 'Your notifications are working! 🎉',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-notification',
      } as NotificationOptions);
    } catch (error) {
      console.error('Failed to show test notification:', error);
    }
  }, [permission]);

  const isInQuietHours = useCallback((): boolean => {
    const prefs = preferences || DEFAULT_PREFERENCES;
    if (!prefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }, [preferences]);

  return {
    preferences: preferences || DEFAULT_PREFERENCES,
    subscription,
    isSupported,
    isSubscribing,
    permission,
    isSubscribed: !!subscription && (preferences?.enabled ?? false),
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    testNotification,
    isInQuietHours,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function savePushSubscription(subscription: PushSubscription, userId: string) {
  try {
    await window.spark.kv.set(`push-subscription-${userId}`, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      },
      userId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
  }
}

async function deletePushSubscription(userId: string) {
  try {
    await window.spark.kv.delete(`push-subscription-${userId}`);
  } catch (error) {
    console.error('Failed to delete push subscription:', error);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function useJobAlerts(user: User | null) {
  const { preferences, isSubscribed, isInQuietHours } = usePushNotifications(user);
  const [pendingAlerts, setPendingAlerts] = useKV<Array<{
    id: string;
    jobId: string;
    title: string;
    message: string;
    timestamp: number;
  }>>(`pending-alerts-${user?.id}`, []);

  const shouldNotify = useCallback((job: {
    category: string;
    estimatedCost: number;
    location: { lat: number; lng: number };
  }): boolean => {
    const prefs = preferences || DEFAULT_PREFERENCES;
    if (!isSubscribed || !prefs.newJobs) return false;

    if (prefs.jobCategories.length > 0 && !prefs.jobCategories.includes(job.category)) {
      return false;
    }

    if (job.estimatedCost < prefs.minJobValue || job.estimatedCost > prefs.maxJobValue) {
      return false;
    }

    return true;
  }, [isSubscribed, preferences]);

  const queueAlert = useCallback(async (alert: {
    jobId: string;
    title: string;
    message: string;
  }) => {
    const prefs = preferences || DEFAULT_PREFERENCES;
    const newAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    if (prefs.instantAlerts && !isInQuietHours()) {
      await sendImmediateNotification(newAlert);
    } else {
      await setPendingAlerts(prev => [...(prev || []), newAlert]);
    }
  }, [preferences, isInQuietHours, setPendingAlerts]);

  const processPendingAlerts = useCallback(async () => {
    const alerts = pendingAlerts || [];
    const prefs = preferences || DEFAULT_PREFERENCES;
    if (alerts.length === 0) return;

    if (prefs.batchAlerts) {
      await sendBatchNotification(alerts);
    } else {
      for (const alert of alerts) {
        await sendImmediateNotification(alert);
      }
    }

    await setPendingAlerts([]);
  }, [pendingAlerts, preferences, setPendingAlerts]);

  useEffect(() => {
    const alerts = pendingAlerts || [];
    if (!isInQuietHours() && alerts.length > 0) {
      processPendingAlerts();
    }
  }, [isInQuietHours, pendingAlerts]);

  return {
    shouldNotify,
    queueAlert,
    processPendingAlerts,
    pendingAlerts,
  };
}

async function sendImmediateNotification(alert: {
  title: string;
  message: string;
  jobId: string;
}) {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(alert.title, {
      body: alert.message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `job-${alert.jobId}`,
      data: { jobId: alert.jobId, url: `/?action=browse-jobs&job=${alert.jobId}` },
      actions: [
        { action: 'view', title: 'View Job' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    } as NotificationOptions);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

async function sendBatchNotification(alerts: Array<{ title: string; message: string }>) {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(
      `${alerts.length} New Job${alerts.length > 1 ? 's' : ''} Available`,
      {
        body: alerts.length === 1 
          ? alerts[0].message 
          : `${alerts.length} jobs match your preferences`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'batch-jobs',
        data: { url: '/?action=browse-jobs' },
        actions: [
          { action: 'view', title: 'View Jobs' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      } as NotificationOptions
    );
  } catch (error) {
    console.error('Failed to send batch notification:', error);
  }
}
