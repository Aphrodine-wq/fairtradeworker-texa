/**
 * Dedicated Pro Support Chat
 * Additional Pro Feature - In-app priority messaging
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Headset,
  Send,
  Check,
  CheckCheck,
  Clock,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface SupportMessage {
  id: string
  from: 'user' | 'support'
  text: string
  timestamp: string
  read: boolean
  status: 'sent' | 'delivered' | 'read'
}

interface ProSupportChatProps {
  user: User
}

export function ProSupportChat({ user }: ProSupportChatProps) {
  const isPro = user?.isPro || false
  const [messages, setMessages] = useLocalKV<SupportMessage[]>(`pro-support-${user?.id}`, [])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const sendMessage = () => {
    if (!newMessage.trim()) return

    setSending(true)
    const message: SupportMessage = {
      id: `msg-${Date.now()}`,
      from: 'user',
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent'
    }

    setMessages([...messages, message])
    setNewMessage("")
    
    // Simulate support response (in production, use WebSocket or polling)
    setTimeout(() => {
      const supportResponse: SupportMessage = {
        id: `msg-${Date.now() + 1}`,
        from: 'support',
        text: `Thanks for reaching out! Our Pro support team will respond within 4 hours. In the meantime, how can we help you with: "${newMessage.substring(0, 50)}..."?`,
        timestamp: new Date().toISOString(),
        read: true,
        status: 'delivered'
      }
      setMessages(prev => [...prev, supportResponse])
      setSending(false)
      toast.success("Message sent! Pro support will respond within 4 hours.")
    }, 1000)
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headset weight="duotone" size={24} />
            Pro Support Chat
          </CardTitle>
          <CardDescription>
            Upgrade to Pro for dedicated priority support
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Headset weight="duotone" size={24} />
              Pro Support Chat
            </CardTitle>
            <CardDescription>
              Priority support with 4-hour response guarantee
            </CardDescription>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle size={12} weight="fill" />
            Pro Priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 border-0 shadow-md hover:shadow-lg">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Headset size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white mb-2">No messages yet</p>
                <p className="text-sm text-black dark:text-white opacity-70">
                  Get priority support from our Pro team. Average response time: under 4 hours.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 border-2 ${
                      msg.from === 'user'
                        ? 'bg-black dark:bg-white text-white dark:text-black border-0 shadow-sm'
                        : 'bg-white dark:bg-black text-black dark:text-white border-[#00FF00] dark:border-[#00FF00]'
                    }`}
                  >
                    {msg.from === 'support' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Pro Support
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      {msg.from === 'user' && (
                        msg.status === 'read' ? (
                          <CheckCheck size={12} className="text-blue-400" weight="fill" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={12} className="opacity-50" />
                        ) : (
                          <Check size={12} className="opacity-50" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sending && sendMessage()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
              <Send size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-black dark:text-white">
            <Clock size={12} />
            <span>Average response time: under 4 hours (Pro Priority)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
