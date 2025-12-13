import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator,
  ShieldCheck,
  Heart,
  Note,
  Sparkle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface FreeToolsHubProps {
  user: User
  onToolSelect: (tool: string) => void
}

export function FreeToolsHub({ user, onToolSelect }: FreeToolsHubProps) {
  const contractorTools = [
    {
      id: "cost-calculator",
      name: "Job Cost Calculator",
      description: "Calculate profit margins and hourly rates instantly",
      icon: Calculator,
      color: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500"
    },
    {
      id: "warranty-tracker",
      name: "Warranty Tracker",
      description: "Never lose track of warranties you've given",
      icon: ShieldCheck,
      color: "bg-green-500/10",
      borderColor: "border-green-500/20",
      iconBg: "bg-green-500"
    },
    {
      id: "quick-notes",
      name: "Quick Notes",
      description: "Capture job details and customer info on the go",
      icon: Note,
      color: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500"
    }
  ]

  const homeownerTools = [
    {
      id: "saved-contractors",
      name: "Saved Contractors",
      description: "Quick access to your trusted contractors",
      icon: Heart,
      color: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      iconBg: "bg-pink-500"
    },
    {
      id: "quick-notes",
      name: "Quick Notes",
      description: "Keep track of important project information",
      icon: Note,
      color: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500"
    }
  ]

  const tools = user.role === 'contractor' ? contractorTools : homeownerTools

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Sparkle weight="fill" className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Free Tools</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional-grade tools at zero cost. Built to help you work smarter, faster, and more efficiently.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card 
              key={tool.id}
              className={`group p-8 ${tool.color} ${tool.borderColor} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 dark:bg-transparent dark:border-white/10 dark:hover:border-white/20`}
              onClick={() => onToolSelect(tool.id)}
            >
              <div className="flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl ${tool.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon weight="fill" className="text-white" size={32} />
                </div>
                
                <h3 className="font-bold text-xl mb-3 dark:text-white">{tool.name}</h3>
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed dark:text-white/80">
                  {tool.description}
                </p>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full font-semibold dark:bg-transparent dark:text-white dark:border-white/20 dark:hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToolSelect(tool.id)
                  }}
                >
                  Open Tool →
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="max-w-4xl mx-auto mt-8 p-6 bg-primary/5 border-primary/20 dark:bg-transparent dark:border-white/10">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-2 dark:text-white">100% Free Forever</h3>
            <p className="text-sm text-muted-foreground leading-relaxed dark:text-white/80">
              These tools cost you nothing and help you work smarter. No hidden fees, no trials, no upgrades required. 
              We believe everyone deserves access to professional-grade tools.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
