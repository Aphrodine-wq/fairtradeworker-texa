/**
 * Review Sentiment Analysis
 * Analyzes review text for keywords, patterns, and insights
 */

export interface ReviewSentiment {
  overall: 'positive' | 'negative' | 'neutral'
  score: number // 0-100
  keywords: string[]
  themes: string[]
  strength: string[] // Positive themes mentioned
  improvement: string[] // Areas for improvement
}

export interface ReviewInsight {
  pattern: string
  frequency: number
  examples: string[]
  category: 'strength' | 'improvement' | 'neutral'
}

/**
 * Analyze review text for sentiment and extract keywords
 */
export function analyzeReviewSentiment(reviewText: string, rating: number): ReviewSentiment {
  const text = reviewText.toLowerCase()
  
  // Positive keywords
  const positiveKeywords = [
    'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'fantastic',
    'professional', 'on time', 'punctual', 'clean', 'neat', 'tidy',
    'responsive', 'quick', 'fast', 'efficient', 'quality', 'high quality',
    'recommend', 'hire again', 'satisfied', 'happy', 'pleased', 'love',
    'skilled', 'experienced', 'knowledgeable', 'helpful', 'friendly',
    'affordable', 'fair price', 'good value', 'worth it', 'worth every penny'
  ]
  
  // Negative keywords
  const negativeKeywords = [
    'poor', 'bad', 'terrible', 'awful', 'disappointing', 'unprofessional',
    'late', 'delayed', 'slow', 'rushed', 'messy', 'dirty', 'sloppy',
    'expensive', 'overpriced', 'rip off', 'waste', 'regret',
    'unresponsive', 'hard to reach', 'no show', 'didn\'t show',
    'incomplete', 'unfinished', 'broken', 'damaged', 'wrong',
    'rude', 'impolite', 'unfriendly', 'argued', 'confrontational'
  ]
  
  // Theme keywords by category
  const themeKeywords = {
    punctuality: ['on time', 'punctual', 'prompt', 'late', 'delayed', 'early'],
    quality: ['quality', 'professional', 'skilled', 'expert', 'amateur', 'sloppy'],
    communication: ['responsive', 'communicative', 'clear', 'unresponsive', 'hard to reach'],
    cleanliness: ['clean', 'neat', 'tidy', 'messy', 'dirty', 'sloppy'],
    pricing: ['affordable', 'fair', 'expensive', 'overpriced', 'worth it'],
    attitude: ['friendly', 'helpful', 'polite', 'rude', 'unprofessional']
  }
  
  // Count keywords
  const positiveCount = positiveKeywords.filter(kw => text.includes(kw)).length
  const negativeCount = negativeKeywords.filter(kw => text.includes(kw)).length
  
  // Extract found keywords
  const foundKeywords: string[] = []
  const allKeywords = [...positiveKeywords, ...negativeKeywords]
  allKeywords.forEach(kw => {
    if (text.includes(kw)) {
      foundKeywords.push(kw)
    }
  })
  
  // Detect themes
  const themes: string[] = []
  const strengths: string[] = []
  const improvements: string[] = []
  
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const matches = keywords.filter(kw => text.includes(kw))
    if (matches.length > 0) {
      themes.push(theme)
      
      // Classify as strength or improvement based on keyword sentiment
      const hasPositive = matches.some(kw => 
        positiveKeywords.includes(kw) || 
        (theme === 'punctuality' && (kw === 'on time' || kw === 'punctual' || kw === 'prompt'))
      )
      const hasNegative = matches.some(kw => negativeKeywords.includes(kw))
      
      if (hasPositive && !hasNegative) {
        strengths.push(theme)
      } else if (hasNegative) {
        improvements.push(theme)
      }
    }
  })
  
  // Calculate sentiment score
  // Base score from rating (1-5 stars = 20-100 points)
  let score = rating * 20
  
  // Adjust based on keyword sentiment
  if (positiveCount > negativeCount) {
    score += Math.min(positiveCount * 2, 20)
  } else if (negativeCount > positiveCount) {
    score -= Math.min(negativeCount * 3, 30)
  }
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))
  
  // Determine overall sentiment
  let overall: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (score >= 70) overall = 'positive'
  else if (score <= 40) overall = 'negative'
  else if (rating >= 4 && positiveCount > negativeCount) overall = 'positive'
  else if (rating <= 2 || negativeCount > positiveCount) overall = 'negative'
  
  return {
    overall,
    score,
    keywords: foundKeywords.slice(0, 10), // Limit to top 10
    themes,
    strength: strengths,
    improvement: improvements
  }
}

