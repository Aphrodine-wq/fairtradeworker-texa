/**
 * Review Insights Dashboard
 * Shows sentiment analysis, patterns, and actionable insights from reviews
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChartBar,
  TrendUp,
  TrendDown,
  Star,
  Target,
  Lightbulb
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { generateReviewInsights } from "@/lib/reviewSentiment"

interface Review {
  id: string
  contractorId: string
  rating: number
  text: string
  createdAt: string
}

interface ReviewInsightsProps {
  user: User
}

export function ReviewInsights({ user }: ReviewInsightsProps) {
  const [reviews] = useLocalKV<Review[]>("reviews", [])

  const myReviews = useMemo(() => {
    return (reviews || []).filter(r => r.contractorId === user.id)
  }, [reviews, user.id])

  const insights = useMemo(() => {
    return generateReviewInsights(myReviews.map(r => ({ text: r.text, rating: r.rating })))
  }, [myReviews])

  if (myReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar weight="duotone" size={24} />
            Review Insights
          </CardTitle>
          <CardDescription>
            Review insights will appear here once you receive reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star size={48} className="mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Complete jobs to start receiving feedback!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar weight="duotone" size={24} />
            Review Insights
          </CardTitle>
          <CardDescription>
            Patterns and insights from {insights.totalReviews} customer reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold flex items-center gap-2 mt-1">
                {insights.avgRating.toFixed(1)}
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              </p>
            </div>
            <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold mt-1">{insights.totalReviews}</p>
            </div>
            <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
              <p className="text-sm text-muted-foreground">Strengths</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {insights.strengths.length}
              </p>
            </div>
            <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
              <p className="text-sm text-muted-foreground">Improvements</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {insights.improvements.length}
              </p>
            </div>
          </div>

          {/* Top Strengths */}
          {insights.strengths.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.strengths.map((strength, idx) => (
                  <Badge key={idx} variant="outline" className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                    {strength}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                💡 Customers consistently mention these positive aspects of your work
              </p>
            </div>
          )}

          {/* Areas for Improvement */}
          {insights.improvements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Areas for Improvement
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.improvements.map((improvement, idx) => (
                  <Badge key={idx} variant="outline" className="text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700">
                    {improvement}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                💡 Focus on these areas to improve your customer satisfaction
              </p>
            </div>
          )}

          {/* Top Keywords */}
          {insights.topKeywords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Frequently Mentioned Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {insights.topKeywords.slice(0, 10).map((keyword, idx) => (
                  <Badge key={idx} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Insights */}
          {insights.insights.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Pattern Insights
              </h3>
              <div className="space-y-3">
                {insights.insights.slice(0, 5).map((insight, idx) => (
                  <div key={idx} className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {insight.category === 'strength' ? (
                          <TrendUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : insight.category === 'improvement' ? (
                          <TrendDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        ) : null}
                        <span className="font-semibold capitalize">{insight.pattern}</span>
                      </div>
                      <Badge variant={insight.category === 'strength' ? 'default' : 'secondary'}>
                        {insight.frequency} review{insight.frequency !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {insight.examples.length > 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        "{insight.examples[0]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
