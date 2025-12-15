import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkle, Brain, TrendingUp, ChatCircle, Lightbulb, 
  Target, Clock, ArrowRight, Fire, Thermometer, Snowflake
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CRMCustomer, CRMInteraction, AILeadScore, NextBestAction, SentimentAnalysis } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface AIInsightsCRMProps {
  user: User
}

export function AIInsightsCRM({ user }: AIInsightsCRMProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [leadScores, setLeadScores] = useKV<AILeadScore[]>("crm-ai-lead-scores", [])
  const [nextActions, setNextActions] = useKV<NextBestAction[]>("crm-next-actions", [])
  const [sentiments, setSentiments] = useKV<SentimentAnalysis[]>("crm-sentiments", [])

  const myCustomers = (customers || []).filter(c => c.contractorId === user.id)
  const myInteractions = (interactions || []).filter(i => 
    myCustomers.some(c => c.id === i.customerId)
  )

  // Calculate AI lead scores
  useEffect(() => {
    if (myCustomers.length === 0) return

    const newScores: AILeadScore[] = myCustomers.map(customer => {
      const customerInteractions = myInteractions.filter(i => i.customerId === customer.id)
      const recentInteractions = customerInteractions.filter(i => {
        const date = new Date(i.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return date >= thirtyDaysAgo
      })

      // Engagement score (0-25)
      const engagement = Math.min((recentInteractions.length / 10) * 25, 25)
      
      // Value score (0-30)
      let value = 0
      if (customer.lifetimeValue > 10000) value = 30
      else if (customer.lifetimeValue > 5000) value = 25
      else if (customer.lifetimeValue > 1000) value = 20
      else if (customer.lifetimeValue > 0) value = 15
      else value = 5

      // Timing score (0-25)
      const daysSinceContact = customer.lastContact 
        ? Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24))
        : 999
      const timing = daysSinceContact < 7 ? 25 : daysSinceContact < 14 ? 20 : daysSinceContact < 30 ? 15 : 10

      // Behavior score (0-20)
      const positiveOutcomes = customerInteractions.filter(i => i.outcome === 'positive').length
      const behavior = Math.min((positiveOutcomes / customerInteractions.length) * 20, 20) || 10

      const totalScore = engagement + value + timing + behavior
      const prediction = totalScore >= 70 ? 'hot' : totalScore >= 50 ? 'warm' : 'cold'
      const confidence = Math.min(95, 60 + (recentInteractions.length * 5))

      return {
        customerId: customer.id,
        score: Math.round(totalScore),
        factors: {
          engagement: Math.round(engagement),
          value: Math.round(value),
          timing: Math.round(timing),
          behavior: Math.round(behavior)
        },
        prediction,
        confidence: Math.round(confidence),
        updatedAt: new Date().toISOString()
      }
    })

    setLeadScores(newScores)
  }, [myCustomers, myInteractions, setLeadScores])

  // Generate next best actions
  useEffect(() => {
    if (leadScores.length === 0) return

    const newActions: NextBestAction[] = leadScores
      .filter(score => score.prediction === 'hot' || score.prediction === 'warm')
      .map(score => {
        const customer = myCustomers.find(c => c.id === score.customerId)
        if (!customer) return null

        const customerInteractions = myInteractions.filter(i => i.customerId === customer.id)
        const lastInteraction = customerInteractions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]

        const daysSinceContact = customer.lastContact 
          ? Math.floor((Date.now() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        let action: NextBestAction['action'] = 'follow-up'
        let reason = ''
        let priority: 'high' | 'medium' | 'low' = 'medium'

        if (daysSinceContact > 14) {
          action = 'call'
          reason = 'No contact in over 2 weeks - high risk of churn'
          priority = 'high'
        } else if (customer.status === 'lead' && customer.lifetimeValue === 0) {
          action = 'quote'
          reason = 'Hot lead ready for quote'
          priority = score.prediction === 'hot' ? 'high' : 'medium'
        } else if (customer.status === 'active' && lastInteraction?.outcome === 'positive') {
          action = 'meeting'
          reason = 'Positive momentum - schedule follow-up meeting'
          priority = 'high'
        } else {
          action = 'email'
          reason = 'Maintain engagement with personalized email'
          priority = 'medium'
        }

        return {
          id: `nba-${customer.id}-${Date.now()}`,
          customerId: customer.id,
          action,
          priority,
          reason,
          estimatedValue: customer.lifetimeValue || 1000,
          aiConfidence: score.confidence,
          createdAt: new Date().toISOString()
        }
      })
      .filter((action): action is NextBestAction => action !== null)
      .slice(0, 10)

    setNextActions(newActions)
  }, [leadScores, myCustomers, myInteractions, setNextActions])

  // Analyze sentiment
  useEffect(() => {
    if (myInteractions.length === 0) return

    const newSentiments: SentimentAnalysis[] = myInteractions
      .filter(i => i.description && i.description.length > 10)
      .map(interaction => {
        const text = (interaction.description || '').toLowerCase()
        
        // Simple sentiment analysis
        const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'happy', 'satisfied', 'thank', 'pleased']
        const negativeWords = ['bad', 'terrible', 'disappointed', 'unhappy', 'problem', 'issue', 'wrong', 'late', 'poor']
        
        let positiveCount = 0
        let negativeCount = 0
        
        positiveWords.forEach(word => {
          if (text.includes(word)) positiveCount++
        })
        
        negativeWords.forEach(word => {
          if (text.includes(word)) negativeCount++
        })

        const score = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1)
        const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
        
        const keywords = [...positiveWords, ...negativeWords].filter(word => text.includes(word))
        const topics = ['pricing', 'quality', 'timeline', 'communication'].filter(topic => text.includes(topic))
        
        const urgency = negativeCount > positiveCount ? 'high' : positiveCount > 2 ? 'medium' : 'low'

        return {
          interactionId: interaction.id,
          sentiment,
          score: Math.max(-1, Math.min(1, score)),
          keywords,
          topics,
          urgency,
          analyzedAt: new Date().toISOString()
        }
      })

    setSentiments(newSentiments)
  }, [myInteractions, setSentiments])

  const hotLeads = useMemo(() => {
    return leadScores
      .filter(s => s.prediction === 'hot')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [leadScores])

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500'
    if (score >= 50) return 'text-orange-500'
    return 'text-blue-500'
  }

  const getScoreIcon = (prediction: string) => {
    switch (prediction) {
      case 'hot': return <Fire weight="fill" size={20} className="text-red-500" />
      case 'warm': return <Thermometer weight="fill" size={20} className="text-orange-500" />
      default: return <Snowflake weight="fill" size={20} className="text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Brain weight="duotone" size={28} className="text-black dark:text-white" />
            AI Insights & Predictions
          </h2>
          <p className="text-muted-foreground mt-1">
            Predictive lead scoring, next-best actions, and sentiment analysis powered by AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">Lead Scores</TabsTrigger>
          <TabsTrigger value="actions">Next Actions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Hot Leads</span>
                  <Fire weight="fill" size={20} className="text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {leadScores.filter(s => s.prediction === 'hot').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Warm Leads</span>
                  <Thermometer weight="fill" size={20} className="text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-500">
                  {leadScores.filter(s => s.prediction === 'warm').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <TrendingUp weight="fill" size={20} className="text-black dark:text-white" />
                </div>
                <div className="text-3xl font-bold text-black dark:text-white">
                  {leadScores.length > 0 
                    ? Math.round(leadScores.reduce((sum, s) => sum + s.score, 0) / leadScores.length)
                    : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-black dark:text-white">Top Hot Leads</h3>
            {hotLeads.length === 0 ? (
              <Card className="p-8 text-center border border-black/20 dark:border-white/20">
                <p className="text-muted-foreground">No hot leads at this time</p>
              </Card>
            ) : (
              hotLeads.map(score => {
                const customer = myCustomers.find(c => c.id === score.customerId)
                if (!customer) return null

                return (
                  <Card key={score.customerId} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getScoreIcon(score.prediction)}
                            <div>
                              <h4 className="font-semibold text-black dark:text-white">{customer.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {customer.status} • ${customer.lifetimeValue.toLocaleString()} LTV
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Overall Score</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                                  {score.score}/100
                                </span>
                                <Badge variant="outline" className={score.prediction === 'hot' ? 'border-red-500 text-red-500' : ''}>
                                  {score.prediction.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            <Progress value={score.score} className="h-2" />
                            
                            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Engagement</span>
                                <div className="font-semibold">{score.factors.engagement}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Value</span>
                                <div className="font-semibold">{score.factors.value}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Timing</span>
                                <div className="font-semibold">{score.factors.timing}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Behavior</span>
                                <div className="font-semibold">{score.factors.behavior}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                          <div className="text-lg font-semibold text-black dark:text-white">
                            {score.confidence}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4 mt-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-black dark:text-white">AI Recommended Actions</h3>
            {nextActions.length === 0 ? (
              <Card className="p-8 text-center border border-black/20 dark:border-white/20">
                <Lightbulb size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                <p className="text-muted-foreground">No recommended actions at this time</p>
              </Card>
            ) : (
              nextActions.map(action => {
                const customer = myCustomers.find(c => c.id === action.customerId)
                if (!customer) return null

                const actionIcons = {
                  'call': '📞',
                  'email': '✉️',
                  'meeting': '📅',
                  'quote': '💰',
                  'follow-up': '🔄',
                  'nurture': '🌱'
                }

                return (
                  <Card key={action.id} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{actionIcons[action.action]}</span>
                            <div>
                              <h4 className="font-semibold text-black dark:text-white">{customer.name}</h4>
                              <p className="text-sm text-muted-foreground">{action.reason}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <Badge 
                              variant={action.priority === 'high' ? 'default' : 'outline'}
                              className={action.priority === 'high' ? 'bg-red-500' : ''}
                            >
                              {action.priority} priority
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Est. Value: ${action.estimatedValue.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Confidence: {action.aiConfidence}%
                            </span>
                          </div>
                        </div>
                        
                        <Button size="sm" className="ml-4">
                          <ArrowRight size={16} className="mr-2" />
                          Take Action
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Positive</span>
                  <span className="text-2xl">😊</span>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {sentiments.filter(s => s.sentiment === 'positive').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Neutral</span>
                  <span className="text-2xl">😐</span>
                </div>
                <div className="text-3xl font-bold text-gray-500">
                  {sentiments.filter(s => s.sentiment === 'neutral').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Negative</span>
                  <span className="text-2xl">😞</span>
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {sentiments.filter(s => s.sentiment === 'negative').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-black dark:text-white">Recent Sentiment Analysis</h3>
            {sentiments.slice(0, 10).map(sentiment => {
              const interaction = myInteractions.find(i => i.id === sentiment.interactionId)
              if (!interaction) return null
              const customer = myCustomers.find(c => c.id === interaction.customerId)

              return (
                <Card key={sentiment.interactionId} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {sentiment.sentiment === 'positive' ? '😊' : sentiment.sentiment === 'negative' ? '😞' : '😐'}
                          </span>
                          <span className="font-semibold text-black dark:text-white">
                            {customer?.name || 'Unknown'}
                          </span>
                          <Badge variant="outline" className={sentiment.urgency === 'high' ? 'border-red-500' : ''}>
                            {sentiment.urgency} urgency
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{interaction.title}</p>
                        {sentiment.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sentiment.keywords.slice(0, 5).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-black dark:text-white">
                          {(sentiment.score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