/**
 * Analyze multiple reviews to find patterns
 */
export function analyzeReviewPatterns(reviews: Array<{ text: string; rating: number }>): ReviewInsight[] {
  if (reviews.length === 0) return []
  
  const insights: ReviewInsight[] = []
  const patternCounts: Map<string, { count: number; examples: string[]; category: 'strength' | 'improvement' | 'neutral' }> = new Map()
  
  // Common patterns to look for
  const patterns = {
    'on time': { category: 'strength' as const, keywords: ['on time', 'punctual', 'prompt', 'early'] },
    'quality work': { category: 'strength' as const, keywords: ['quality', 'professional', 'skilled', 'expert'] },
    'communication': { category: 'strength' as const, keywords: ['responsive', 'communicative', 'clear', 'kept me informed'] },
    'clean': { category: 'strength' as const, keywords: ['clean', 'neat', 'tidy', 'left clean'] },
    'pricing': { category: 'neutral' as const, keywords: ['affordable', 'fair price', 'expensive', 'overpriced'] },
    'late': { category: 'improvement' as const, keywords: ['late', 'delayed', 'didn\'t show', 'no show'] },
    'messy': { category: 'improvement' as const, keywords: ['messy', 'dirty', 'sloppy', 'left a mess'] },
    'unresponsive': { category: 'improvement' as const, keywords: ['unresponsive', 'hard to reach', 'didn\'t return calls'] }
  }
  
  reviews.forEach(review => {
    const text = review.text.toLowerCase()
    
    Object.entries(patterns).forEach(([patternName, { category, keywords }]) => {
      const matched = keywords.some(kw => text.includes(kw))
      if (matched) {
        const current = patternCounts.get(patternName) || { count: 0, examples: [], category }
        current.count++
        if (current.examples.length < 3) {
          // Extract relevant sentence
          const sentences = review.text.split(/[.!?]+/)
          const relevantSentence = sentences.find(s => 
            keywords.some(kw => s.toLowerCase().includes(kw))
          )
          if (relevantSentence && !current.examples.includes(relevantSentence.trim())) {
            current.examples.push(relevantSentence.trim().substring(0, 100))
          }
        }
        patternCounts.set(patternName, current)
      }
    })
  })
  
  // Convert to insights
  patternCounts.forEach((data, pattern) => {
    insights.push({
      pattern,
      frequency: data.count,
      examples: data.examples,
      category: data.category
    })
  })
  
  // Sort by frequency
  return insights.sort((a, b) => b.frequency - a.frequency)
}

/**
 * Generate review insights summary
 */
export function generateReviewInsights(reviews: Array<{ text: string; rating: number }>): {
  avgRating: number
  totalReviews: number
  strengths: string[]
  improvements: string[]
  topKeywords: string[]
  insights: ReviewInsight[]
} {
  if (reviews.length === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      strengths: [],
      improvements: [],
      topKeywords: [],
      insights: []
    }
  }
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const patterns = analyzeReviewPatterns(reviews)
  
  const allKeywords: Map<string, number> = new Map()
  const strengths: string[] = []
  const improvements: string[] = []
  
  reviews.forEach(review => {
    const sentiment = analyzeReviewSentiment(review.text, review.rating)
    sentiment.keywords.forEach(kw => {
      allKeywords.set(kw, (allKeywords.get(kw) || 0) + 1)
    })
    strengths.push(...sentiment.strength)
    improvements.push(...sentiment.improvement)
  })
  
  // Get unique strengths and improvements
  const uniqueStrengths = Array.from(new Set(strengths))
  const uniqueImprovements = Array.from(new Set(improvements))
  
  // Top keywords by frequency
  const topKeywords = Array.from(allKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([kw]) => kw)
  
  return {
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
    strengths: uniqueStrengths.slice(0, 5),
    improvements: uniqueImprovements.slice(0, 5),
    topKeywords,
    insights: patterns.slice(0, 8)
  }
}
