import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Handshake, 
  Heart,
  Star,
  ChatCircle,
  Calendar,
  Gift,
  Users
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface ManageRelationshipsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function ManageRelationshipsPage({ user, onNavigate }: ManageRelationshipsPageProps) {
  const relationships = [
    { 
      id: 1, 
      name: "John Smith", 
      type: "customer", 
      rating: 5, 
      interactions: 12, 
      lastContact: "2025-01-18",
      notes: "Prefers morning appointments",
      tags: ["reliable", "repeat-customer"]
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      type: "customer", 
      rating: 5, 
      interactions: 8, 
      lastContact: "2025-01-15",
      notes: "Interested in future projects",
      tags: ["potential-upsell"]
    },
    { 
      id: 3, 
      name: "Mike's Construction", 
      type: "partner", 
      rating: 4, 
      interactions: 5, 
      lastContact: "2025-01-10",
      notes: "Great for referrals",
      tags: ["partner", "referral-source"]
    },
  ]

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
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-black dark:bg-white">
              <Handshake size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Manage Relationships</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Build and maintain strong connections with customers and partners
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Relationships</p>
              <p className="text-2xl font-bold text-black dark:text-white">{relationships.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Avg. Rating</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(relationships.reduce((sum, r) => sum + r.rating, 0) / relationships.length).toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Interactions</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {relationships.reduce((sum, r) => sum + r.interactions, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4">
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Repeat Customers</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {relationships.filter(r => r.tags.includes('repeat-customer')).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Relationships List */}
        <div className="space-y-4">
          {relationships.map((rel) => (
            <Card key={rel.id} className="border-2 border-transparent dark:border-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-1">{rel.name}</h3>
                        <Badge variant="outline" className="border-transparent dark:border-white">
                          {rel.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            weight={i < rel.rating ? "fill" : "regular"}
                            className={i < rel.rating ? "text-yellow-500" : "text-black/20 dark:text-white/20"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-3">{rel.notes}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rel.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="bg-muted text-black dark:text-white"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60">
                      <div className="flex items-center gap-1">
                        <ChatCircle size={16} />
                        <span>{rel.interactions} interactions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Last: {rel.lastContact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Add Note
                    </Button>
                    <Button variant="outline" className="border-transparent dark:border-white text-black dark:text-white">
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
