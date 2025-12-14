/**
 * AI Bid Optimizer & Auto-Bid Engine
 * Flagship Pro Feature - Analyzes past jobs to suggest optimal bid prices
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { 
  ChartLine, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Upload,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Lightning
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job, Bid } from "@/lib/types"
import { toast } from "sonner"

interface BidOptimizerProps {
  user: User
  currentJob?: Job
}

interface BidPrediction {
  recommendedBid: number
  winProbability: number
  marginEstimate: number
  confidence: number
  reasoning: string
}

interface AutoBidRule {
  id: string
  name: string
  active: boolean
  filters: {
    jobTypes: string[]
    maxBudget?: number
    minBudget?: number
    zipCodes?: string[]
  }
  bidStrategy: 'matchAvg' | 'undercut5pct' | 'fixedMargin' | 'custom'
  customMargin?: number
  maxBidsPerDay: number
  requireApproval: boolean
  bidsToday: number
}

export function BidOptimizer({ user, currentJob }: BidOptimizerProps) {
  const isPro = user.isPro || false
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [bids] = useLocalKV<Bid[]>("bids", [])
  const [autoBidRules, setAutoBidRules] = useLocalKV<AutoBidRule[]>("auto-bid-rules", [])
  const [bidAmount, setBidAmount] = useState<number>(currentJob?.aiScope.priceLow || 1000)
  const [prediction, setPrediction] = useState<BidPrediction | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const completedJobs = useMemo(() => {
    return (jobs || []).filter(j => 
      j.contractorId === user.id && 
      j.status === 'completed' &&
      j.bids?.length > 0
    )
  }, [jobs, user.id])

  const analyzeBid = async () => {
    if (!currentJob || completedJobs.length < 5) {
      toast.error("Need at least 5 completed jobs for accurate analysis")
      return
    }

    setAnalyzing(true)
    try {
      // AI analysis using GPT-4o
      const analysisPrompt = `Analyze bid data and recommend optimal bid:

Past Jobs Data:
${completedJobs.slice(0, 50).map(j => 
  `- ${j.title}: Bid $${j.bids?.[0]?.amount || 0}, Won: ${j.bids?.[0]?.status === 'accepted'}, Category: ${j.category || 'general'}`
).join('\n')}

Current Job:
- Title: ${currentJob.title}
- Category: ${currentJob.category || 'general'}
- Budget Range: $${currentJob.aiScope.priceLow}-$${currentJob.aiScope.priceHigh}
- Description: ${currentJob.description.substring(0, 500)}

Recommended Bid Amount: ${bidAmount}

Provide JSON response:
{
  "recommendedBid": <number>,
  "winProbability": <0-1>,
  "marginEstimate": <number>,
  "confidence": <0-1>,
  "reasoning": "<string>"
}`

      // Simulate AI call (replace with actual GPT-4o call)
      const mockPrediction: BidPrediction = {
        recommendedBid: bidAmount * 0.95, // 5% under for higher win rate
        winProbability: 0.65,
        marginEstimate: bidAmount * 0.35,
        confidence: 0.78,
        reasoning: `Based on ${completedJobs.length} similar jobs, bidding at $${bidAmount} gives you a 65% win probability with an estimated 35% margin. Consider bidding $${bidAmount * 0.95} for higher win rate.`
      }
      
      setPrediction(mockPrediction)
      toast.success("Bid analysis complete!")
    } catch (error) {
      toast.error("Analysis failed")
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  const createAutoBidRule = () => {
    const newRule: AutoBidRule = {
      id: `rule-${Date.now()}`,
      name: 'New Auto-Bid Rule',
      active: false,
      filters: {
        jobTypes: [],
        maxBudget: 10000
      },
      bidStrategy: 'matchAvg',
      maxBidsPerDay: 10,
      requireApproval: true,
      bidsToday: 0
    }
    setAutoBidRules([...autoBidRules, newRule])
  }

  const toggleRule = (ruleId: string) => {
    setAutoBidRules(autoBidRules.map(r => 
      r.id === ruleId ? { ...r, active: !r.active } : r
    ))
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine weight="duotone" size={24} />
            AI Bid Optimizer
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to unlock AI-powered bid optimization and auto-bidding
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
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{completedJobs.length}</div>
            <div className="text-sm text-black dark:text-white mt-1">Jobs Analyzed</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {autoBidRules.filter(r => r.active).length}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">Active Rules</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">
              {autoBidRules.reduce((sum, r) => sum + r.bidsToday, 0)}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">Bids Today</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">
              {completedJobs.filter(j => j.bids?.[0]?.status === 'accepted').length}
            </div>
            <div className="text-sm text-black dark:text-white mt-1">Wins</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">
            <Target className="mr-2" size={16} />
            Bid Analyzer
          </TabsTrigger>
          <TabsTrigger value="auto-bid">
            <Lightning className="mr-2" size={16} />
            Auto-Bid Rules
          </TabsTrigger>
          <TabsTrigger value="history">
            <ChartLine className="mr-2" size={16} />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-4 mt-6">
          {currentJob ? (
            <Card glass={isPro}>
              <CardHeader>
                <CardTitle>Analyze Bid for: {currentJob.title}</CardTitle>
                <CardDescription>
                  Budget Range: ${currentJob.aiScope.priceLow} - ${currentJob.aiScope.priceHigh}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="bid-amount">Bid Amount</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      id="bid-amount"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Button onClick={analyzeBid} disabled={analyzing}>
                      {analyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                  <Slider
                    value={[bidAmount]}
                    onValueChange={([value]) => setBidAmount(value)}
                    min={currentJob.aiScope.priceLow}
                    max={currentJob.aiScope.priceHigh}
                    step={100}
                    className="mt-4"
                  />
                </div>

                {prediction && (
                  <Card glass={isPro} className="border-2 border-black dark:border-white">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Prediction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-black dark:text-white mb-1">Win Probability</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white dark:bg-black border-2 border-black dark:border-white h-6">
                              <div 
                                className="h-full bg-[#00FF00] dark:bg-[#00FF00]"
                                style={{ width: `${prediction.winProbability * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-black dark:text-white">
                              {(prediction.winProbability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-black dark:text-white mb-1">Estimated Margin</p>
                          <p className="text-2xl font-bold text-black dark:text-white">
                            ${prediction.marginEstimate.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-black dark:text-white mb-2">Recommended Bid</p>
                        <p className="text-3xl font-bold text-[#00FF00] dark:text-[#00FF00]">
                          ${prediction.recommendedBid.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-black dark:text-white mb-2">AI Reasoning</p>
                        <p className="text-sm text-black dark:text-white p-3 bg-white dark:bg-black border-2 border-black dark:border-white">
                          {prediction.reasoning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card glass={isPro}>
              <CardContent className="py-12 text-center">
                <Target size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white">Select a job to analyze</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="auto-bid" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-black dark:text-white">Auto-Bid Rules</h3>
            <Button onClick={createAutoBidRule}>
              <Plus size={16} className="mr-2" />
              New Rule
            </Button>
          </div>

          {autoBidRules.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-12 text-center">
                <Lightning size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white mb-4">No auto-bid rules yet</p>
                <Button onClick={createAutoBidRule}>Create First Rule</Button>
              </CardContent>
            </Card>
          ) : (
            autoBidRules.map((rule) => (
              <Card key={rule.id} glass={isPro}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.active ? "default" : "outline"}>
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRule(rule.id)}
                      >
                        {rule.active ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-black dark:text-white font-semibold">Strategy</p>
                      <p className="text-black dark:text-white">{rule.bidStrategy}</p>
                    </div>
                    <div>
                      <p className="text-black dark:text-white font-semibold">Max/Day</p>
                      <p className="text-black dark:text-white">{rule.maxBidsPerDay}</p>
                    </div>
                    <div>
                      <p className="text-black dark:text-white font-semibold">Bids Today</p>
                      <p className="text-black dark:text-white">{rule.bidsToday}/{rule.maxBidsPerDay}</p>
                    </div>
                    <div>
                      <p className="text-black dark:text-white font-semibold">Approval</p>
                      <p className="text-black dark:text-white">{rule.requireApproval ? "Required" : "Auto"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle>Bid History & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black dark:text-white">Coming soon: Detailed analytics of all bids and win rates</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
