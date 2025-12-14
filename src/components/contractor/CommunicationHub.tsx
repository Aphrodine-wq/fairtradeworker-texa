import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatCircleDots, Phone, VideoCamera, PaperPlaneTilt, Plus, Search, User } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  read: boolean
  attachments?: string[]
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export function CommunicationHub({ user }: { user: User }) {
  const [messages, setMessages] = useKV<Message[]>("messages", [])
  const [conversations, setConversations] = useKV<Conversation[]>("conversations", [])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const currentConversation = useMemo(() => 
    conversations.find(c => c.id === selectedConversation) || null,
    [conversations, selectedConversation]
  )

  const conversationMessages = useMemo(() => 
    selectedConversation 
      ? messages.filter(m => 
          (m.from === selectedConversation && m.to === user.id) ||
          (m.to === selectedConversation && m.from === user.id)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : [],
    [messages, selectedConversation, user.id]
  )

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    return conversations.filter(c => 
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      from: user.id,
      to: selectedConversation,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <ChatCircleDots weight="duotone" size={40} className="text-black dark:text-white" />
              <span className="text-black dark:text-white">Communication Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Real-time messaging, video calls, and file sharing
            </p>
          </div>

          {/* Main Communication Interface */}
          <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
                {/* Conversations List */}
                <div className="border-r border-black/10 dark:border-white/10 flex flex-col">
                  <div className="p-4 border-b border-black/10 dark:border-white/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`p-4 border-b border-black/10 dark:border-white/10 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation === conv.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User weight="fill" size={20} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-black dark:text-white truncate">
                                {conv.participantName}
                              </h3>
                              {conv.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.lastMessageTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredConversations.length === 0 && (
                      <div className="p-8 text-center">
                        <ChatCircleDots size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No conversations yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 flex flex-col">
                  {currentConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User weight="fill" size={20} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-black dark:text-white">
                              {currentConversation.participantName}
                            </h3>
                            <p className="text-xs text-muted-foreground">Online</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone size={18} />
                          </Button>
                          <Button variant="outline" size="sm">
                            <VideoCamera size={18} />
                          </Button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {conversationMessages.map(msg => {
                          const isFromMe = msg.from === user.id
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] rounded-lg p-3 ${
                                isFromMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 h-11"
                          />
                          <Button onClick={handleSendMessage} className="h-11">
                            <PaperPlaneTilt size={18} />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <ChatCircleDots size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-lg">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}