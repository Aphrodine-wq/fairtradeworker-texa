import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { 
  ChatCircle, 
  TrendUp, 
  Lightning, 
  Plus, 
  Star,
  Clock,
  Check
} from '@phosphor-icons/react'
import { 
  detectMessageSentiment, 
  getTimeAwareReplies, 
  getSentimentBasedReplies,
  type SmartReply,
  type ReplyAnalytics
} from '@/lib/freeFeatures'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SmartRepliesProps {
  messageContext?: string
  onSelectReply: (reply: string) => void
  contractorId: string
}

const DEFAULT_REPLIES: SmartReply[] = [
  {
    id: 'bidding-1',
    text: "Thanks for considering me. I can come take a look tomorrow morning.",
    category: 'bidding',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'bidding-2',
    text: "I specialize in this type of work and can usually complete it in 2-3 hours.",
    category: 'bidding',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'scheduled-1',
    text: "I'll be there between 9am-11am tomorrow.",
    category: 'scheduled',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'scheduled-2',
    text: "Running about 15 minutes behind, sorry for the delay.",
    category: 'scheduled',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'in-progress-1',
    text: "Making good progress. Here's an update photo.",
    category: 'in-progress',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'completed-1',
    text: "All done! Please let me know if you have any questions.",
    category: 'completed',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  },
  {
    id: 'completed-2',
    text: "Thanks for choosing me! A review would really help my business.",
    category: 'completed',
    usageCount: 0,
    positiveResponses: 0,
    isShared: false
  }
]

