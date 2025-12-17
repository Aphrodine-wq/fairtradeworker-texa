import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Sparkle, 
  Plus,
  Copy,
  CheckCircle,
  Clock,
  MessageCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface SmartRepliesPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function SmartRepliesPage({ user, onNavigate }: SmartRepliesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const smartReplies = [
    { 
      id: 1, 
      category: "Job Inquiry", 
      title: "Thank you for your interest", 
      message: "Thank you for reaching out! I'd be happy to help with your project. Let me review the details and I'll get back to you with a quote within 24 hours.",
      useCount: 45,
      lastUsed: "2025-01-18"
    },
    { 
      id: 2, 
      category: "Pricing", 
      title: "Quote follow-up", 
      message: "I've prepared a detailed quote for your project. The price includes all materials and labor. Please let me know if you have any questions or would like to schedule a consultation.",
      useCount: 32,
      lastUsed: "2025-01-17"
    },
    { 
      id: 3, 
      category: "Scheduling", 
      title: "Availability confirmation", 
      message: "I'm available to start your project on [DATE]. I'll arrive at [TIME] and expect to complete the work by [END_TIME]. Does this work for your schedule?",
      useCount: 28,
      lastUsed: "2025-01-19"
    },
    { 
      id: 4, 
      category: "Follow-up", 
      title: "Post-job check-in", 
      message: "Hi! I wanted to follow up and make sure everything is working well with the work we completed. Please let me know if you have any questions or concerns.",
      useCount: 19,
      lastUsed: "2025-01-15"
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black dark:bg-white">
                <Sparkle size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Smart Replies</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  AI-powered quick responses for common customer communications
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              Create Reply
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <Input
              placeholder="Search smart replies by category or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 bg-white dark:bg-black border-transparent dark:border-white"
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Replies</p>
              <p className="text-2xl font-bold text-black dark:text-white">{smartReplies.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Uses</p>
              <p className="text-2xl font-bold text-primary">
                {smartReplies.reduce((sum, r) => sum + r.useCount, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Time Saved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">12.5h</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Categories</p>
              <p className="text-2xl font-bold text-black dark:text-white">4</p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Replies List */}
        <div className="space-y-4">
          {smartReplies.map((reply) => (
            <Card key={reply.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-black dark:text-white">{reply.title}</h3>
                          <Badge variant="outline" className="border-transparent dark:border-white">
                            {reply.category}
                          </Badge>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg mb-3">
                          <p className="text-sm text-black dark:text-white leading-relaxed">{reply.message}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                          <div className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            <span>Used {reply.useCount} times</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>Last used: {reply.lastUsed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      <Copy size={16} className="mr-2" />
                      Copy & Use
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Edit
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
