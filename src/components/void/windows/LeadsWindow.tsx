/**
 * VOID Leads Window - Lead management interface
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Funnel, Sparkle } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiating' | 'won' | 'lost'
  source: string
  value: number
  score: number
  createdAt: string
}

export function LeadsWindow() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Emily Chen',
      email: 'emily@example.com',
      phone: '(555) 111-2222',
      status: 'new',
      source: 'Website',
      value: 25000,
      score: 85,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      name: 'Robert Wilson',
      email: 'robert@example.com',
      phone: '(555) 222-3333',
      status: 'contacted',
      source: 'Referral',
      value: 18000,
      score: 72,
      createdAt: '1 day ago',
    },
    {
      id: '3',
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      phone: '(555) 333-4444',
      status: 'qualified',
      source: 'Social Media',
      value: 35000,
      score: 92,
      createdAt: '3 days ago',
    },
  ]

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-[#00f0ff] text-black',
      contacted: 'bg-[#8b5cf6] text-white',
      qualified: 'bg-[#10b981] text-white',
      proposal: 'bg-[#f59e0b] text-white',
      negotiating: 'bg-[#f59e0b] text-white',
      won: 'bg-[#10b981] text-white',
      lost: 'bg-gray-600 text-white',
    }
    return colors[status] || 'bg-gray-500 text-white'
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Leads</h2>
            <p className="text-sm text-gray-400">
              {filteredLeads.length} leads • {leads.filter(l => l.status === 'new').length} new
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10"
            >
              <Sparkle size={16} className="mr-2" />
              AI Scoring
            </Button>
            <Button
              className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
            >
              <Plus size={16} className="mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]" size={18} />
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-[#00f0ff]/30 text-white placeholder:text-gray-500 focus:border-[#00f0ff]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'new', 'contacted', 'qualified', 'proposal', 'negotiating', 'won', 'lost'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  statusFilter === status
                    ? getStatusColor(status)
                    : 'border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10',
                  'capitalize'
                )}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-4 rounded-xl border border-[#00f0ff]/20 bg-black/30",
                "hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 transition-all cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#00f0ff] flex items-center justify-center text-xl font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    {lead.status === 'new' && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00f0ff]"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{lead.name}</h3>
                      <Badge className={cn("text-xs", getStatusColor(lead.status))}>
                        {lead.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#8b5cf6] text-[#8b5cf6]">
                        Score: {lead.score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{lead.email}</span>
                      <span>•</span>
                      <span>{lead.phone}</span>
                      <span>•</span>
                      <span>{lead.source}</span>
                      <span>•</span>
                      <span>{lead.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#00f0ff]">
                      ${lead.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Est. Value</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No leads found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