export function SmartReplies({ messageContext, onSelectReply, contractorId }: SmartRepliesProps) {
  const [replies, setReplies] = useKV<SmartReply[]>('smart-replies', DEFAULT_REPLIES)
  const [analytics, setAnalytics] = useKV<ReplyAnalytics[]>('reply-analytics', [])
  const [customReply, setCustomReply] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SmartReply['category']>('bidding')
  const [showSharedLibrary, setShowSharedLibrary] = useState(false)

  const sentiment = useMemo(() => {
    return messageContext ? detectMessageSentiment(messageContext) : 'neutral'
  }, [messageContext])

  const currentHour = new Date().getHours()
  const timeAwareReplies = useMemo(() => getTimeAwareReplies(currentHour), [currentHour])
  const sentimentReplies = useMemo(() => getSentimentBasedReplies(sentiment), [sentiment])

  const sortedReplies = useMemo(() => {
    if (!replies) return []
    return [...replies]
      .filter(r => r.category === selectedCategory)
      .sort((a, b) => {
        const aRate = a.usageCount > 0 ? a.positiveResponses / a.usageCount : 0
        const bRate = b.usageCount > 0 ? b.positiveResponses / b.usageCount : 0
        return bRate - aRate
      })
  }, [replies, selectedCategory])

  const sharedReplies = useMemo(() => {
    if (!replies) return []
    return replies.filter(r => r.isShared && r.createdBy !== contractorId)
  }, [replies, contractorId])

  const handleSelectReply = (reply: SmartReply) => {
    if (!replies) return
    
    const updatedReplies = replies.map(r => 
      r.id === reply.id 
        ? { ...r, usageCount: r.usageCount + 1 } 
        : r
    )
    setReplies(updatedReplies)

    const newAnalytic: ReplyAnalytics = {
      replyId: reply.id,
      sentAt: new Date().toISOString(),
      responseReceived: false,
      positiveResponse: false
    }
    setAnalytics([...(analytics || []), newAnalytic])

    onSelectReply(reply.text)
    toast.success('Reply sent!')
  }

  const handleAddCustomReply = () => {
    if (!customReply.trim() || !replies) return

    const newReply: SmartReply = {
      id: `custom-${Date.now()}`,
      text: customReply,
      category: selectedCategory,
      usageCount: 0,
      positiveResponses: 0,
      isShared: false,
      createdBy: contractorId
    }

    setReplies([...replies, newReply])
    setCustomReply('')
    toast.success('Reply added to library!')
  }

  const handleShareReply = (replyId: string) => {
    if (!replies) return
    
    const updatedReplies = replies.map(r =>
      r.id === replyId ? { ...r, isShared: true } : r
    )
    setReplies(updatedReplies)
    toast.success('Reply shared with community!')
  }

  const getSuccessRate = (reply: SmartReply): number => {
    if (reply.usageCount === 0) return 0
    return Math.round((reply.positiveResponses / reply.usageCount) * 100)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatCircle weight="duotone" className="text-primary" size={24} />
            Smart Replies
          </CardTitle>
          {sentiment !== 'neutral' && (
            <Badge variant={sentiment === 'frustrated' ? 'destructive' : 'default'} className="mt-2">
              {sentiment === 'frustrated' ? '⚠️ Frustrated customer detected' : '😊 Happy customer detected'}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as SmartReply['category'])}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bidding">Bidding</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-3 mt-4">
              {sentiment !== 'neutral' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {sentiment === 'frustrated' ? 'Empathetic Responses:' : 'Upsell Opportunities:'}
                  </p>
                  {sentimentReplies.map((reply, idx) => (
                    <motion.div
                      key={`sentiment-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => onSelectReply(reply)}
                      >
                        <Lightning weight="fill" className="mr-2 text-accent flex-shrink-0" size={16} />
                        <span className="flex-1">{reply}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedCategory === 'bidding' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock size={16} />
                    Time-Aware Suggestions:
                  </p>
                  {timeAwareReplies.map((reply, idx) => (
                    <Button
                      key={`time-${idx}`}
                      variant="secondary"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => onSelectReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendUp size={16} />
                  Your Best Performers:
                </p>
                <AnimatePresence mode="popLayout">
                  {sortedReplies.map((reply, idx) => {
                    const successRate = getSuccessRate(reply)
                    return (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group"
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3 px-4 pr-20"
                          onClick={() => handleSelectReply(reply)}
                        >
                          <div className="flex-1">
                            <p>{reply.text}</p>
                            {reply.usageCount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {successRate}% success rate • Used {reply.usageCount} times
                              </p>
                            )}
                            {reply.isShared && reply.createdBy !== contractorId && (
                              <Badge variant="secondary" className="mt-1">
                                <Star weight="fill" size={12} className="mr-1" />
                                Shared by {reply.contractorRating ? `${reply.contractorRating}★` : ''} contractor
                              </Badge>
                            )}
                          </div>
                        </Button>
                        {!reply.isShared && reply.createdBy === contractorId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShareReply(reply.id)
                            }}
                          >
                            <Star size={16} />
                          </Button>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Add Custom Reply:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Type your custom reply..."
                value={customReply}
                onChange={(e) => setCustomReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomReply()
                  }
                }}
              />
              <Button onClick={handleAddCustomReply}>
                <Plus size={16} weight="bold" />
              </Button>
            </div>
          </div>

          {sharedReplies.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSharedLibrary(!showSharedLibrary)}
            >
              <Star weight="duotone" className="mr-2" size={16} />
              Browse Shared Reply Library ({sharedReplies.length} available)
            </Button>
          )}
        </CardContent>
      </Card>

      {showSharedLibrary && sharedReplies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star weight="duotone" className="text-primary" size={24} />
              Community Reply Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sharedReplies.map(reply => (
              <Button
                key={reply.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleSelectReply(reply)}
              >
                <div className="flex-1">
                  <p>{reply.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {reply.contractorRating && (
                      <Badge variant="secondary" className="text-xs">
                        {reply.contractorRating}★ contractor
                      </Badge>
                    )}
                    {reply.contractorJobCount && (
                      <Badge variant="secondary" className="text-xs">
                        {reply.contractorJobCount} jobs
                      </Badge>
                    )}
                  </div>
                </div>
                <Check size={16} className="ml-2 text-primary" />
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp weight="duotone" className="text-primary" size={24} />
            Reply Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{replies?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Replies</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {replies?.reduce((sum, r) => sum + r.usageCount, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Times Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sortedReplies.length > 0 ? getSuccessRate(sortedReplies[0]) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Best Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{sharedReplies.length}</p>
              <p className="text-sm text-muted-foreground">Community Replies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
