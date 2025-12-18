/**
 * VOID Customers Window - Full customer management interface
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Upload } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'archived'
  value: number
  lastContact: string
}

export function CustomersWindow() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')

  // Mock data - replace with real data integration
  const customers: Customer[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      status: 'active',
      value: 45000,
      lastContact: '2 days ago',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(555) 234-5678',
      status: 'active',
      value: 32000,
      lastContact: '1 week ago',
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '(555) 345-6789',
      status: 'inactive',
      value: 15000,
      lastContact: '3 months ago',
    },
  ]

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || customer.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Customers</h2>
            <p className="text-sm text-gray-400">{filteredCustomers.length} customers</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10"
            >
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
            >
              <Plus size={16} className="mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]" size={18} />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-[#00f0ff]/30 text-white placeholder:text-gray-500 focus:border-[#00f0ff]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className={cn(
                selectedFilter === 'all'
                  ? 'bg-[#00f0ff] text-black'
                  : 'border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10'
              )}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('active')}
              className={cn(
                selectedFilter === 'active'
                  ? 'bg-[#10b981] text-white'
                  : 'border-[#10b981]/30 text-white hover:bg-[#10b981]/10'
              )}
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('inactive')}
              className={cn(
                selectedFilter === 'inactive'
                  ? 'bg-[#f59e0b] text-white'
                  : 'border-[#f59e0b]/30 text-white hover:bg-[#f59e0b]/10'
              )}
            >
              Inactive
            </Button>
            <Button
              variant={selectedFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('archived')}
              className={cn(
                selectedFilter === 'archived'
                  ? 'bg-gray-600 text-white'
                  : 'border-gray-600/30 text-white hover:bg-gray-600/10'
              )}
            >
              Archived
            </Button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-4 rounded-xl border border-[#00f0ff]/20 bg-black/30",
                "hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 transition-all cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center text-xl font-bold">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{customer.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          customer.status === 'active' && "border-[#10b981] text-[#10b981]",
                          customer.status === 'inactive' && "border-[#f59e0b] text-[#f59e0b]",
                          customer.status === 'archived' && "border-gray-500 text-gray-400"
                        )}
                      >
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{customer.email}</span>
                      <span>•</span>
                      <span>{customer.phone}</span>
                      <span>•</span>
                      <span>Last contact: {customer.lastContact}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#00f0ff]">
                      ${customer.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Value</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No customers found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
