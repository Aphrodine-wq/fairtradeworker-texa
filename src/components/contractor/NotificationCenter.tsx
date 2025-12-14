import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Bell, CheckCircle, X, Filter, Search, Trash } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: string
  actionUrl?: string
}

export function NotificationCenter({ user }: { user: User }) {
  const [notifications, setNotifications] = useKV<Notification[]>("notifications", [])
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotifications = useMemo(() => {
    let filtered = notifications
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filter === 'high') {
      filtered = filtered.filter(n => n.priority === 'high')
    }
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [notifications, filter, searchQuery])

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  )

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle weight="fill" size={20} className="text-green-600 dark:text-green-400" />
      case 'warning': return <Bell weight="fill" size={20} className="text-yellow-600 dark:text-yellow-400" />
      case 'error': return <X weight="fill" size={20} className="text-red-600 dark:text-red-400" />
      default: return <Bell weight="fill" size={20} className="text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <Bell weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Notification Center</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-lg">
                Stay updated with all your business notifications
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                Mark All Read
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="high">High Priority</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`bg-white dark:bg-black border-2 ${
                  !notification.read 
                    ? 'border-primary/50 shadow-md' 
                    : 'border-black/10 dark:border-white/10'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${!notification.read ? 'text-black dark:text-white' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority} priority
                          </Badge>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8"
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="h-8 text-red-600 dark:text-red-400"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardContent className="p-12 text-center">
                  <Bell size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg">No notifications</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're all caught up!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}