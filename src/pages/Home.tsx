import { House, Hammer, MapTrifold } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useKV } from "@github/spark/hooks"
import type { Job } from "@/lib/types"

interface HomePageProps {
  onNavigate: (page: string, role?: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const todayJobs = (jobs || []).filter(job => {
    const jobDate = new Date(job.createdAt)
    const today = new Date()
    return jobDate.toDateString() === today.toDateString()
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Zero-fee Texas home repairs.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              AI scopes in 60 seconds. Contractors keep 100%.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => onNavigate('signup', 'homeowner')}
            >
              <House weight="fill" className="mr-3" size={24} />
              I'm a Homeowner
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-2"
              onClick={() => onNavigate('signup', 'contractor')}
            >
              <Hammer weight="fill" className="mr-3" size={24} />
              I'm a Contractor
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-2"
              onClick={() => onNavigate('signup', 'operator')}
            >
              <MapTrifold weight="fill" className="mr-3" size={24} />
              I'm an Operator
            </Button>
          </div>

          <Card className="mt-12 p-6 bg-accent/10 border-accent/20">
            <p className="text-2xl md:text-3xl font-bold">
              Jobs posted today: <span className="text-accent">{todayJobs.length}</span>
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-muted py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <House weight="fill" className="text-primary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Post Your Job</h3>
              <p className="text-muted-foreground">
                Upload a video, voice note, or photos. Our AI analyzes your project and provides an instant scope and price estimate.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Hammer weight="fill" className="text-secondary-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Get Bids</h3>
              <p className="text-muted-foreground">
                Licensed contractors in your area review your job and submit competitive bids. You choose who to hire.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <MapTrifold weight="fill" className="text-accent-foreground" size={24} />
              </div>
              <h3 className="text-xl font-semibold">Zero Fees</h3>
              <p className="text-muted-foreground">
                Contractors keep 100% of what you pay. No hidden fees, no commissions. Fair trade for everyone.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
