import { motion } from "framer-motion"
import { User, MapPin, Star, MagnifyingGlass } from "@phosphor-icons/react"
import { GlassCard } from "@/components/ui/MarketingSections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ContractorDirectoryProps {
  onNavigate: (page: string) => void
}

export default function ContractorDirectory({ onNavigate }: ContractorDirectoryProps) {
  // Mock data for the directory
  const contractors = [
    { id: 1, name: "Mike's Plumbing", trade: "Plumber", location: "Austin, TX", rating: 4.9, jobs: 124 },
    { id: 2, name: "Elite Electric", trade: "Electrician", location: "Round Rock, TX", rating: 5.0, jobs: 89 },
    { id: 3, name: "Solid Foundations", trade: "General Contractor", location: "Austin, TX", rating: 4.8, jobs: 210 },
    { id: 4, name: "Color Perfect", trade: "Painter", location: "Pflugerville, TX", rating: 4.7, jobs: 56 },
    { id: 5, name: "Green Thumb Landscapes", trade: "Landscaper", location: "Austin, TX", rating: 4.9, jobs: 145 },
    { id: 6, name: "Roof Right", trade: "Roofer", location: "Georgetown, TX", rating: 4.8, jobs: 78 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Trusted Professionals</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Browse our directory of verified, zero-fee contractors.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input placeholder="Search by trade or name..." className="pl-10 h-12" />
          </div>
          <Button size="lg" className="h-12 px-8">Search</Button>
        </div>

        {/* Directory Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {contractors.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -5 }}>
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-700 dark:text-yellow-500 text-sm font-bold">
                    <Star weight="fill" /> {c.rating}
                  </div>
                </div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="text-primary font-medium mb-2">{c.trade}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin size={16} /> {c.location}
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{c.jobs} jobs completed</span>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('login')}>
                    View Profile
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
