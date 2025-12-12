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
      color: "from-blue-500/10 to-purple-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500"
    },
    {
      id: "warranty-tracker",
      name: "Warranty Tracker",
      description: "Never lose track of warranties you've given",
      icon: ShieldCheck,
      color: "from-green-500/10 to-blue-500/10",
      borderColor: "border-green-500/20",
      iconBg: "bg-green-500"
    },
    {
      id: "quick-notes",
      name: "Quick Notes",
      description: "Capture job details and customer info on the go",
      icon: Note,
      color: "from-purple-500/10 to-blue-500/10",
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
      color: "from-pink-500/10 to-primary/10",
      borderColor: "border-pink-500/20",
      iconBg: "bg-pink-500"
    },
    {
      id: "quick-notes",
      name: "Quick Notes",
      description: "Keep track of important project information",
      icon: Note,
      color: "from-purple-500/10 to-blue-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500"
    }
  ]

  const tools = user.role === 'contractor' ? contractorTools : homeownerTools

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkle weight="fill" className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Free Tools</h2>
            <p className="text-sm text-muted-foreground">
              Powerful features at zero cost, forever
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card 
                key={tool.id}
                className={`p-6 bg-gradient-to-br ${tool.color} ${tool.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => onToolSelect(tool.id)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4`}>
                    <Icon weight="fill" className="text-white" size={24} />
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {tool.description}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToolSelect(tool.id)
                    }}
                  >
                    Open Tool
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>💡 100% Free Forever:</strong> These tools cost you nothing and help you work smarter. 
            No hidden fees, no trials, no upgrades required. We believe everyone deserves great tools.
          </p>
        </Card>
      </div>
    </div>
  )
}
