import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MagnifyingGlass, 
  Play, 
  FileText, 
  Question, 
  ChatCircle,
  BookOpen,
  Video
} from '@phosphor-icons/react'
import { BackButton } from '@/components/ui/BackButton'

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  views: number
  helpful: number
}

interface HelpCenterProps {
  onNavigate: (page: string) => void
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'How to post a job',
    content: 'Learn how to post a job on the platform...',
    category: 'Getting Started',
    tags: ['jobs', 'posting', 'homeowner'],
    views: 1250,
    helpful: 89
  },
  {
    id: '2',
    title: 'How to bid on jobs',
    content: 'Learn how to bid on jobs as a contractor...',
    category: 'Contractor',
    tags: ['bidding', 'contractor'],
    views: 980,
    helpful: 76
  },
  {
    id: '3',
    title: 'Payment processing',
    content: 'Understanding payment processing and fees...',
    category: 'Payments',
    tags: ['payment', 'fees'],
    views: 750,
    helpful: 62
  }
]

const categories = ['All', 'Getting Started', 'Contractor', 'Homeowner', 'Payments', 'Account']

export function HelpCenter({ onNavigate }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <BackButton onNavigate={onNavigate} defaultPage="home" />
            <h1 className="text-4xl font-bold mt-4 mb-2">Help Center</h1>
            <p className="text-muted-foreground">Find answers and learn how to use the platform</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Popular Articles */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map(article => (
              <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.views} views</span>
                    <span>{article.helpful} found helpful</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Video size={32} className="text-primary" />
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Watch step-by-step video guides</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Question size={32} className="text-primary" />
                <CardTitle className="text-lg">FAQ</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Frequently asked questions</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <ChatCircle size={32} className="text-primary" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Get help from our support team</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
