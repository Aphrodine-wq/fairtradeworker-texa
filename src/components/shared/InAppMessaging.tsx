/**
 * In-App Messaging (Light)
 * Free Feature - Direct chat between homeowner/contractor
 */

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle,
  Send,
  Check,
  CheckCheck
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface Message {
  id: string
  threadId: string
  from: string
  text: string
  timestamp: string
  read: boolean
}

interface MessageThread {
  id: string
  participants: string[]
  jobId?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

interface InAppMessagingProps {
  user: User
  otherUserId?: string
  job?: Job
}

export function InAppMessaging({ user, otherUserId, job }: InAppMessagingProps) {
  const [threads, setThreads] = useLocalKV<MessageThread[]>(`message-threads-${user.id}`, [])
  const [messages, setMessages] = useLocalKV<Message[]>(`messages`, [])
  const [newMessage, setNewMessage] = useState("")
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentThread = selectedThread ? threads.find(t => t.id === selectedThread) : null
  const threadMessages = currentThread
    ? messages.filter(m => m.threadId === currentThread.id).sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : []

  const createOrGetThread = (otherId: string) => {
    const existing = threads.find(t => 
      t.participants.includes(user.id) && t.participants.includes(otherId)
    )
    if (existing) {
      return existing.id
    }

    const newThread: MessageThread = {
      id: `thread-${Date.now()}`,
      participants: [user.id, otherId],
      jobId: job?.id,
      unreadCount: 0
    }
    setThreads([...threads, newThread])
    return newThread.id
  }

  useEffect(() => {
    if (otherUserId) {
      const threadId = createOrGetThread(otherUserId)
      setSelectedThread(threadId)
    }
  }, [otherUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const sendMessage = () => {
    if (!newMessage.trim() || !currentThread) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      threadId: currentThread.id,
      from: user.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }

    setMessages([...messages, message])
    setThreads(threads.map(t =>
      t.id === currentThread.id
        ? { ...t, lastMessage: newMessage, lastMessageAt: message.timestamp }
        : t
    ))
    setNewMessage("")
    toast.success("Message sent")
  }

  // Polling simulation (in production, use WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mark messages as read
      if (currentThread) {
        setMessages(messages.map(m =>
          m.threadId === currentThread.id && m.from !== user.id && !m.read
            ? { ...m, read: true }
            : m
        ))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [currentThread, messages, user.id])

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle weight="duotone" size={24} />
            Messages
          </CardTitle>
          <CardDescription>
            Direct messaging with homeowners and contractors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            {/* Threads List */}
            <div className="border-0 shadow-md hover:shadow-lg overflow-y-auto">
              <div className="p-2 space-y-2">
                {threads.length === 0 ? (
                  <p className="text-center text-black dark:text-white py-8 text-sm">
                    No messages yet
                  </p>
                ) : (
                  threads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`p-3 cursor-pointer border-2 transition-all ${
                        selectedThread === thread.id
                          ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                          : 'border-black dark:border-white'
                      }`}
                      onClick={() => setSelectedThread(thread.id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm text-black dark:text-white">
                          {thread.participants.find(id => id !== user.id)?.substring(0, 8) || 'User'}
                        </p>
                        {thread.unreadCount > 0 && (
                          <Badge variant="default">{thread.unreadCount}</Badge>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-xs text-black dark:text-white line-clamp-1">
                          {thread.lastMessage}
                        </p>
                      )}
                      {thread.lastMessageAt && (
                        <p className="text-xs text-black dark:text-white opacity-70 mt-1">
                          {new Date(thread.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="md:col-span-2 flex flex-col border-0 shadow-md hover:shadow-lg">
              {currentThread ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {threadMessages.length === 0 ? (
                      <p className="text-center text-black dark:text-white py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      threadMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 border-2 ${
                              msg.from === user.id
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                : 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                              {msg.from === user.id && (
                                msg.read ? (
                                  <CheckCheck size={12} className="text-blue-400" weight="fill" />
                                ) : (
                                  <Check size={12} className="opacity-50" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button onClick={sendMessage}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-black dark:text-white">Select a conversation</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
