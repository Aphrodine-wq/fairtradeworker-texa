import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User } from "@phosphor-icons/react"
import { containerVariants, itemVariants } from "@/lib/animations"

interface BlogProps {
  onNavigate?: (page: string) => void
}

export function BlogPage({ onNavigate }: BlogProps) {
  const blogPosts = [
    {
      id: 'getting-started',
      title: 'Getting Started as a Contractor on FairTradeWorker',
      excerpt: 'Learn how to set up your profile, start bidding on jobs, and grow your business with zero platform fees.',
      author: 'FairTradeWorker Team',
      date: '2024-12-15',
      readTime: '5 min read',
      category: 'For Contractors',
    },
    {
      id: 'ai-scoping',
      title: 'How AI Scoping Works: From Photos to Price Estimates',
      excerpt: 'Discover how our AI analyzes your project photos and provides accurate scope and pricing in seconds.',
      author: 'FairTradeWorker Team',
      date: '2024-12-10',
      readTime: '7 min read',
      category: 'Platform Features',
    },
    {
      id: 'zero-fees',
      title: 'Why We Charge Zero Platform Fees',
      excerpt: 'Our commitment to fair trade means contractors keep 100% of their earnings. Here\'s how we make it work.',
      author: 'FairTradeWorker Team',
      date: '2024-12-05',
      readTime: '4 min read',
      category: 'Company',
    },
    {
      id: 'homeowner-guide',
      title: 'A Homeowner\'s Guide to Posting Jobs',
      excerpt: 'Everything you need to know about posting your project, reviewing bids, and hiring the right contractor.',
      author: 'FairTradeWorker Team',
      date: '2024-11-28',
      readTime: '6 min read',
      category: 'For Homeowners',
    },
  ]

  const categories = ['All Posts', 'For Contractors', 'For Homeowners', 'Platform Features', 'Company']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-8"
        >
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            FairTradeWorker Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Tips, guides, and updates from the FairTradeWorker team. Learn how to get the most out of our platform.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className="border-0 glass-card bg-white/90 dark:bg-black/90 backdrop-blur-sm hover:shadow-lg"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Blog Posts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass-card border-0 hover:shadow-xl transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/10 dark:bg-white/10 text-black dark:text-white">
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-0 glass-card bg-white/90 dark:bg-black/90 backdrop-blur-sm"
                    onClick={() => {
                      // In a real app, this would navigate to the full blog post
                      alert(`Blog post "${post.title}" - Coming soon!`)
                    }}
                  >
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter Signup */}
        <Card className="glass-card border-0 p-8 text-center">
          <CardContent>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get the latest tips, platform updates, and contractor success stories delivered to your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-black dark:text-white"
              />
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
