import { Card } from "@/components/ui/card"
import { House, Hammer, MapTrifold, Heart, Zap, Shield } from "@phosphor-icons/react"

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About FairTradeWorker
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A zero-fee marketplace connecting homeowners with skilled contractors. 
            Fair prices, transparent bidding, and contractors keep 100% of what they earn.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="p-8 bg-accent/10 border-accent/20">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              FairTradeWorker was built to eliminate unfair marketplace fees and create a level playing field 
              for home service professionals. We believe contractors deserve to keep every dollar they earn, 
              and homeowners deserve transparent pricing without hidden costs.
            </p>
          </div>
        </Card>

        {/* Core Values */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Heart weight="fill" className="text-primary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Free Job Posting</h3>
              <p className="text-muted-foreground">
                Homeowners can post jobs without paying a single cent. Get your project scoped by AI 
                and receive competitive bids from qualified contractors.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Hammer weight="fill" className="text-secondary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Free Job Bidding</h3>
              <p className="text-muted-foreground">
                Contractors bid on jobs for free. No subscription fees, no per-lead charges, 
                no hidden costs. Your skills speak for themselves.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Shield weight="fill" className="text-accent-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Open Marketplace</h3>
              <p className="text-muted-foreground">
                No paywalls, no gatekeeping. All jobs are visible to relevant contractors 
                based on their skills and location. Compete fairly on quality and price.
              </p>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <House weight="fill" className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-center">1. Post Your Job</h3>
              <p className="text-muted-foreground text-center">
                Upload video, photos, or describe your project. Our AI provides an instant scope 
                and price estimate in 60 seconds.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
                <Hammer weight="fill" className="text-secondary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-center">2. Review Bids</h3>
              <p className="text-muted-foreground text-center">
                Licensed contractors review your job and submit competitive bids. Compare prices, 
                ratings, and portfolios.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <Zap weight="fill" className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-center">3. Hire & Pay</h3>
              <p className="text-muted-foreground text-center">
                Choose your contractor and pay directly. Zero platform fees means fair prices 
                for homeowners and full earnings for contractors.
              </p>
            </div>
          </div>
        </div>

        {/* User Types */}
        <Card className="p-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Who Uses FairTradeWorker?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <House weight="fill" className="text-primary" size={28} />
                  <h3 className="text-xl font-semibold">Homeowners</h3>
                </div>
                <p className="text-muted-foreground">
                  Post jobs ranging from small repairs to major renovations. Get instant AI scoping, 
                  receive multiple bids, and hire with confidence.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hammer weight="fill" className="text-secondary" size={28} />
                  <h3 className="text-xl font-semibold">Contractors</h3>
                </div>
                <p className="text-muted-foreground">
                  Access a free CRM, submit unlimited bids, manage invoices, and grow your business 
                  without paying platform fees. Keep 100% of your earnings.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapTrifold weight="fill" className="text-accent" size={28} />
                  <h3 className="text-xl font-semibold">Operators</h3>
                </div>
                <p className="text-muted-foreground">
                  Claim territories and track marketplace performance. Monitor job-to-bid times, 
                  conversion rates, and help grow the platform in your area.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technology */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Built with Modern Technology</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            FairTradeWorker uses AI-powered scoping to analyze videos, photos, and voice notes. 
            Our platform provides instant project estimates, intelligent bid sorting based on 
            contractor performance, and real-time metrics tracking for optimal marketplace efficiency.
          </p>
        </div>

        {/* Performance Metrics */}
        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Performance = Priority</h2>
            <p className="text-muted-foreground text-center">
              Bids are sorted by contractor performance score, bid accuracy, and completion rate. 
              High-performing contractors rise to the top, ensuring homeowners see the best options first.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
