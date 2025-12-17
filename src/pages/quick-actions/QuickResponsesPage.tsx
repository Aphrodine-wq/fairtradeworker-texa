import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Lightning, 
  Plus,
  Copy,
  Clock,
  TrendingUp,
  MessageCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface QuickResponsesPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function QuickResponsesPage({ user, onNavigate }: QuickResponsesPageProps) {
  const quickResponses = {
    common: [
      { id: 1, text: "Thanks! I'll get back to you shortly.", useCount: 120 },
      { id: 2, text: "I'm on my way. ETA 15 minutes.", useCount: 85 },
      { id: 3, text: "I've completed the work. Please review when convenient.", useCount: 65 },
      { id: 4, text: "I'll send the invoice shortly.", useCount: 45 },
    ],
    professional: [
      { id: 5, text: "Thank you for choosing our services. We appreciate your business.", useCount: 38 },
      { id: 6, text: "I've reviewed your project requirements and I'm confident we can deliver excellent results.", useCount: 29 },
      { id: 7, text: "Your satisfaction is our priority. Please don't hesitate to reach out with any concerns.", useCount: 22 },
    ],
    scheduling: [
      { id: 8, text: "I'm available tomorrow at 9 AM. Does that work?", useCount: 55 },
      { id: 9, text: "I can reschedule to next week if that's better for you.", useCount: 32 },
      { id: 10, text: "Running 10 minutes late. Will arrive shortly.", useCount: 28 },
    ],
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black dark:bg-white">
                <Lightning size={28} weight="duotone" className="text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Quick Responses</h1>
                <p className="text-base text-black/60 dark:text-white/60 mt-1">
                  One-tap responses for faster communication
                </p>
              </div>
            </div>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              <Plus size={20} className="mr-2" />
              Add Response
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Responses</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {Object.values(quickResponses).flat().length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Uses</p>
              <p className="text-2xl font-bold text-primary">
                {Object.values(quickResponses).flat().reduce((sum, r) => sum + r.useCount, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Time Saved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">8.2h</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Most Used</p>
              <p className="text-2xl font-bold text-black dark:text-white">120x</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-transparent dark:border-white">
            <TabsTrigger value="common" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Common ({quickResponses.common.length})
            </TabsTrigger>
            <TabsTrigger value="professional" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Professional ({quickResponses.professional.length})
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Scheduling ({quickResponses.scheduling.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="common" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickResponses.common.map((response) => (
                <Card key={response.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-sm text-black dark:text-white mb-3">{response.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                        <MessageCircle size={12} />
                        <span>Used {response.useCount} times</span>
                      </div>
                      <Button size="sm" variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="professional" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickResponses.professional.map((response) => (
                <Card key={response.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-sm text-black dark:text-white mb-3">{response.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                        <MessageCircle size={12} />
                        <span>Used {response.useCount} times</span>
                      </div>
                      <Button size="sm" variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickResponses.scheduling.map((response) => (
                <Card key={response.id} className="border-2 border-transparent dark:border-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-sm text-black dark:text-white mb-3">{response.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                        <MessageCircle size={12} />
                        <span>Used {response.useCount} times</span>
                      </div>
                      <Button size="sm" variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
